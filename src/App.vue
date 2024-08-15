<template>
  <router-view />
  <Dialog v-model:visible="showConnectionWindow" header="Connect to device" :style="{ width: '25rem' }"
    position="top" :modal="true" :closable="false" :draggable="false">
    Serial connection is in experimental mode.<br><br>
    <Button class="mr-4" type="button" label="Web" @click="connect(Adapter.Web)"></Button>
    <Button class="mr-4" type="button" label="Serial" @click="connect(Adapter.Serial)"></Button>
  </Dialog>
</template>
<script>
import { Adapter } from '@/types'
import getAdapter from '@/utils/device-connector'
import { DeviceController } from '@/controllers/device'
import { ref, watch } from 'vue'
import { useStore } from '@/store/store'

export default {
  setup() {
    const { state } = useStore();
    const { onReceive, onDisconnect, onError, onConnect, setDeviceAdapter, onSend } = DeviceController();
    const showConnectionWindow = ref(!state.connected);
    watch(() => state.connected, (connected) => {showConnectionWindow.value = !connected});

    const connect = async (adapterName) => {
      const adapter = getAdapter(adapterName);
      adapter.init(onReceive, onDisconnect, onError, onSend);
      adapter.connect(onConnect);
      setDeviceAdapter(adapter);
    }

    return {
      Adapter,
      showConnectionWindow,
      connect,
    }
  }
}
</script>
<style>
html {
  font-size: 13px;
}
</style>
