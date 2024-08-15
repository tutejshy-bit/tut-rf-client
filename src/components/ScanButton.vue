<template>
    <Button v-if="isAnyDetect" @click="requestIdle()" v-bind="$attrs" severity="danger">
        <e-icon icon="stop-circle-outline" size="small" prepended /> Stop scan
    </Button>
    <Button :disabled="!moduleAvailable" @click="scan" :model="actions" severity="info" outlined size="small" class="font-medium" v-else>
        <e-icon icon="power" size="small" prepended /> Scan
    </Button>
</template>

<script>
import { DeviceController } from '@/controllers/device'
import { computed } from 'vue'
import { State } from '@/types'
import { useStore } from '@/store/store'

export default {
    props: {
        minRssi: {
            type: Number,
            default: 65
        }
    },
    setup(props) {
        const { requestIdle, requestScan } = DeviceController();
        const store = useStore();
        const rssi = computed(() => (props.minRssi * -1));

        const cc1101count = computed(() => store.deviceMode.cc1101.length);
        const isAnyIdle = computed(() => {
            Object.values(store.deviceMode.cc1101).includes(State.Device.Idle);
        });

        const isAnyDetect = computed(() => {
            Object.values(store.deviceMode.cc1101).includes(State.Device.DetectSignal);
        });

        const moduleAvailable = () => {
            const module = store.state.detector.settings.module;
            if (module == -1) {
                for(cc1101State of store.state.cc1101) {
                    if (cc1101State.mode == State.Device.Idle) {
                        return true;
                    }
                }
            } else {
                if (store.state.cc1101[module] != undefined && store.state.cc1101[module].mode == State.Device.Idle) {
                    return true;
                }
            }

            return false;
        }

        const scan = () => requestScan(store.state.detector.settings.module, rssi.value);

        const actions = [
            {
                label: 'Scan And Stop',
                command: scanFirst
            }
        ];
        return {
            actions,
            State,
            scan,
            requestIdle,
            store,
            isAnyIdle,
            isAnyDetect,
            moduleAvailable,
        }
    }
}
</script>
