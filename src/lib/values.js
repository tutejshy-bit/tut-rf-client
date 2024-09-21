export const Predefined = {
    Frequencies: [
        '300.00',
        '303.87',
        '304.25',
        '310.00',
        '315.00',
        '318.00',
        '390.00',
        '418.00',
        '433.07',
        '433.42',
        '433.92',
        '434.42',
        '434.77',
        '438.90',
        '868.35',
        '915.00',
        '916.80',
        '925.00',
    ],
    DataRate: {
        Min: 0.0248,
        Max: 1621.83,
    },
    Deviation: {
        Min: 1.5869,
        Max: 380.8593,
    },
    Frequency: {
        Ranges: [
            { Min: 300, Max: 348 },
            { Min: 387, Max: 464 },
            { Min: 779, Max: 928 },
        ]
    },
    Bandwidths: [
        { float: '812.500', value: '812.50' }, // 812 500 Hz
        { float: '650.000', value: '650.00' }, // 650 000 Hz
        { float: '541.667', value: '541.67' }, // 541 667 Hz
        { float: '464.286', value: '464.29' }, // 464 286 Hz
        { float: '406.250', value: '406.25' }, // 406 250 Hz
        { float: '325.000', value: '325.00' }, // 325 000 Hz
        { float: '270.833', value: '270.83' }, // 270 833 Hz
        { float: '232.143', value: '232.14' }, // 232 143 Hz
        { float: '203.125', value: '203.13' }, // 203 125 Hz
        { float: '162.500', value: '162.50' }, // 162 500 Hz
        { float: '135.417', value: '135.41' }, // 135 417 Hz
        { float: '116.071', value: '116.07' }, // 116 071 Hz
        { float: '101.563', value: '101.56' }, // 101 563 Hz
        { float: '81.250', value: '81.25' }, // 81 250 Hz
        { float: '67.708', value: '67.70' }, // 67 708 Hz
        { float: '58.036', value: '58.04' }, // 58 036 Hz
    ],

    Presets: [
        {
            name: 'AM 270',
            value: 'Ook270',
            fzName: 'FuriHalSubGhzPresetOok270Async',
            modulation: 'ASK/OOK (AM)',
            bandwidth: '270.83 kHz',
            dataRate: '3.79 kBaud'
        },
        {
            name: 'AM 650',
            value: 'Ook650',
            fzName: 'FuriHalSubGhzPresetOok650Async',
            modulation: 'ASK/OOK (AM)',
            bandwidth: '650.00 kHz',
            dataRate: '3.79 kBaud'
        },
        {
            name: 'FM 2.38',
            value: '2FSKDev238',
            fzName: 'FuriHalSubGhzPreset2FSKDev238Async',
            modulation: '2-FSK (FM)',
            bandwidth: '270.83 kHz',
            deviation: '2.38 kHz',
            dataRate: '4.80 kBaud'
        },
        {
            name: 'FM 47.6',
            value: '2FSKDev476',
            fzName: 'FuriHalSubGhzPreset2FSKDev476Async',
            modulation: '2-FSK (FM)',
            bandwidth: '270.83 kHz',
            deviation: '47.6 kHz',
            dataRate: '4.80 kBaud'
        }
    ],
};
