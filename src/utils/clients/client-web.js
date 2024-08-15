import HttpAdapter from "@/lib/adapters/http-adapter";
import serverSideEventsAdapter from "@/lib/adapters/server-side-events-adapter";

const adapter = new HttpAdapter();

export default class WebClient {
    baseUrl;

    constructor(baseUrl)
    {
        this.baseUrl = baseUrl;
        this.serverSideEventsAdapter = new serverSideEventsAdapter();
    }

    getClientName() {
        return 'Web';
    }

    init(onReceiveCallback, onDisconnectCallback, onErrorCallback, onSendCallback = () => {}) {
        this.serverSideEventsAdapter.init(onReceiveCallback, onDisconnectCallback, onErrorCallback);
    }

    connect(onConnect) {
        this.serverSideEventsAdapter.connect(`${this.baseUrl}/events`, onConnect);
    }

    disconnect() {
        this.serverSideEventsAdapter.disconnect();
    }

    async getState()
    {
        await adapter.get(`${this.baseUrl}/getstate`);
    }

    async getFilesList(path = '')
    {
        const params = {};
        if (path !== '') {
            params['path'] = path;
        }
        await adapter.get(`${this.baseUrl}/file/list`, params);
    }

    async transmitBinary(frequency, pulseDuration, data, module, modulation,  deviation,  repeatCount)
    {
        let params = {
            frequency: frequency,
            pulseDuration: pulseDuration,
            data: data,
            repeatCount: repeatCount,
            module: module,
            modulation: modulation,
            deviation: deviation
        };
        adapter.get(`${this.baseUrl}/transmit/binary`, params);
    }

    async transmitFromFile(path) {
        adapter.get(`${this.baseUrl}/transmit/file`, {file: path});
    }

    async transmit(type, frequency, data, module, modulation = null, deviation = null, preset = null, filename = null, repeatCount)
    {
        let params = {
            type: type,
            frequency: frequency,
            data: data,
            module: module,
            repeatCount: repeatCount,
        };
        if (modulation !== null) {
             params['modulation'] = modulation;
        }
        if (deviation !== null) {
            params['deviation'] = deviation;
        }
        if (preset !== null) {
            params['preset'] = preset;
        }
        adapter.get(`${this.baseUrl}/transmit/signal`, params);
    }

    async requestRecord(frequency, preset, module, modulation, deviation, bandwidth, dataRate)
    {
        let params = {
            frequency: frequency,
        };
        if (preset) params.preset = preset;
        if (module) params.module = module;
        if (modulation) params.modulation = modulation;
        if (deviation) params.deviation = deviation;
        if (bandwidth) params.rxbandwidth = bandwidth;
        if (dataRate) params.datarate = dataRate;

        return await adapter.get(`${this.baseUrl}/record`, params);
    }

    async requestScan(module, minRssi)
    {
        const params = {};

        if (minRssi !== null) {
            params.minrssi = minRssi;
        }
        if (module !== null) {
            params.module = module;
        }
        adapter.get(`${this.baseUrl}/detect`, params);
    }

    async requestIdle(module)
    {
        adapter.get(`${this.baseUrl}/idle`, {module: module});
    }

    async loadFileData(path)
    {
        await adapter.get(`${this.baseUrl}/file/get`, {  file: path  });
    }

    async createDirectory(path)
    {
        await adapter.get(`${this.baseUrl}/file/create-directory`, { path: path });
    }

    async remove(path)
    {
        await adapter.get(`${this.baseUrl}/file/delete`, { path: path });
    }

    async rename(from, to)
    {
        await adapter.get(`${this.baseUrl}/file/rename`, { from: from, to: to});
    }

    async upload(file)
    {
        await adapter.upload(`${this.baseUrl}/upload`, file);
    }
}
