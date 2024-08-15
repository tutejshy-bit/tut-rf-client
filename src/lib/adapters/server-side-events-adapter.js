
export default class ServerSideEventsAdapter {
  init(onReceiveCallback, onDisconnectCallback, onErrorCallback) {
    this.onReceive = onReceiveCallback;
    this.onDisconnect = onDisconnectCallback;
    this.onError = onErrorCallback;
  }

  connect(address, onConnect) {
    this.disconnect();
    this.events = new EventSource(
      address,
      { withCredentials: false }
    );

    this.events.onopen = onConnect;
    this.events.onerror = (event) => this.onError({ message: 'EventSource error', error: event });

    this.events.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onReceive({type: 'event', message: data});
      } catch (error) {
        if (this.events.readyState == 2) {
          this.onDisconnect();
        }
        this.onError({ message: 'Error handling event', error: error });
      }
    };
  }

  disconnect() {
    if (this.events)
      this.events.close();
  }
}