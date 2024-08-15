import { defineStore } from 'pinia'
import { computed, reactive } from 'vue'
import { State } from '@/types'

export const useStore = defineStore('store', () => {
    const state = reactive({
        device: {
            freeHeap: 0
        },
        cc1101: [
            {
                id: 0,
                mode: State.Device.Idle
            }
        ],
        connected: false,
        advancedMode: false,
        detector: {
            detectedFrequencies: [],
            signalDetectionMinRssi: 0,
            settings: {
                module: -1
            }
        },
        recorded: {
            signals: {
                files: [],
                loaded: false,
                expandedDirectories: { "": true },
                changed: false
            },
            runtime: {
                files: []
            }
        },
        files: {
        },
        request: {
            action: '',
            loading: false
        },
        modules: {
            1: {
                transmitMode: false,
                frequency: 0,
                deviation: 0,
                dcFilterOff: false,
                rxBandwidth: 0,
                dataRate: 0
            },
            2: {
                transmitMode: false,
                frequency: 0,
                deviation: 0,
                dcFilterOff: false,
                rxBandwidth: 0,
                dataRate: 0
            }
        },
        recordConfigs: [],
        transmitConfigs: [],
    });

    const recordedSignals = computed(() => state.recorded.signals);
    const detectedFrequencies = computed(() => state.detector.detectedFrequencies);
    const deviceMode = computed(() => {
        const cc1101 = {};
        for (const module of state.cc1101) {
            cc1101[module.id] = module.mode;
        }
        return {cc1101: cc1101};
    });
    const files = computed(() => state.files);
    const isConnected = computed(() => state.connected);
    const cc1101Modules = computed(() => state.cc1101.map(module => {return {name: 'Module ' + (module.id + 1), id: module.id, key: 'module' + module.id}}));

    const clearDetectedFrequencies = () => state.detector.detectedFrequencies = [];

    return {
        state,
        recordedSignals,
        detectedFrequencies,
        deviceMode,
        files,
        isConnected,
        cc1101Modules,
        clearDetectedFrequencies,
    };
})
