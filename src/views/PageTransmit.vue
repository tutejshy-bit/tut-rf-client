<template>
    <PageLayout>
        <template v-slot:actions-top>

        </template>

        <template #content>
            <TabView @update:active-index="updateSelectedModule">
                <TabPanel v-for="(config, index) in store.state.transmitConfigs">
                    <template #header>
                        <div class="align-items-center gap-2 align-baseline">
                            <SvgImage name="cc1101" class="w-[5px] mr-2" />
                            <span class="font-bold white-space-nowrap inline-block align-bottom">Module {{ (index + 1)
                            }}</span>
                        </div>
                    </template>
                    <div class="-m-5">
                        <BlockUI :blocked="store.deviceMode.cc1101[index] !== State.Device.Idle">
                            <Panel toggleable class="mt-1">
                                <template #header>
                                    <span :class="{ 'text-xs': mobile }" class="font-bold">Transmit Settings</span>
                                    <span class="text-xs">
                                        <span class="font-bold">Fq</span> {{ config.frequency }} MHz
                                        <template v-if="store.state.advancedMode">
                                            <template v-if="config.modulation == 0">, <span class="font-bold">D</span> {{
                                                config.deviation }}
                                                kHz</template>
                                        </template>
                                        <template v-else>
                                            (Preset: <span class="font-bold">{{ config.preset }}</span>) {{
                                                currentPresetValues(index).modulation }}
                                            <template v-if='currentPresetValues(index).deviation'>,
                                                <span class="font-bold">D</span> {{ currentPresetValues(index).deviation }}
                                                kHz
                                            </template>
                                        </template>
                                    </span>
                                </template>
                                <div class="flex flex-column align-top justify-start gap-2 flex-wrap pt-10 mx-4">
                                    <div class="flex-row gap-2 mr-10 mb-6">
                                        <div class="mx-0">
                                            <FloatLabel class="w-full md:w-14rem">
                                                <Dropdown editable v-model="config.frequency" :options="Predefined.Frequencies"
                                                    :inputId="'record-frequency-' + index"
                                                    @blur="frequencyLimit"
                                                    @keydown="checkDigit(config.frequency, $event)"
                                                    class="min-w-64 md:w-14rem w-full" />
                                                <label :for="'transmit-frequency-' + index">Frequency (<span class="text-[8px]">300-348, 387-464, 779-928 MHz</span>)</label>
                                            </FloatLabel>
                                        </div>
                                        <template v-if="store.state.advancedMode">
                                            <div v-if="config.modulation === '0'" class="mx-0 mt-10">
                                                <FloatLabel class="w-full md:w-14rem">
                                                    <InputText :id="'transmit-deviation-' + index"
                                                        v-model="config.deviation" @blur="deviationLimit"
                                                        @keydown="checkDigit(config.deviation, $event)" class="min-w-64" />
                                                    <label :for="'transmit-deviation-' + index">Deviation (1.58 to 380.85
                                                        kHz)</label>
                                                </FloatLabel>
                                            </div>
                                        </template>
                                    </div>
                                    <template v-if="!store.state.advancedMode">
                                        <div class="flex-row gap-2 mr-10">
                                            <div class="mx-0">
                                                <FloatLabel class="w-full md:w-14rem">
                                                    <Dropdown v-model="config.preset" :options="Predefined.Presets"
                                                        :inputId="'transmit-presets-' + index"
                                                        class="min-w-64 md:w-14rem w-full" optionLabel="name"
                                                        optionValue="value" />
                                                    <label :for="'transmit-presets-' + index">Preset</label>
                                                </FloatLabel>
                                            </div>
                                        </div>
                                    </template>
                                    <div class="flex-row -mt-6">
                                        <template v-if="store.state.advancedMode">
                                            <div>
                                                <div class="mb-2 font-medium">Modulation</div>
                                                <div class="mb-4 mt-2">
                                                    <RadioButton v-model="config.modulation"
                                                        :inputId="'record-modulation-am-' + index" name="modulation"
                                                        value="2" />
                                                    <label :for="'record-modulation-am-' + index" class="ml-2">ASK/OOK
                                                        (AM)</label>
                                                </div>
                                                <div class="my-4">
                                                    <RadioButton v-model="config.modulation"
                                                        :inputId="'record-modulation-fm-' + index" name="modulation"
                                                        value="0" />
                                                    <label :for="'record-modulation-fm-' + index" class="ml-2">2-FSK
                                                        (FM)</label>
                                                </div>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </Panel>
                            <Card class="my-5">
                                <template #content>
                                    <TabView>
                                        <TabPanel header="Raw">
                                            <p class="m-0 relative">
                                                <Textarea v-model="config.rawValue" autoResize rows="5" cols="30"
                                                    class="w-full font-mono text-sm" />
                                            <div class="flex justify-end mt-2 w-full">
                                                <Button size="small" class="ml-2"
                                                    @click="sendRaw(index)">Send</Button>
                                            </div>
                                            </p>
                                        </TabPanel>
                                    </TabView>
                                </template>
                            </Card>
                        </BlockUI>
                    </div>
                </TabPanel>
            </TabView>
        </template>
    </PageLayout>
</template>

<script>
import PageLayout from '../layouts/main/Page.vue'
import { ref, watch, onMounted } from 'vue'
import { useStore } from '@/store/store'
import { State } from '@/types'
import { mobile } from '@/utils/mobile-checker'
import { Predefined } from '@/lib/values'
import { deviationToHex, frequencyToHex } from '@/lib/cc1101-calculator'
import { DeviceController } from '@/controllers/device'

export default {
    components: {
        PageLayout,
    },
    setup() {
        const store = useStore();
        const device = DeviceController();

        const currentPresetValues = (module) => Predefined.Presets.find(p => p.value === store.state.transmitConfigs[module].preset);

        const checkDigit = (value, event) => {
            if (event.key.length === 1 && isNaN(Number(value.toString() + event.key))) {
                event.preventDefault();
            }
        }

        const frequencyLimit = () => {
            const config = store.state.transmitConfigs[selectedModule.value];
            const frequencyToCheck = parseFloat(config.frequency);
            for (let range of Predefined.Frequency.Ranges) {
                if (frequencyToCheck >= range.Min && frequencyToCheck <= range.Max) {
                    return; // Frequency is within a valid range
                }
            }

            // Frequency is out of valid ranges, find the closest valid value
            let closestFrequency = frequencyToCheck;
            let minDifference = Infinity;

            for (let range of Predefined.Frequency.Ranges) {
                if (frequencyToCheck < range.Min) {
                    let difference = range.Min - frequencyToCheck;
                    if (difference < minDifference) {
                        minDifference = difference;
                        closestFrequency = range.Min;
                    }
                } else if (frequencyToCheck > range.Max) {
                    let difference = frequencyToCheck - range.Max;
                    if (difference < minDifference) {
                        minDifference = difference;
                        closestFrequency = range.Max;
                    }
                }
            }

            config.frequency = closestFrequency;
        }


        const deviationLimit = () => {
            const deviationToCheck = parseFloat(deviation.value);
            if (deviationToCheck < Predefined.Deviation.Min) {
                deviation.value = Predefined.Deviation.Min.toString();
            } else if (deviationToCheck > Predefined.Deviation.Max) {
                deviation.value = Predefined.Deviation.Max.toString();
            }
        }

        const sendRaw = (module) => {
            const advanced = store.state.advancedMode;
            const config = store.state.transmitConfigs[module];

            device.transmit("raw", {
                frequency: config.frequency,
                data: config.rawValue,
                module: module + 1,
                modulation: config.modulation,
                deviation: config.deviation,
                preset: advanced ? null : config.preset,
                repeat: 1
            });
        }

        const selectedModule = ref(0);
        const updateSelectedModule = (num) => selectedModule.value = num;

        const updateModulesState = async (updatedValues) => {
            if (store.state.transmitConfigs.length != updatedValues.length) {
                for (let i = 0; i < updatedValues.length; i++) {
                    store.state.transmitConfigs[i] = {
                        modulation: '2',
                        frequency: '433.92',
                        deviation: '1.5869',
                        preset: 'Ook270',
                        rawValue: '',
                    }
                }
            }
        };

        watch(() => store.cc1101Modules, updateModulesState);
        onMounted(() => updateModulesState(store.cc1101Modules));

        return {
            Predefined,
            store,
            State,
            mobile,
            currentPresetValues,
            checkDigit,
            deviationLimit,
            frequencyLimit,
            deviationToHex,
            frequencyToHex,
            sendRaw,
            updateSelectedModule,
        }
    },
}
</script>
