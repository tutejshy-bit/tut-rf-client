<template>
    <PageLayout>
        <template v-slot:actions-top>
            <Detector @frequencySelected="selectFrequency" />
        </template>

        <template #content>
            <TabView @update:active-index="updateSelectedModule">
                <TabPanel v-for="(recordConfig, index) in store.state.recordConfigs">
                    <template #header>
                        <div class="align-items-center gap-2 align-baseline">
                            <SvgImage name="cc1101" class="w-[5px] mr-2" />
                            <span class="font-bold white-space-nowrap inline-block align-bottom">Module  {{ (index + 1) }}</span>
                        </div>
                    </template>
                    <div class="-m-5">
                        <Panel toggleable>
                            <template #header>
                                <span :class="{ 'text-xs': mobile }" class="font-bold">Record Settings</span>
                                <span class="text-xs">
                                    <span class="font-bold">Fq</span> {{ recordConfig.frequency }} MHz
                                    <template v-if="store.state.advancedMode">,
                                        <span class="font-bold">Bw</span> {{ recordConfig.bandwidth }} kHz,
                                        <span class="font-bold">DR</span> {{ recordConfig.dataRate }} kBaud
                                        <template v-if="recordConfig.modulation == 0">, <span class="font-bold">D</span> {{
                                            recordConfig.deviation }}
                                            kHz</template>
                                    </template>
                                    <template v-else>
                                        (Preset: <span class="font-bold">{{ recordConfig.preset }}</span>) {{
                                            currentPresetValues(index).modulation
                                        }}
                                        <span class="font-bold">Bw</span> {{ currentPresetValues(index).bandwidth }},
                                        <span class="font-bold">DR</span> {{ currentPresetValues(index).dataRate }}
                                        <template v-if='currentPresetValues(index).deviation'>,
                                            <span class="font-bold">D</span> {{ currentPresetValues(index).deviation }} kHz
                                        </template>
                                    </template>
                                </span>
                            </template>
                            <BlockUI :blocked="store.deviceMode.cc1101[index] !== State.Device.Idle">
                                <div class="flex flex-column align-top justify-start gap-2 flex-wrap pt-10 mx-4">
                                    <div class="flex-row gap-2 mr-10 mb-6">
                                        <div class="mx-0">
                                            <FloatLabel class="w-full md:w-14rem">
                                                <Dropdown editable v-model="recordConfig.frequency" :options="Predefined.Frequencies"
                                                    :inputId="'record-frequency-' + index" 
                                                    @blur="frequencyLimit"
                                                    @keydown="checkDigit(recordConfig.frequency, $event)"
                                                    class="min-w-64 md:w-14rem w-full" />
                                                <label :for="'record-frequency-' + index">Frequency (<span class="text-[8px]">300-348, 387-464, 779-928 MHz</span>)</label>
                                            </FloatLabel>
                                        </div>
                                        <template v-if="store.state.advancedMode">
                                            <div class="mx-0 mt-10">
                                                <FloatLabel class="w-full md:w-14rem">
                                                    <Dropdown v-model="recordConfig.bandwidth"
                                                        :options="Predefined.Bandwidths" optionValue="float"
                                                        optionLabel="value" :inputId="'record-bandwidth-' + index"
                                                        class="min-w-72" />
                                                    <label :for="'record-bandwidth-' + index">Bandwidth (58.04 to 812.50
                                                        kHz)</label>
                                                </FloatLabel>
                                            </div>
                                            <div class="mx-0 mt-10">
                                                <FloatLabel class="w-full md:w-14rem">
                                                    <InputText :id="'record-datarate-' + index"
                                                        v-model="recordConfig.dataRate" @blur="dataRateLimit"
                                                        @keydown="checkDigit(recordConfig.dataRate, $event)" class="min-w-72" />
                                                    <label :for="'record-datarate-' + index">Data Rate (0.0247 to 1621.83
                                                        kBaud)</label>
                                                </FloatLabel>
                                            </div>
                                            <div v-if="recordConfig.modulation === '0'" class="mx-0 mt-10">
                                                <FloatLabel class="w-full md:w-14rem">
                                                    <InputText :id="'record-deviation-' + index"
                                                        v-model="recordConfig.deviation" @blur="deviationLimit"
                                                        @keydown="checkDigit(recordConfig.deviation, $event)" class="min-w-72" />
                                                    <label :for="'record-deviation-' + index">Deviation (1.58 to 380.85
                                                        kHz)</label>
                                                </FloatLabel>
                                            </div>
                                        </template>
                                    </div>
                                    <template v-if="!store.state.advancedMode">
                                        <div class="flex-row gap-2 mr-10">
                                            <div class="mx-0">
                                                <FloatLabel class="w-full md:w-14rem">
                                                    <Dropdown v-model="recordConfig.preset" :options="Predefined.Presets"
                                                        :inputId="'record-presets-' + index"
                                                        class="min-w-64 md:w-14rem w-full" optionLabel="name"
                                                        optionValue="value" />
                                                    <label :for="'record-presets-' + index">Preset</label>
                                                </FloatLabel>
                                            </div>
                                        </div>
                                    </template>
                                    <div class="flex-row -mt-6">
                                        <template v-if="store.state.advancedMode">
                                            <div>
                                                <div class="mb-2 font-medium">Modulation</div>
                                                <div class="mb-4 mt-2">
                                                    <RadioButton v-model="recordConfig.modulation"
                                                        :inputId="'record-modulation-am-' + index" name="modulation"
                                                        value="2" />
                                                    <label :for="'record-modulation-am-' + index" class="ml-2">ASK/OOK
                                                        (AM)</label>
                                                </div>
                                                <div class="my-4">
                                                    <RadioButton v-model="recordConfig.modulation"
                                                        :inputId="'record-modulation-fm-' + index" name="modulation"
                                                        value="0" />
                                                    <label :for="'record-modulation-fm-' + index" class="ml-2">2-FSK
                                                        (FM)</label>
                                                </div>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </BlockUI>
                            <div class="w-full flex justify-end">
                                <Button severity="primary" v-if="store.advancedMode" outlined size="small"
                                    class="mx-2 mt-4 mb-3">
                                    <e-icon icon="content-save-outline" prepended size="small" />
                                    Save Preset As ..
                                </Button>
                                <RecordButton @startRecord="startRecord" @stopRecord="stopRecord" class="font-medium mt-4 mb-3"
                                    :num="index" outlined />
                            </div>
                        </Panel>
                    </div>
                </TabPanel>
            </TabView>
            <FilesList :files="files" v-if="files.length > 0" :action-create-directory="false" :action-move="false" />
        </template>
    </PageLayout>
</template>

<script>
import RecordButton from '../components/RecordButton.vue'
import PageLayout from '../layouts/main/Page.vue'
import { computed, watch, onMounted, ref } from 'vue'
import { useStore } from '@/store/store'
import Detector from "@/components/Detector.vue";
import FilesList from "@/components/FileManager/FilesList.vue";
import { State } from '@/types'
import { mobile } from '@/utils/mobile-checker'
import { Predefined } from '@/lib/values'
import { dataRateToHex, deviationToHex, bandwidthToHex, frequencyToHex } from '@/lib/cc1101-calculator'
import { DeviceController } from '@/controllers/device'
import SvgImage from '@/components/SvgImage.vue'

export default {
    components: {
        Detector,
        PageLayout,
        RecordButton,
        FilesList,
        SvgImage
    },
    setup() {
        const store = useStore();
        const device = DeviceController();

        const selectedModule = ref(0);
        const updateSelectedModule = (num) => selectedModule.value = num;

        const updateModulesState = async (updatedValues) => {
            if (store.state.recordConfigs.length != updatedValues.length) {
                for (let i = 0; i < updatedValues.length; i++) {
                    store.state.recordConfigs[i] = {
                        modulation: '2',
                        frequency: '433.92',
                        bandwidth: '650.000',
                        deviation: '1.5869',
                        dataRate: '512',
                        preset: 'Ook270',
                    }
                }
            }
        };

        watch(() => store.cc1101Modules, updateModulesState);
        onMounted(() => updateModulesState(store.cc1101Modules));

        const currentPresetValues = (module) => Predefined.Presets.find(p => p.value === store.state.recordConfigs[module].preset);

        const checkDigit = (value, event) => {
            if (event.key.length === 1 && isNaN(Number(value.toString() + event.key))) {
                event.preventDefault();
            }
        }

        const startRecord = (module) => {
            const advanced = store.state.advancedMode;
            const config = store.state.recordConfigs[module];
            device.requestRecord({
                frequency: config.frequency,
                preset: !advanced ? config.preset : undefined,
                module: module + 1,
                modulation: advanced ? config.modulation : undefined,
                bandwidth: advanced ? config.bandwidth : undefined,
                deviation: advanced && config.modulation === '0' ? config.deviation : undefined,
                dataRate: advanced ? config.dataRate : undefined,
            })
        }

        const stopRecord = (module) => device.requestIdle(module + 1);

        const frequencyLimit = () => {
            const config = store.state.recordConfigs[selectedModule.value];
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
            const config = store.state.recordConfigs[selectedModule.value];
            const deviationToCheck = parseFloat(config.deviation);
            if (deviationToCheck < Predefined.Deviation.Min) {
                config.deviation = Predefined.Deviation.Min.toString();
            } else if (deviationToCheck > Predefined.Deviation.Max) {
                config.deviation = Predefined.Deviation.Max.toString();
            }
        }

        const dataRateLimit = () => {
            const config = store.state.recordConfigs[selectedModule.value];
            const dataRateToCheck = parseFloat(config.dataRate);
            if (dataRateToCheck < Predefined.DataRate.Min) {
                config.dataRate = Predefined.DataRate.Min.toString();
            } else if (dataRateToCheck > Predefined.DataRate.Max) {
                config.dataRate = Predefined.DataRate.Max.toString();
            }
        }

        const mapNewSignalsToTree = (files) => {
            return files.map(file => {
                return {
                    key: file.filename,
                    label: file.filename,
                    type: 'file',
                    data: { name: file.filename, type: 'file', fullpath: file.filename, directory: '' },
                }
            });
        }

        const files = computed(() => mapNewSignalsToTree(store.state.recorded.runtime.files));

        const selectFrequency = (event) => store.state.recordConfigs[selectedModule.value].frequency = event.frequency;

        return {
            Predefined,
            store,
            files,
            State,
            mobile,
            selectedModule,
            checkDigit,
            startRecord,
            stopRecord,
            deviationLimit,
            dataRateLimit,
            frequencyLimit,
            selectFrequency,
            dataRateToHex,
            deviationToHex,
            bandwidthToHex,
            frequencyToHex,
            currentPresetValues,
            updateSelectedModule,
        }
    },
}
</script>
