<template>
    <Panel toggleable class="mt-2" collapsed>
        <template #header>
            <span class="text-nowrap">
                <e-icon icon="radar" size="small" class="text-green-500" prepended /> <span class="align-top">Detector</span>
            </span>
            <span class="w-max content-end" v-if="store.detectedFrequencies.length > 0">
                    {{ store.detectedFrequencies[0].frequency.toFixed(2) }}
                    <Button text size="small" @click="selectFrequency(store.detectedFrequencies[0].frequency.toFixed(2))" class="p-0">
                        <template #icon>
                            <e-icon icon='cog-play-outline' size="small" />
                        </template>
                    </Button>

            </span>
        </template>

        <template #icons>
            <Button v-if="!isAnyDetect" severity="info" text outlined size="small" type="button" :disabled="getAvailableModule == 0" @click="scan"  class="mx-1">
                <e-icon icon="power" size="x-small" prepended /> Scan
            </Button>
            <Button v-else severity="danger" size="small" type="button" @click="idle" outlined  class="mx-1">
                <e-icon icon="stop-circle-outline" size="x-small" prepended /> Stop scan
            </Button>
            <Button type="button" severity="info" text outlined size="small" class="ml-1 mr-2"
                @click="detectorSettingsPanelToogle">
                <e-icon icon="cog" size="x-small"></e-icon>
            </Button>
            <OverlayPanel ref="detectorSettingsPanel" class="w-96">
                <div class="flex align-items-center p-2">
                    <RadioButton v-model="store.state.detector.settings.module" inputId="first-available" name="module"
                        :value="-1" />
                    <label for="first-available" class="ml-2 cursor-pointer">First available</label>
                </div>
                <template v-for="module in store.cc1101Modules">
                    <div class="flex align-items-center p-2">
                        <RadioButton v-model="store.state.detector.settings.module" :inputId="module.key" name="module"
                            :value="module.id" :disabled="store.deviceMode.cc1101[module.id] !== State.Device.Idle" />
                        <label :for="module.key" class="ml-2 cursor-pointer">{{ module.name }}</label>
                    </div>
                </template>
                <div class="flex-row grow mt-4">
                    <div class="w-full max-w-80">
                        <Slider :disabled="store.deviceMode.cc1101[0] !== State.Device.Idle" v-model="minRssi" :min="0"
                            :max="100" class="w-full" /> minRssi {{ minRssi }}
                    </div>
                </div>
            </OverlayPanel>
        </template>
        <div v-if="store.detectedFrequencies.length > 0" class="w-full flex justify-end">
            <Button outlined size="small" severity="info" label="Clear" @click="store.clearDetectedFrequencies"  class="">
                <template #icon>
                    <e-icon icon="trash-can-outline" size="x-small" prepended />
                </template>
            </Button>
        </div>
        <DataTable :class="{ 'text-xs': mobile }" v-if="store.detectedFrequencies.length > 0" data-key="frequency"
            :value="store.detectedFrequencies" scrollable scrollHeight="180px" striped-rows class="w-full">
            <Column field="id" header="#" class="w-2"></Column>
            <Column field="frequency" header="Frequency" class="w-10">
                <template #body="{ data }">
                    {{ data.frequency.toFixed(2) }}
                </template>
            </Column>
            <Column header="Rssi" class="w-20">
                <template #body="{ data }">
                    <SignalStrengthIcon :rssi="data.rssi" :size="mobile ? 'x-small' : 'small'" />
                    <span class="align-top">{{ Math.abs(data.rssi) }}</span>
                </template>
            </Column>
            <Column field="time" header="Time" class="w-64"></Column>
            <Column class="w-max">
                <template #body="{ data }">
                    <Button text size="small" @click="selectFrequency(data.frequency.toFixed(2))" class="p-0">
                        <template #icon>
                            <e-icon icon='cog-play-outline' size="x-small" />
                        </template>
                    </Button>
                </template>
            </Column>
        </DataTable>
    </Panel>
</template>

<script>
import { useStore } from '@/store/store'
import { ref, computed } from 'vue'
import ScanButton from './ScanButton.vue'
import SignalStrengthIcon from '@/components/SignalStrengthIcon.vue'
import { State } from '@/types'
import { mobile } from '@/utils/mobile-checker'
import { DeviceController } from '@/controllers/device'

export default {
    components: {
        ScanButton,
        SignalStrengthIcon,
    },
    emits: ['frequency-selected'],
    setup(props, { emit }) {
        const { requestIdle, requestScan } = DeviceController();
        const store = useStore();
        const minRssi = ref(65);

        const detectorSettingsPanel = ref();
        const detectorSettingsPanelToogle = (event) => {
            detectorSettingsPanel.value.toggle(event);
        }

        const selectFrequency = (frequency) => {
            emit('frequency-selected', { frequency: frequency });
        }

        const getAvailableModule = computed(() => {
            const module = store.state.detector.settings.module;
            if (module == -1) {
                for(const cc1101State of store.state.cc1101) {
                    if (cc1101State.mode == State.Device.Idle) {
                        return cc1101State.id+1;
                    }
                }
            } else {
                if (store.state.cc1101[module] != undefined && store.deviceMode.cc1101[module] == State.Device.Idle) {
                    return module+1;
                }
            }

            return 0;
        });

        const isAnyDetect = computed(() => {
            return Object.values(store.deviceMode.cc1101).includes(State.Device.DetectSignal);
        });

        const scan = () => {
            const availableModule = getAvailableModule.value;
            if (availableModule != 0) {
                requestScan(availableModule, (minRssi.value * -1));
            }
        };
        const idle = () => {
            for (const [id, cc1101Mode] of Object.entries(store.deviceMode.cc1101)) {
                if (cc1101Mode == State.Device.DetectSignal) {
                    requestIdle(parseInt(id)+1);
                }
            }
        }
        return {
            store,
            minRssi,
            State,
            mobile,
            detectorSettingsPanel,
            detectorSettingsPanelToogle,
            selectFrequency,
            getAvailableModule,
            isAnyDetect,
            scan,
            idle,
            requestIdle,
        }
    }
}

</script>
