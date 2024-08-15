import mitt from 'mitt'

const emitter = mitt();

class Channel {
    constructor(channel) {
        this.channel = channel;
    }

    send(message, data = '', type = '', action = '') {
        emitter.emit(this.channel, {message: message, data: data, type: type, action: action})
    }
    listen(fn) {
        emitter.on(this.channel, fn)
    }
}

const channelSuccess = new Channel('channel-success');
const channelInfo = new Channel('channel-info');
const channelError = new Channel('channel-error');
const channelWarn = new Channel('channel-warn');
const channelDebug = new Channel('channel-debug');

export { channelSuccess, channelInfo, channelError, channelWarn, channelDebug, emitter }
