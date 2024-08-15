var port;
var message = '';

self.onmessage = async (event) => {
    if (event.data.type === 'start') {
        try {
            port = await getSerialPort(event.data.config);
            if (port) {
                readFromSerial(port, 
                    (data) => self.postMessage({ type: 'data', payload: data }),
                    () => self.postMessage({ type: 'end' })
                );
            }
            setTimeout(() => {
                message = '';
                self.postMessage({ type: 'connected'});
                self.postMessage({ type: 'data', payload: "Event: " + JSON.stringify({type: 'DeviceStatus', data: 'connected'})});
            }, 1);
        } catch (error) {
            self.postMessage({ type: 'error', payload: error.message });
        }
    } else if (event.data.type === 'stop') {
        if (port) {
            port.close();
            self.postMessage({ type: 'end' });
        }
    } else if (event.data.type === 'clear') {
        message = '';
    } else if (event.data.type === 'send') {
        if (!port) {
            return;
        }
        try {
            writeToSerial(port, event.data.message);
        } catch (error) {
            self.postMessage({ type: 'error', payload: error.message });
        }
    }
};

async function getSerialPort(config) {
    if ('serial' in navigator) {
        try {
            
            const ports = await navigator.serial.getPorts();
            let portInfo;
            let selectedPort = null;
            
            for (port of ports) {
                portInfo = port.getInfo();
                if (Object.keys(portInfo).length === 0) {
                    continue;
                }
                if (portInfo.usbProductId !== undefined && portInfo.usbProductId == 29987) {
                    selectedPort = port;
                }
            }
            if (selectedPort === null) {
                throw new Error('Port not found');
            }
            await selectedPort.open(config);
            return selectedPort;
        } catch (err) {
            throw new Error('Failed to open serial port: ' + err.message);
        }
    } else {
        throw new Error('Web Serial API not supported in this browser.');
    }
}

async function readFromSerial(port, onData, onEnd) {
    const reader = port.readable.getReader();
    const decoder = new TextDecoder();

    message = '';

    try {
        while (true) {
            // Wait till reading something from serial port
            const { value, done } = await reader.read();
            if (done) {
                onEnd();
                reader.releaseLock();
                break;
            }

            // Decode readed string
            const chunk = decoder.decode(value);
            if (chunk === undefined) {
                continue;
            }

            // Append chunk to the current message
            message += chunk;

            // Split the message by line endings
            const lines = message.split("\r\n");

            // Process all complete messages except the last one (which might be incomplete)
            for (let i = 0; i < lines.length - 1; i++) {
                if (lines[i] !== '') {
                    onData(lines[i]);
                }
            }

            // The last element in the array is either a complete message or an incomplete message
            message = lines[lines.length - 1];
        }
    } catch (err) {
        self.postMessage({ type: 'error', payload: 'Error reading from serial port: ' + err.message });
    } finally {
        reader.releaseLock();
    }
}

async function writeToSerial(port, data) {
    const writer = port.writable.getWriter();
    const encoder = new TextEncoder();
    try {
        await writer.write(encoder.encode(data + "\r\n"));
        self.postMessage({ type: 'command', command: data});
    } catch (err) {
        self.postMessage({ type: 'error', payload: 'Error writing to serial port: ' + err.message });
    } finally {
        writer.releaseLock();
    }
}
