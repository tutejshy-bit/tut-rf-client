export default class SerialAdapter {
    constructor() {
        this.worker = null;
    }

    async connect(config, onConnect, onDisconnect, onMessage, onError, onSend) {
        await navigator.serial.requestPort({filters: [{usbVendorId: 6790, usbProductId: 29987}]});

        this.worker = new Worker(new URL('./serial-worker.js', import.meta.url));

        this.worker.onmessage = (event) => {
            if (event.data.type === 'data') {
                onMessage(this.parseResponse(event.data.payload));
            } else if (event.data.type === 'end') {
                onDisconnect();
            } else if (event.data.type === 'error') {
                onError('Error', event.data.payload);
            } else if (event.data.type === 'connected') {
                onConnect();
            } else if (event.data.type === 'command') {
                onSend(event.data.command);
            }
        };

        this.worker.postMessage({ type: 'start', config: config });
    }

    disconnect() {
        this.worker.postMessage({ type: 'stop' });
    }

    sendCommand(command) {
        this.worker.postMessage({ type: 'send', message: command });
    }

    isRunning() {
        if (this.worker === null) {
            throw 'Serial port communication worker is not running'
        }
    }

    parseResponse(message) {
        const response = { messageStart: 0, type: 'raw', message: '' };

        if (message.startsWith('Event: ')) {
            response.type = 'event';
            response.messageStart = 7;
        }

        if (message.startsWith('Response: ')) {
            response.type = 'response';
            response.messageStart = 10;
        }

        try {
            if (response.type === 'raw') {
                response.message = message;
            } else {
                response.message = JSON.parse(message.substring(response.messageStart));
            }
        } catch (error) {
            response.message = message.substring(response.messageStart);
        }
        return response;
    }
}
