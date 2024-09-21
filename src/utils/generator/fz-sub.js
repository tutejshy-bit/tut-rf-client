import {dataRateToHex, deviationToHex, bandwidthToHex} from '@/lib/cc1101-calculator'

const presets = [
    'FuriHalSubGhzPresetOok270Async',
    'FuriHalSubGhzPresetOok650Async',
    'FuriHalSubGhzPreset2FSKDev238Async',
    'FuriHalSubGhzPreset2FSKDev476Async',
];

const Modulation = {
    '2-FSK': 0,
    'GFSK': 1,
    'ASK/OOK': 3,
    '4-FSK': 4,
    'MSK': 7,
}

const getKeyByValue = (object, value) => Object.keys(object).find(key => object[key] === value);

const ConfigurationRegister = {
    MDMCFG4: '10', // Modem Configuration
    MDMCFG3: '11', // Modem Configuration
    MDMCFG2: '12', // Modem Configuration
    DEVIATN: '15', // Modem Configuration
    FREND0: '22', // Modem Configuration
}

function splitStringByWords(text, wordLimit) {
    const words = text.split(/\s+/); // Split by any whitespace

    let chunks = [];

    for (let i = 0; i < words.length; i += wordLimit) {
        let chunk = words.slice(i, i + wordLimit);
        chunks.push(chunk.join(' '));
    }

    return chunks;
}

export default class FlipperZeroSubGenerator
{
    #frequency;
    #bandwidth;
    #dataRate;
    #deviation;
    #modulation;
    #dataRaw;
    #version;
    #preset;
    #dcFilter;
    #manchesterEncoding;
    #syncMode;
    #errors = [];

    constructor()
    {
        this.#frequency = null;
        this.#bandwidth = null;
        this.#dataRate = null;
        this.#deviation = null;
        this.#modulation = null;
        this.#dataRaw = null;
        this.#version = 1;
        this.#dcFilter = false;
        this.#manchesterEncoding = false;
        this.#syncMode = 0;

        this.#preset = 'FuriHalSubGhzPresetCustom';
    }

    setModulation(modulation)
    {
        const supportedModulations = ['2-FSK', 'GFSK', 'ASK/OOK', '4-FSK', 'MSK'];

        if (!supportedModulations.includes(modulation)) {
            this.#errors.push(new Error(`Unsupported modulation ${modulation}. Supported ${supportedModulations.join(', ')}`));
        }
        this.#modulation = modulation;
        return this;
    }

    setModulationNum(modulationNum)
    {
        this.setModulation(getKeyByValue(Modulation, modulationNum));
        return this;
    }

    setFrequency(frequency)
    {
        this.#frequency = frequency;
        return this;
    }

    setBandwidth(bandwidth)
    {
        this.#bandwidth = bandwidth;
        return this;
    }

    setDataRate(dataRate)
    {
        this.#dataRate = dataRate;
        return this;
    }

    setDeviation(deviation)
    {
        this.#deviation = deviation;
        return this;
    }

    setPreset(preset)
    {
        this.#preset = preset;
        return this;
    }

    setDataRaw(dataRaw)
    {
        this.#dataRaw = dataRaw;
        return this;
    }

    #generateVersion()
    {
        return `Version: ${this.#version}`;
    }

    #generateFrequency()
    {
        return `Frequency: ${parseInt(this.#frequency * 1000000)}`;
    }

    #generatePreset()
    {
        return `Preset: ${this.#preset}`;
    }

    #generateCustomPresetModule()
    {
        return 'Custom_preset_module: CC1101';
    }

    #generateCustomPresetData()
    {
        const presetRow = [];
        let bwHex = null;
        let dRateHex = null;
        let deviationHex = null;

        if (this.#bandwidth !== null) {
            bwHex = bandwidthToHex(this.#bandwidth);
        }

        if (this.#dataRate !== null) {
            dRateHex = dataRateToHex(this.#dataRate);
        }

        if (this.#deviation !== null) {
            deviationHex = deviationToHex(this.#deviation);
        }

        if (bwHex !== null || dRateHex !== null) {
            presetRow.push(ConfigurationRegister.MDMCFG4);
            presetRow.push(`${bwHex ?? 0}${dRateHex?.e ?? 0}`);
        }

        if (dRateHex !== null) {
            presetRow.push(ConfigurationRegister.MDMCFG3);
            presetRow.push(dRateHex.m);
        }

        if (deviationHex !== null) {
            presetRow.push(ConfigurationRegister.DEVIATN);
            presetRow.push(`${deviationHex.e}${deviationHex.m}`);
        }
        
        if (this.#modulation !== null) {
            presetRow.push(ConfigurationRegister.MDMCFG2);
            const MDMCFG2_NIBBLE_HIGH = (Modulation[this.#modulation] + (this.#dcFilter ? 8 : 0 )).toString(16).toUpperCase();
            const MDMCFG2_NIBBLE_LOW = (this.#syncMode + (this.#manchesterEncoding ? 8 : 0)).toString(16).toUpperCase();
            presetRow.push(`${MDMCFG2_NIBBLE_HIGH}${MDMCFG2_NIBBLE_LOW}`);

            presetRow.push(ConfigurationRegister.FREND0);
            const FREND0 = this.#modulation === 'ASK/OOK' ? '11' : '10';
            presetRow.push(FREND0);
        }

        presetRow.push('00 00 00 C0 00 00 00 00 00 00')

        return 'Custom_preset_data: ' + presetRow.join(' ');
    }

    generateDataRaw()
    {
        if (this.#errors.length > 0) {
            return this.#errors.join("\n");
        }

        const content = [];
        content.push("Filetype: Flipper SubGhz RAW File");
        content.push(this.#generateVersion());
        content.push(this.#generateFrequency());
        content.push(this.#generatePreset());
        if (this.#preset === 'FuriHalSubGhzPresetCustom') {
            content.push(this.#generateCustomPresetModule());
            content.push(this.#generateCustomPresetData());
        }
        content.push('Protocol: RAW');
        if(this.#dataRaw !== null) {
            const rows = splitStringByWords(this.#dataRaw, 512);
            for(const row of rows) {
                content.push(`RAW_Data: ${row}`)
            }
        }

        return content.join("\n");
    }
}