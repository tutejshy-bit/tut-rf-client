import SerialAdapter from '@/lib/adapters/serial-adapter'

const adapter = new SerialAdapter();

export default class SerialClient {
    constructor(config) {
        //{baudRate: 115200}
        this.config = config;
        this.onResponse = [];
    }

    getClientName() {
        return 'Serial';
    }

    init(onReceiveCallback, onDisconnectCallback, onErrorCallback, onSendCallback = () => { }) {
        this.onReceive = onReceiveCallback;
        this.onDisconnect = onDisconnectCallback
        this.onError = onErrorCallback;
        this.onSend = onSendCallback;
    }

    async connect(onConnect) {
        await adapter.connect(this.config, onConnect, this.onDisconnect, (message) => this.onMessage(message), this.onError, this.onSend);
    }

    onMessage(message) {
        if (message === null) return;

        if (message.type === 'response') {
            if (this.onResponse !== null) {
                this.onReceive(message)
                const onResponseCallback = this.onResponse.shift();
                onResponseCallback(message.message);
            } else {
                this.onError('Unhandled response', { message: message.message })
            }
        }

        if (message.type === 'event') {
            this.onReceive(message);
        }

        if (message.type === 'raw') {
            this.onReceive(message);
        }
    }

    disconnect() {
        adapter.disconnect();
    }

    async getState() {
        adapter.isRunning();
        adapter.sendCommand('state');
    }

    async getFilesList(path = '', callback) {
        adapter.isRunning();
        this.onResponse.push(callback);

        let command = 'files';
        if (path.length > 0) {
            command += ' "' + path + '"';
        }

        adapter.sendCommand(command);
    }

    async transmitBinary(frequency, pulseDuration, data, module, modulation, deviation, repeatCount = 1, callback = () => { }) {
        adapter.isRunning();
        this.onResponse.push(callback);
        adapter.sendCommand(`transmit -f ${frequency} -p ${pulseDuration} -b "${data}" -a ${module} -m ${modulation} -d ${deviation} -r ${repeatCount}`);
    }

    async requestRecord(frequency, preset, module, modulation, deviation, bandwidth, dataRate) {
        adapter.isRunning();
        let command = '';

        if (preset !== null) {
            command = `record -f ${frequency} -p ${preset}`;
        } else {
            command = `record -f ${frequency}`;
            if (module !== null) command += ` -a ${module}`;
            if (modulation !== null) command += ` -m ${modulation}`;
            if (deviation !== null) command += ` -d ${deviation}`;
            if (bandwidth !== null) command += ` -b ${bandwidth}`;
            if (dataRate !== null) command += ` -r ${dataRate}`;
        }

        adapter.sendCommand(command);
    }

    async requestScan(module, minRssi) {
        adapter.isRunning();

        let command = 'detect';
        if (minRssi !== null) command += ` -r ${minRssi}`;
        if (module !== null) command += ` -m ${module}`;

        adapter.sendCommand(command);
    }

    async transmitFromFile(path) {
        adapter.isRunning();
        let command = `transmit -t file -s "${path}"`;
        adapter.sendCommand(command);
    }

    async transmit(type, frequency, data, module, modulation = null, deviation = null, preset = null, repeatCount)
    {
        adapter.isRunning();

        let command = `transmit -f ${frequency} -t ${type} -d "${data}" -a ${module} -r ${repeatCount}`;
        if (modulation !== null) command += ` -m ${modulation}`;
        if (deviation !== null) command += ` -d ${deviation}`;
        if (preset !== null) command += ` -p ${preset}`;

        adapter.sendCommand(command);
    }

    async requestIdle(module) {
        adapter.isRunning();
        adapter.sendCommand(`idle -m ${module}`);
    }

    async loadFileData(path) {
        adapter.isRunning();
        adapter.sendCommand(`files get "${path}"`);
    }

    async createDirectory(path, callback) {
        adapter.isRunning();
        this.onResponse.push(callback);
        adapter.sendCommand(`files create-directory "${path}"`);
    }

    async remove(path, callback) {
        adapter.isRunning();
        this.onResponse.push(callback);
        adapter.sendCommand(`files delete "${path}"`);
    }

    async rename(from, to, callback) {
        adapter.isRunning();
        this.onResponse.push(callback);
        adapter.sendCommand(`files rename "${from}" "${to}"`);
    }

    async upload(file, callback) {
        adapter.isRunning();
        const reader = new FileReader();
        reader.onload = (event) => {
            this.onResponse.push(callback);
            adapter.sendCommand(`upload -n ${file.name} "${event.target.result}"`);
        }
        reader.onerror =() => this.onError('Error while uploading file', { file: file.name });
        reader.onabort = () => this.onError('File upload aborted', { file: file.name });
        reader.readAsText(file);
    }
}
