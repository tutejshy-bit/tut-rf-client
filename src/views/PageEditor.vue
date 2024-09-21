<template>
    <PageLayout>
        <template v-slot:actions-top>

        </template>

        <template #content>
            <Panel toggleable>
                <template #header>
                    <span :class="{ 'text-xs': mobile }" class="font-bold">Edit signal</span>
                    <span class="text-xs">
                        <span class="font-bold">Fq</span> {{ settings.frequency }} MHz
                        <template v-if="!usingPreset">,
                            <span class="font-bold">Bw</span> {{ settings.bandwidth }} kHz,
                            <span class="font-bold">DR</span> {{ settings.dataRate }} kBaud
                            <template v-if="settings.modulation == 0">, <span class="font-bold">D</span> {{
                                settings.deviation }}
                                kHz</template>
                        </template>
                        <template v-else>
                            (Preset: <span class="font-bold">{{ settings.preset }}</span>) {{
                                currentPresetValues().modulation
                            }}
                            <span class="font-bold">Bw</span> {{ currentPresetValues().bandwidth }},
                            <span class="font-bold">DR</span> {{ currentPresetValues().dataRate }}
                            <template v-if='currentPresetValues().deviation'>,
                                <span class="font-bold">D</span> {{ currentPresetValues().deviation }} kHz
                            </template>
                        </template>
                    </span>
                </template>
                <div class="flex-row gap-2 mx-4 mt-10">
                    <span class="align-top font-bold text-base mr-2">With Preset</span>
                    <InputSwitch v-model="usingPreset" color="primary" :invalid="!usingPreset" />
                </div>
                <div class="flex flex-column align-top justify-start gap-2 flex-wrap pt-10 mx-4">
                    <div class="flex-row gap-2 mr-10 mb-6">
                        <div class="mx-0">
                            <FloatLabel class="w-full md:w-14rem">
                                <Dropdown editable v-model="settings.frequency" :options="Predefined.Frequencies"
                                    inputId="frequency" @blur="frequencyLimit"
                                    @keydown="checkDigit(settings.frequency, $event)"
                                    class="min-w-64 md:w-14rem w-full" />
                                <label for="frequency">Frequency (<span class="text-[8px]">300-348,
                                        387-464,
                                        779-928 MHz</span>)</label>
                            </FloatLabel>
                        </div>
                        <template v-if="!usingPreset">
                            <div class="mx-0 mt-10">
                                <FloatLabel class="w-full md:w-14rem">
                                    <Dropdown v-model="settings.bandwidth" :options="Predefined.Bandwidths"
                                        optionValue="float" optionLabel="value" inputId="bandwidth" class="min-w-72" />
                                    <label for="bandwidth">Bandwidth (58.04 to 812.50 kHz)</label>
                                </FloatLabel>
                            </div>
                            <div class="mx-0 mt-10">
                                <FloatLabel class="w-full md:w-14rem">
                                    <InputText id="datarate" v-model="settings.dataRate" @blur="dataRateLimit"
                                        @keydown="checkDigit(settings.dataRate, $event)" class="min-w-72" />
                                    <label for="datarate">Data Rate (0.0247 to 1621.83
                                        kBaud)</label>
                                </FloatLabel>
                            </div>
                            <div v-if="settings.modulation === '0'" class="mx-0 mt-10">
                                <FloatLabel class="w-full md:w-14rem">
                                    <InputText id="deviation" v-model="settings.deviation" @blur="deviationLimit"
                                        @keydown="checkDigit(settings.deviation, $event)" class="min-w-72" />
                                    <label for="deviation">Deviation (1.58 to 380.85
                                        kHz)</label>
                                </FloatLabel>
                            </div>
                        </template>
                    </div>
                    <template v-if="usingPreset">
                        <div class="flex-row gap-2 mr-10">
                            <div class="mx-0">
                                <FloatLabel class="w-full md:w-14rem">
                                    <Dropdown v-model="settings.preset" :options="Predefined.Presets" inputId="presets"
                                        class="min-w-64 md:w-14rem w-full" optionLabel="name" optionValue="value" />
                                    <label for="presets">Preset</label>
                                </FloatLabel>
                            </div>
                        </div>
                    </template>
                    <div class="flex-row -mt-6">
                        <template v-if="!usingPreset">
                            <div>
                                <div class="mb-2 font-medium">Modulation</div>
                                <div class="mb-4 mt-2">
                                    <RadioButton v-model="settings.modulation" inputId="modulation-am" name="modulation"
                                        value="2" />
                                    <label for="modulation-am" class="ml-2">ASK/OOK
                                        (AM)</label>
                                </div>
                                <div class="my-4">
                                    <RadioButton v-model="settings.modulation" inputId="modulation-fm" name="modulation"
                                        value="0" />
                                    <label for="modulation-fm" class="ml-2">2-FSK
                                        (FM)</label>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
                <TabView>
                    <TabPanel header="Raw">
                        <p class="m-0 relative">
                            <Textarea v-model="value" autoResize rows="5" cols="30" class="w-full font-mono text-sm" />
                        </p>
                    </TabPanel>
                </TabView>
                <div class="w-full flex justify-end">
                    <Button severity="primary" size="small" class="mx-2 mt-4 mb-3" @click="openSavePopup" :disabled="!value.trim().length">
                        <e-icon icon="content-save-outline" prepended size="small" />
                        Save As ..
                    </Button>
                </div>
            </Panel>
            <FilesList :files="files" v-if="files.length > 0" :action-create-directory="false" :action-move="false" />
        </template>
    </PageLayout>
    <SaveAsWidget ref="savePopup" @saved="onSave" />
</template>

<script>
import PageLayout from '../layouts/main/Page.vue'
import SaveAsWidget from '@/components/FileManager/SaveAsWidget.vue'
import { ref, reactive, computed } from 'vue'
import { mobile } from '@/utils/mobile-checker'
import { Predefined } from '@/lib/values'
import FlipperZeroSubGenerator from '@/utils/generator/fz-sub'

export default {
    components: {
        PageLayout,
        SaveAsWidget,
    },
    setup() {
        const usingPreset = ref(true);

        const settings = reactive({
            modulation: '2',
            frequency: '433.92',
            bandwidth: '650.000',
            deviation: '1.5869',
            dataRate: '512',
            preset: 'Ook270',
        })

        const value = ref('');

        const currentPresetValues = () => Predefined.Presets.find(p => p.value === settings.preset);

        const frequencyLimit = () => {
            const frequencyToCheck = parseFloat(settings.frequency);
            for (let range of Predefined.Frequency.Ranges) {
                if (frequencyToCheck >= range.Min && frequencyToCheck <= range.Max) {
                    return;
                }
            }

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

            settings.frequency = closestFrequency;
        }

        const deviationLimit = () => {
            const deviationToCheck = parseFloat(settings.deviation);
            if (deviationToCheck < Predefined.Deviation.Min) {
                settings.deviation = Predefined.Deviation.Min.toString();
            } else if (deviationToCheck > Predefined.Deviation.Max) {
                settings.deviation = Predefined.Deviation.Max.toString();
            }
        }

        const dataRateLimit = () => {
            const dataRateToCheck = parseFloat(settings.dataRate);
            if (dataRateToCheck < Predefined.DataRate.Min) {
                settings.dataRate = Predefined.DataRate.Min.toString();
            } else if (dataRateToCheck > Predefined.DataRate.Max) {
                settings.dataRate = Predefined.DataRate.Max.toString();
            }
        }

        const checkDigit = (value, event) => {
            if (event.key.length === 1 && isNaN(Number(value.toString() + event.key))) {
                event.preventDefault();
            }
        }

        const savedFiles = ref([]);
        const savePopup = ref();
        const openSavePopup = () => {
            const generator = new FlipperZeroSubGenerator();
            let content = '';
            if (usingPreset.value) {
                content = generator.setFrequency(settings.frequency)
                    .setPreset(currentPresetValues().fzName)
                    .setDataRaw(value.value)
                    .generateDataRaw();
            } else {
                content = generator.setFrequency(settings.frequency)
                    .setBandwidth(settings.bandwidth)
                    .setDataRate(settings.dataRate)
                    .setDeviation(settings.deviation)
                    .setModulationNum(settings.modulation)
                    .setDataRaw(value.value)
                    .generateDataRaw();
            }

            savePopup.value.content = content;
            savePopup.value.show();
        }
        const files = computed(() => mapNewSignalsToTree(savedFiles.value));

        const onSave = ({ to }) => {
            savedFiles.value.push({ filename: to });
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

        return {
            Predefined,
            currentPresetValues,
            mobile,
            frequencyLimit,
            deviationLimit,
            dataRateLimit,
            settings,
            usingPreset,
            checkDigit,
            value,
            savePopup,
            openSavePopup,
            onSave,
            files,
        }
    },
}
</script>
