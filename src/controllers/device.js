import {Action, MessageType, State} from '@/types'

import { channelSuccess, channelError, channelInfo, channelWarn, channelDebug } from '@/utils/notifications/events'
import { useToast } from 'primevue/usetoast'
import { useStore } from '@/store/store'
import { computed } from 'vue'
import {emitter} from "@/utils/notifications/events";

const useDevice = () => {
    const toast = useToast();
    const store = useStore();
    let deviceAdapter = null;

    const callbacks = {
        filesList: [],
        fileLoad: [],
    };

    emitter.on('channel-success', (eventData) => toast.add({severity: "success", summary: eventData.type ?? '', detail: eventData.message, life: 4000}));
    emitter.on('channel-info', (eventData) => toast.add({severity: "info", summary: eventData.type ?? '', detail: eventData.message, life: 4000}));
    emitter.on('channel-error', (eventData) => toast.add({severity: "error", summary: eventData.type ?? '', detail: eventData.message, life: 4000}));
    emitter.on('channel-warn', (eventData) => toast.add({severity: "warn", summary: eventData.type ?? '', detail: eventData.message, life: 4000}));

    const onData = ({type, data}) => {
        switch (type) {
            case Action.Device.State:
                updateState(data);
                channelDebug.send('Device state received', data, Action.Device.State)
                break;
            case Action.Device.SignalDetected:
                data.frequency = parseFloat(data.frequency);
                data.rssi = parseInt(data.rssi);
                updateDetector(data);
                channelInfo.send(`Detected frequency ${data.frequency.toFixed(2)}`, data, MessageType.FrequencyDetector, Action.Device.SignalDetected)
                break;
            case Action.Device.ModeSwitch:
                updateMode(data);
                requestState();
                channelDebug.send(`Device cc1101:${data.module+1} mode switched from '${data.previousMode}' to '${data.mode}'`, data, MessageType.Device, Action.Device.ModeSwitch)
                break;
            case Action.Device.DeviceStatus:
                if (data === 'connected') {
                    requestState();
                    channelInfo.send('Connected to Device', '', MessageType.Device, Action.Device.DeviceStatus)
                }
                break;
            case Action.Device.SignalSendingError:
                channelError.send(`Error sending signal: ${data.error}`, data, MessageType.Transmitter, Action.Device.SignalSendingError)
                break;
            case Action.Device.SignalRecorded:
                addRecordedFile(data.filename);
                break;
            case Action.Device.SignalSent:
                const sentObject = data.file ? data.file : data.message;
                requestState();
                channelSuccess.send(`Signal sent: ${sentObject}`, data, MessageType.Transmitter, Action.Device.SignalSent)
                break;
            case Action.Device.Filesystem:
                updateFilesystem(data);
                break;
            default:
                channelDebug.send("Event handler not found for '" + type + "'", data, MessageType.Device);
        }
    }

    const setDeviceAdapter = (adapter) => deviceAdapter = adapter;

    const deleteRuntimeFileIfExists = (path) => {
        store.state.recorded.runtime.files.forEach((file, index) => {
            if (file.filename === path) {
                store.state.recorded.runtime.files.splice(index, 1);
                store.state.recorded.signals.changed = true;
            }
        });
    }

    const renameRuntimeFileIfExists = (from, to) => {
        store.state.recorded.runtime.files.forEach((file) => {
            if (file.filename === from) {
                file.filename = to;
                store.state.recorded.signals.changed = true;
            }
        });
    }

    const updateFilesystem = (data) => {
        if (!data.action) {
            channelWarn.send('Filesystem event without action received', data, MessageType.Filesystem, Action.Filesystem.Unknown);
        }

        switch(data.action) {
            case Action.Filesystem.CreateDirectory:
                if (data.success === true) {
                    channelInfo.send('Directory created', data, MessageType.Filesystem, Action.Filesystem.CreateDirectory);
                } else {
                    channelWarn.send('Directory not created', data, MessageType.Filesystem, Action.Filesystem.CreateDirectory);
                }
                break;
            case Action.Filesystem.Delete:
                if (data.success === true) {
                    channelInfo.send('Delete success', data, MessageType.Filesystem, Action.Filesystem.Delete);
                    deleteRuntimeFileIfExists(data.path);
                } else {
                    channelInfo.send('Delete failed', data, MessageType.Filesystem, Action.Filesystem.Delete);
                }
                break;
            case Action.Filesystem.List:
                store.state.recorded.signals.files = [];
                store.state.recorded.signals.files = data.files;
                store.state.recorded.signals.loaded = true;
                store.state.recorded.signals.changed = false;
                if (callbacks.filesList.length > 0) callbacks.filesList.shift()();
                break;
            case Action.Filesystem.Rename:
                if (data.success === true) {
                    channelInfo.send('Rename success', data, MessageType.Filesystem, Action.Filesystem.Rename);
                    renameRuntimeFileIfExists(data.from, data.to);
                } else {
                    channelInfo.send('Rename failed', data, MessageType.Filesystem, Action.Filesystem.Rename);
                }
                break;
            case Action.Filesystem.LoadFile:
                if (data.error !== undefined) {
                    channelError.send('Error loading file data', {file: data.path, error: data.error}, MessageType.Filesystem, Action.Filesystem.LoadFile)();
                    return;
                }

                store.state.files[data.path] = data.content;
                if (callbacks.fileLoad.length > 0) callbacks.fileLoad.shift()();
                break;
            default:
                channelWarn.send('Unknown Filesystem action received', data, MessageType.Filesystem, Action.Filesystem.Unknown);
        }
    }

    const getReadableDate = (date) => {
        return date.toLocaleDateString(navigator.language, {
            year: 'numeric',
            day: '2-digit',
            month: 'long',
            localeMatcher: 'best fit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    const updateDetector = (data) => {
        const id = store.state.detector.detectedFrequencies.length + 1;
        const date = new Date();
        store.state.detector.detectedFrequencies.unshift({
            module: data.module,
            frequency: data.frequency,
            rssi: data.rssi,
            time: getReadableDate(date),
            id: id
        });
    }

    const updateMode = (data) => {
        store.state.cc1101[data.module].mode = data.mode;
    }

    const addRecordedFile = (filename) => {
        for (const file of store.state.recorded.runtime.files) {
            if (file.filename === filename) return;
        }
        const date = new Date();
        store.state.recorded.runtime.files.push({
            filename: filename,
            date: getReadableDate(date)
        })
        store.state.recorded.signals.changed = true;
    }

    const requestScan = async (module, minRssi = null) => {
        if (!store.isConnected) {
            channelWarn.send('Can not perform aciton. Device is no connected');
            return;
        }

        try {
            deviceAdapter.requestScan(module, minRssi);
        } catch(error) {
            channelError.send('Error request to switch mode to Scan', error);
        }
    }

    const requestRecord = async (data) => {
        if (!store.isConnected) {
            channelWarn.send('Can not perform aciton. Device is no connected');
            return;
        }

        let frequency = data.frequency;
        let preset = null;
        let module = null;
        let modulation = null;
        let deviation = null;
        let bandwidth = null;
        let dataRate = null;

        if (data.preset !== undefined) preset = data.preset;
        if (data.module !== undefined) module = data.module;
        if (data.modulation !== undefined) modulation = data.modulation;
        if (data.deviation !== undefined) deviation = data.deviation;
        if (data.bandwidth !== undefined) bandwidth = data.bandwidth;
        if (data.dataRate !== undefined) dataRate = data.dataRate;


        try {
            const response = await deviceAdapter.requestRecord(frequency, preset, module, modulation, deviation, bandwidth, dataRate);
            if (response != undefined && response.error != undefined) {
                throw response;
            }
        } catch(error) {
            channelError.send('Error request to switch mode to RecordSignals', error, MessageType.Recorder, Action.Device.ModeSwitch);
        }
    }

    const requestIdle = async (module) => {
        if (!store.isConnected) {
            channelWarn.send('Can not perform aciton. Device is no connected');
            return;
        }

        try {
            deviceAdapter.requestIdle(module);
        } catch(error) {
            channelError.send('Error request to switch mode to Idle', error);
        }
    }

    const updateState = (response) => {
        store.state.device.freeHeap = response.device.freeHeap;
        for(const module of response.cc1101) {
            store.state.cc1101[module.id] = {
                id: module.id,
                mode: module.mode,
                settings: module.settings,
            }
        }
        
    }

    const requestState = async () => {
        if (!store.isConnected) {
            channelWarn.send('Can not perform aciton. Device is no connected');
            return;
        }

        try {
            deviceAdapter.getState();
        } catch(error) {
            channelError.send('Error requesting state', error);
        }
    }

    const requestRecordedSignals = async (successCallback) => {
        if (!store.isConnected) {
            channelWarn.send('Can not perform aciton. Device is no connected');
            return;
        }
        
        if (typeof successCallback === 'function') callbacks.filesList.push(successCallback);

        try {
            deviceAdapter.getFilesList('')
        } catch(error) {
            channelError.send('Error getting files list', error);
        }
    }

    const transmitBinary = (frequency, pulseDuration, data, module, modulation, deviation, repeatCount) => {
        if (!store.isConnected) {
            channelWarn.send('Can not perform aciton. Device is no connected');
            return;
        }

        try {
            deviceAdapter.transmitBinary(frequency, pulseDuration, data, module, modulation, deviation, repeatCount)
        } catch(error) {
            channelError.send('Error sending request for transmit binary data', error);
        }
    }

    const transmit = (type, data) => {
        if (!store.isConnected) {
            channelWarn.send('Can not perform aciton. Device is no connected');
            return;
        }

        let frequency = data.frequency;
        let signalData = data.data;
        let preset = null;
        let module = null;
        let modulation = null;
        let deviation = null;
        let repeat = 1;

        if (data.preset !== undefined) preset = data.preset;
        if (data.module !== undefined) module = data.module;
        if (data.modulation !== undefined) modulation = data.modulation;
        if (data.deviation !== undefined) deviation = data.deviation;
        if (data.repeat !== undefined) repeat = data.repeat;

        try {
            deviceAdapter.transmit(type, frequency, signalData, module, modulation, deviation, preset, repeat)
        } catch(error) {
            channelError.send('Error sending request for transmit data', error);
        }
    }

    const loadFileData = (path, callback) => {
        if (!store.isConnected) {
            channelWarn.send('Can not perform aciton. Device is no connected');
            return;
        }

        try {
            if (typeof callback === 'function') callbacks.fileLoad.push(callback);
            deviceAdapter.loadFileData(path)
        } catch(error) {
            channelError.send('Error loading file data', {file: path, error: error}, MessageType.Filesystem, Action.Filesystem.LoadFile)
        }
    }

    const createDirectory = (path) => {
        if (!store.isConnected) {
            channelWarn.send('Can not perform aciton. Device is no connected');
            return;
        }

        try {
            deviceAdapter.createDirectory(path);
        } catch(error) {
            channelError.send('Error creating directory', {path: path, error: error}, MessageType.Filesystem, Action.Filesystem.CreateDirectory);
        }
    }

    const rename = async (from, to) => {
        if (!store.isConnected) {
            channelWarn.send('Can not perform aciton. Device is no connected');
            return;
        }

        try {
            deviceAdapter.rename(from, to);
        } catch(error) {
            channelError.send('Error renaming', {from: from, to: to, error: error}, MessageType.Filesystem, Action.Filesystem.Rename);
        }
    }

    const remove = async (path) => {
        if (!store.isConnected) {
            channelWarn.send('Can not perform aciton. Device is no connected');
            return;
        }

        try {
            deviceAdapter.remove(path);
        } catch(error) {
            channelError.send('Error deleting', {path: path, error: error}, MessageType.Filesystem, Action.Filesystem.Delete);
        }
    }

    const upload = async (file) => {
        if (!store.isConnected) {
            channelWarn.send('Can not perform aciton. Device is no connected');
            return;
        }

        const responseHandler = (response) => {
            if (response.success === true) {
                channelInfo.send('Upload success', response, MessageType.Filesystem, Action.Filesystem.Upload);
                store.state.recorded.signals.changed = true;
            } else {
                channelInfo.send('Upload failed', response, MessageType.Filesystem, Action.Filesystem.Upload);
            }
        }
        try {
            deviceAdapter.upload(file, responseHandler);
        } catch(error) {
            channelError.send('Error uploading', {file: file, error: error}, MessageType.Filesystem, Action.Filesystem.Upload);
        }
    }

    const transmitFromFile = async (path) => {
        if (!store.isConnected) {
            channelWarn.send('Can not perform aciton. Device is no connected');
            return;
        }

        try {
            deviceAdapter.transmitFromFile(path)
        } catch(error) {
            channelError.send('Error sending request for transmit from file', error);
        }
    }

    const onDisconnect = () => {
        store.state.connected = false;
    }

    const onConnect = () => {
        store.state.connected = true;
    }

    const onError = (message, data) => {
        channelWarn.send(message, data, MessageType.Device)
        requestState();
    }

    const onReceive = ({type, message}) => {
        channelDebug.send(`Received ${type} message`, message, MessageType.Response, Action.Device.Response)

        if (type === 'event') {
            onData(message);
        } 
    }

    const onSend = (data) => {
        channelDebug.send('Sending:', data, MessageType.Request, Action.Device.Request);
    }

    const isConnected = computed(() => store.isConnected());

    return {
        isConnected,
        createDirectory,
        loadFileData,
        transmitBinary,
        transmit,
        requestRecordedSignals,
        requestState,
        requestIdle,
        requestRecord,
        requestScan,
        rename,
        remove,
        upload,
        setDeviceAdapter,
        onReceive,
        onDisconnect,
        onError,
        onConnect,
        onSend,
        transmitFromFile,
    }
}

let deviceControllerInstance;

export const DeviceController = () => {
    if (!deviceControllerInstance) {
        deviceControllerInstance = useDevice();
    }
    return deviceControllerInstance;
};