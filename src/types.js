export const MessageType = {
    FrequencyDetector: 'Frequency Detector',
    Device: 'Device',
    Filesystem: 'Filesystem',
    Recorder: 'Recorder',
    Transmitter: 'Transmitter',
    Network: 'Network',
    Response: 'Response',
    Request: 'Request',
}

export const Action = {
    Device: {
        ModeSwitch: 'ModeSwitch',
        SignalDetected: 'SignalDetected',
        DeviceStatus: 'DeviceStatus',
        SignalRecorded: 'SignalRecorded',
        SignalSent: 'SignalSent',
        SignalSendingError: 'SignalSendingError',
        Response: 'Response',
        Request: 'Request',
        State: 'State',
        Filesystem: 'FileSystem',
    },
    Filesystem: {
        List: 'list',
        Rename: 'rename',
        CreateDirectory: 'create-directory',
        Delete: 'delete',
        Upload: 'upload',
        LoadFile: 'load',
        Unknown: 'unknown',
    },
}

export const State = {
    Device: {
        Idle: 'Idle',
        DetectSignal: 'DetectSignal',
        RecordSignal: 'RecordSignal',
        SendSignal: 'SendSignal',
        Unknown: 'Unknown',    

    }
}

export const Adapter = {
    Web: 'web',
    Serial: 'serial',
    Bluetooth: 'bluetooth',
}

export default MessageType
