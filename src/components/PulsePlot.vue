<template>
    <div class="w-full max-w-[1600px] mx-auto">
        <Chart class="max-h-36" type="line" :data="parsedData" :options="options" :plugins="plugins" ref="pulseChart">
        </Chart>
        <div>
            <p class="ml-2">Raw signal</p>
            <Panel toggleable class="my-5">
                <template #header>
                    <span>
                        <template v-if="signal.raw.beforeVisible.length || signal.raw.afterVisible.length">
                            <Button size="small"
                                @click="viewSettings.raw.showOnlySelected = !viewSettings.raw.showOnlySelected" text>
                                <template #icon><e-icon size="small" v-if="viewSettings.raw.showOnlySelected"
                                        icon="text-box-plus" /><e-icon size="small" v-else
                                        icon="text-box-minus" /></template>
                            </Button>
                        </template>
                        <Button size="small" text>
                            <e-icon icon='content-copy' size="small"
                                @click="copyContent(viewSettings.raw.showOnlySelected ? signal.raw.visible.join(' ') : signal.raw.full.join(' '))" />
                        </Button>
                    </span>
                </template>
                <p class="m-0 text-sm font-mono break-words">
                    <template v-if="signal.raw.beforeVisible.length && !viewSettings.raw.showOnlySelected">
                        {{ signal.raw.beforeVisible.join(' ') }}
                    </template>
                    <span class="bg-orange-100 px-2">
                        {{ signal.raw.visible.join(' ') }}
                    </span>
                    <template v-if="signal.raw.afterVisible.length && !viewSettings.raw.showOnlySelected">
                        {{ signal.raw.afterVisible.join(' ') }}
                    </template>
                </p>
            </Panel>

            <Toolbar>
                <template #start>
                    <label for="pulseDuration" class="text-sm mr-2">Pulse Duration: </label>
                    <InputText class="w-50" :placeholder="signalValues.pulseDuration.calculated" size="small"
                        id="pulseDuration" type="text" v-model.number="signalValues.pulseDuration.provided" />

                </template>

                <template #center>
                </template>
            </Toolbar>
            <p class="ml-2 mt-7">Binary</p>
            <Panel toggleable class="my-5">
                <template #header>
                    <span>
                        <template v-if="signal.demodulated.beforeVisible.length || signal.demodulated.afterVisible.length">
                            <Button size="small"
                                @click="viewSettings.binary.showOnlySelected = !viewSettings.binary.showOnlySelected" text>
                                <template #icon><e-icon size="small" v-if="viewSettings.binary.showOnlySelected"
                                        icon="text-box-plus" /><e-icon size="small" v-else
                                        icon="text-box-minus" /></template>
                            </Button>
                        </template>
                        <Button size="small" class="px-0" text>
                            <e-icon icon='content-copy' size="small"
                                @click="copyContent(viewSettings.binary.showOnlySelected ? signal.demodulated.visible : signal.demodulated.full)" />
                        </Button>
                    </span>
                </template>
                <div class="break-all w-full text-sm font-mono">
                    <template v-if="signal.demodulated.beforeVisible.length && !viewSettings.binary.showOnlySelected">
                        {{ signal.demodulated.beforeVisible }}
                    </template>
                    <span class="bg-orange-100 px-2">
                        {{ signal.demodulated.visible }}
                    </span>
                    <template v-if="signal.demodulated.afterVisible.length && !viewSettings.binary.showOnlySelected">
                        {{ signal.demodulated.afterVisible }}
                    </template>
                </div>
            </Panel>
            <p class="ml-2 mt-7">Smoothed</p>
            <Panel toggleable class="my-5">
                <template #header>
                    <span>
                        <template v-if="signal.smoothed.beforeVisible.length || signal.smoothed.afterVisible.length">
                            <Button size="small"
                                @click="viewSettings.smoothed.showOnlySelected = !viewSettings.smoothed.showOnlySelected"
                                text>
                                <template #icon><e-icon size="small" v-if="viewSettings.smoothed.showOnlySelected"
                                        icon="text-box-plus" /><e-icon size="small" v-else
                                        icon="text-box-minus" /></template>
                            </Button>
                        </template>
                        <Button size="small" class="px-0" text>
                            <e-icon icon='content-copy' size="small"
                                @click="copyContent(viewSettings.smoothed.showOnlySelected ? signal.smoothed.visible.join(' ') : signal.smoothed.full.join(' '))" />
                        </Button>
                    </span>
                </template>
                <p class="m-0 text-sm font-mono break-words">
                    <template v-if="signal.smoothed.beforeVisible.length && !viewSettings.smoothed.showOnlySelected">
                        {{ signal.smoothed.beforeVisible.join(' ') }}
                    </template>
                    <span class="bg-orange-100 px-2">
                        {{ signal.smoothed.visible.join(' ') }}
                    </span>
                    <template v-if="signal.smoothed.afterVisible.length && !viewSettings.smoothed.showOnlySelected">
                        {{ signal.smoothed.afterVisible.join(' ') }}
                    </template>
                </p>
            </Panel>
        </div>
    </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import zoomPlugin from 'chartjs-plugin-zoom';

export default {
    name: 'PulsePlot',
    props: {
        inputData: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const MIN_PULSE_DURATION = 50;

        const pulseChart = ref(null);
        const rawData = ref([]);
        const viewSettings = reactive({
            raw: {
                showOnlySelected: true
            },
            binary: {
                showOnlySelected: true
            },
            smoothed: {
                showOnlySelected: true
            },
        });

        const signalValues = reactive({
            pulseDuration: {
                calculated: 0,
                provided: null
            }
        });

        const rawDataArray = props.inputData ? props.inputData.split(' ').map(Number) : [];
        signalValues.pulseDuration.calculated = findPulseDuration(rawDataArray);

        const parseData = () => {
            rawData.value = rawDataArray;
            let time = 0;
            const points = [];

            for (let i = 0; i < rawDataArray.length; i++) {
                const duration = Math.abs(rawDataArray[i]);
                const state = rawDataArray[i] > 0 ? 1 : 0;
                points.push({ x: time, y: state });
                time += duration;
                points.push({ x: time, y: state });
            }

            return points;
        };

        function findPulseDuration(samples) {
            const absSamples = samples.map(Math.abs);
            const minDuration = Math.min(...absSamples);
            let maxDuration = minDuration;

            absSamples.forEach(sample => {
                if (sample <= minDuration + MIN_PULSE_DURATION) {
                    maxDuration = Math.max(maxDuration, sample);
                }
            });

            return Math.round((minDuration + maxDuration) / 2);
        }

        const pulseDuration = computed(() => signalValues.pulseDuration.provided === null || signalValues.pulseDuration.provided == "" ? signalValues.pulseDuration.calculated : signalValues.pulseDuration.provided);

        function demodulate(samples, pulseDuration) {
            if (samples.length == 0) {
                return "";
            }
            const absSamples = samples.map(Math.abs);

            let demodulated = '';
            let lastbin = samples[0] < 0;

            for (let i = 0; i < absSamples.length; i++) {
                const bitCount = Math.round(absSamples[i] / pulseDuration);
                if (bitCount > 0) {
                    lastbin = !lastbin;
                    demodulated += lastbin ? '1'.repeat(bitCount) : '0'.repeat(bitCount);
                }
            }

            return demodulated;
        }

        const smooth = (binaryString, pulseDuration) => {
            return [...binaryString].reduce((counts, char, i, arr) => {
                if (i === 0 || char !== arr[i - 1]) {
                    counts.push(char === "1" ? pulseDuration : pulseDuration * -1);
                } else {
                    if (char === "1") {
                        counts[counts.length - 1] += pulseDuration;
                    } else {
                        counts[counts.length - 1] -= pulseDuration;
                    }
                }
                return counts;
            }, []);
        }

        const parsedData = {
            datasets: [{
                label: 'Pulse Plot',
                data: parseData(),
                fill: false,
                borderColor: '#10b981',
                stepped: true,
                pointRadius: 0,
                borderWidth: 2,
            }]
        };

        const signal = reactive({
            raw: {
                beforeVisible: [],
                afterVisible: [],
                visible: rawDataArray,
                full: [],
            },
            demodulated: {
                beforeVisible: [],
                afterVisible: [],
                visible: demodulate(rawDataArray),
                full: [],
            },
            smoothed: {
                beforeVisible: [],
                afterVisible: [],
                visible: [],
                full: [],
            }
        });

        const updateVisiblePoints = (start, end) => {
            if (pulseChart.value !== null && pulseChart.value.getChart()) {
                const points = {
                    beforeVisible: [],
                    visible: [],
                    afterVisible: []
                };
                let time = 0;
                let hasAddedFirstVisible = false; // Track if we've added the first visible point

                for (let i = 0; i < rawData.value.length; i++) {
                    const duration = Math.abs(rawData.value[i]);
                    const startTime = time;
                    const endTime = time + duration;

                    if (!hasAddedFirstVisible && ((startTime < start && endTime >= start) || (startTime >= start && startTime <= end))) {
                        // Include the first point that intersects or starts within the selection range
                        points.visible.push(rawData.value[i]);
                        hasAddedFirstVisible = true;
                    } else if (hasAddedFirstVisible && startTime >= start && endTime <= end) {
                        // Include points fully within the selection range
                        points.visible.push(rawData.value[i]);
                    } else if (!hasAddedFirstVisible) {
                        // Before the first visible point is found
                        points.beforeVisible.push(rawData.value[i]);
                    } else {
                        // After the last valid visible point
                        points.afterVisible.push(rawData.value[i]);
                    }

                    time += duration;
                }

                signal.raw.beforeVisible = points.beforeVisible;
                signal.raw.visible = points.visible;
                signal.raw.afterVisible = points.afterVisible;
                signal.raw.full = points.beforeVisible.concat(points.visible, points.afterVisible);
            }
        };


        const demodulatedBeforeVisible = computed(() => demodulate(signal.raw.beforeVisible, pulseDuration.value));
        const demodulatedVisible = computed(() => demodulate(signal.raw.visible, pulseDuration.value));
        const demodulatedAfterVisible = computed(() => demodulate(signal.raw.afterVisible, pulseDuration.value));

        signal.demodulated.beforeVisible = demodulatedBeforeVisible;
        signal.demodulated.visible = demodulatedVisible;
        signal.demodulated.afterVisible = demodulatedAfterVisible;
        signal.demodulated.full = computed(() => signal.demodulated.beforeVisible.concat(signal.demodulated.visible, signal.demodulated.afterVisible))
        signal.smoothed.beforeVisible = computed(() => smooth(demodulatedBeforeVisible.value, pulseDuration.value));
        signal.smoothed.visible = computed(() => smooth(demodulatedVisible.value, pulseDuration.value));
        signal.smoothed.afterVisible = computed(() => smooth(demodulatedAfterVisible.value, pulseDuration.value));
        signal.smoothed.full = computed(() => signal.smoothed.beforeVisible.concat(signal.smoothed.visible, signal.smoothed.afterVisible))

        const options = {
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: 'Time (µs)'
                    }
                },
                y: {
                    title: {
                        display: false,
                        text: 'State'
                    },
                    min: 0,
                    max: 1,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false,
                },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x',
                        onPanComplete: ({ chart }) => {
                            const xScale = chart.scales.x;
                            updateVisiblePoints(xScale.min, xScale.max);
                        },
                    },
                    zoom: {
                        pinch: {
                            enabled: true,
                        },
                        drag: {
                            enabled: true,
                            backgroundColor: 'rgb(169,253,216)', // Selection box color
                            borderColor: 'rgba(225,225,225)',
                            borderWidth: 1,
                            modifierKey: 'ctrl'
                        },
                        mode: 'x', // Only allow selection on the X-axis
                        onZoomComplete: ({ chart }) => {
                            const xScale = chart.scales.x;
                            updateVisiblePoints(xScale.min, xScale.max);
                        },
                        wheel: {
                            enabled: true
                        },
                    },
                }
            }
        };

        // function findLongestPauses(binaryData) {
        //     const pauseMatches = binaryData.match(/0+/g);
        //     const longestPause = pauseMatches.reduce((max, pause) => pause.length > max.length ? pause : max, pauseMatches[0]);
        //     return longestPause;
        // }
        // function splitByLongestPauses(binaryData) {
        //     const packets = binaryData.demodulated.split(binaryData.longestPause);
        //     return packets.filter(packet => packet !== ''); // Filter out any empty strings
        // }

        // const packets = splitByLongestPauses(processedSignal.binary);

        const copyContent = async (value) => {
            try {
                await navigator.clipboard.writeText(value);
            } catch (err) {
                // not copied
            }
        }

        return {
            pulseChart,
            parsedData,
            options,
            plugins: [zoomPlugin],
            signal,
            signalValues,
            pulseDuration,
            demodulate,
            smooth,
            viewSettings,
            copyContent,
        };
    }
};
</script>

<style scoped>
canvas {
    max-height: 400px;
    width: 100%;
}
</style>
