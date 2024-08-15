export const CC1101 = {
    IOCFG2: '00',       // GDO2 output pin configuration
    IOCFG1: '01',       // GDO1 output pin configuration
    IOCFG0: '02',       // GDO0 output pin configuration
    FIFOTHR: '03',      // RX FIFO and TX FIFO thresholds
    SYNC1: '04',        // Sync word, high INT8U
    SYNC0: '05',        // Sync word, low INT8U
    PKTLEN: '06',       // Packet length
    PKTCTRL1: '07',     // Packet automation control
    PKTCTRL0: '08',     // Packet automation control
    ADDR: '09',         // Device address
    CHANNR: '0A',       // Channel number
    FSCTRL1: '0B',      // Frequency synthesizer control
    FSCTRL0: '0C',      // Frequency synthesizer control
    FREQ2: '0D',        // Frequency control word, high INT8U
    FREQ1: '0E',        // Frequency control word, middle INT8U
    FREQ0: '0F',        // Frequency control word, low INT8U
    MDMCFG4: '10',      // Modem configuration
    MDMCFG3: '11',      // Modem configuration
    MDMCFG2: '12',      // Modem configuration
    MDMCFG1: '13',      // Modem configuration
    MDMCFG0: '14',      // Modem configuration
    DEVIATN: '15',      // Modem deviation setting
    MCSM2: '16',        // Main Radio Control State Machine configuration
    MCSM1: '17',        // Main Radio Control State Machine configuration
    MCSM0: '18',        // Main Radio Control State Machine configuration
    FOCCFG: '19',       // Frequency Offset Compensation configuration
    BSCFG: '1A',        // Bit Synchronization configuration
    AGCCTRL2: '1B',     // AGC control
    AGCCTRL1: '1C',     // AGC control
    AGCCTRL0: '1D',     // AGC control
    WOREVT1: '1E',      // High INT8U Event 0 timeout
    WOREVT0: '1F',      // Low INT8U Event 0 timeout
    WORCTRL: '20',      // Wake On Radio control
    FREND1: '21',       // Front end RX configuration
    FREND0: '22',       // Front end TX configuration
    FSCAL3: '23',       // Frequency synthesizer calibration
    FSCAL2: '24',       // Frequency synthesizer calibration
    FSCAL1: '25',       // Frequency synthesizer calibration
    FSCAL0: '26',       // Frequency synthesizer calibration
    RCCTRL1: '27',      // RC oscillator configuration
    RCCTRL0: '28',      // RC oscillator configuration
    FSTEST: '29',       // Frequency synthesizer calibration control
    PTEST: '2A',        // Production test
    AGCTEST: '2B',      // AGC test
    TEST2: '2C',        // Various test settings
    TEST1: '2D',        // Various test settings
    TEST0: '2E'         // Various test settings
  };

const Modulation = {

}

const OscillatorFrequency = 26e6;

export const dataRateToHex = (dataRate) => {
    const drateRaw = dataRate * 1000;
    const drate_e = Math.floor((Math.log2(drateRaw * (1<<20) / OscillatorFrequency))) & 0x0F;
    const drate_m = Math.round(((drateRaw * (1<<28)) / (OscillatorFrequency * (1 << drate_e))) - 256);
    const e = drate_e.toString(16).toUpperCase();
    const m = drate_m.toString(16).toUpperCase();


    return { e, m };
}

export const deviationToHex = (deviation) => {
    const deviationRaw = deviation * 1000;
    const deviation_e = Math.floor(Math.log2(deviationRaw * (1 << 14) / OscillatorFrequency)) & 0x07;
    const deviation_m = Math.round((((deviationRaw * (1 << 17)) / (OscillatorFrequency * (1 << deviation_e))) - 8)) & 0x07;
    const e = deviation_e.toString(16).toUpperCase();
    const m = deviation_m.toString(16).toUpperCase();

    return { e, m };
}

const bandwidthList = [
    812000,
    650000,
    541000,
    464000,
    406000,
    325000,
    270000,
    232000,
    203000,
    162000,
    135000,
    116000,
    102000,
    81000,
    68000,
    58000
];


export const bandwidthToHex = (bandwidth) => {
    const bandwidthRaw = bandwidth * 1000;
    let bandwidth_index = 15;

    for (let i = 0; i < 16; i++)
    {
        if (bandwidthRaw >= bandwidthList[i])
        {
            bandwidth_index = i;
            break;
        }
    }

    const bandwidth_hex = bandwidthList[bandwidth_index].toString(16).toUpperCase();
    return bandwidth_hex;
}

export const frequencyToHex = (frequency) => {
    const frequencyRaw = frequency * 1000000;
    const frequencyWord = frequencyRaw * (1<<16) / OscillatorFrequency;

    const frequency_high = (frequencyWord >> 16) & 0xFF;
    const frequency_middle = (frequencyWord >> 8) & 0xFF;
    const frequency_low = (frequencyWord) & 0xFF;

    const high = frequency_high.toString(16).toUpperCase();
    const middle = frequency_middle.toString(16).toUpperCase();
    const low = frequency_low.toString(16).toUpperCase();

    return { high, middle, low };
}

const hexToFrequency = (high, middle, low) => {
    // Convert hex values to decimal
    const frequency_high = parseInt(high, 16);
    const frequency_middle = parseInt(middle, 16);
    const frequency_low = parseInt(low, 16);

    // Combine the three parts into a single frequency word
    const frequencyWord = (frequency_high << 16) | (frequency_middle << 8) | frequency_low;

    // Convert the frequency word back to the frequency in MHz
    const frequencyRaw = (frequencyWord * OscillatorFrequency) / (1 << 16);
    const frequency = frequencyRaw / 1000000;

    return frequency;
}

const hexToBandwidth = (value) => {
    const registryValue = parseInt(value, 16);
    const CHANBW_E = (registryValue >> 6) & 0x03;
    const CHANBW_M = (registryValue >> 4) & 0x03;

    const bandwidth = OscillatorFrequency / (8 * (4 + CHANBW_M) * Math.pow(2, CHANBW_E));
    return bandwidth;
}

const hexToModulation = (value) => {
    return (parseInt(value, 16) >> 4) & 7
}

const hexToModulationName = (value) => {
    const mod = hexToModulation(value);
    switch(mod) {
        case 0:
            return '2-FSK';
        case 1:
             return 'GFSK';
        case 3: 
            return 'ASK/OOK';
        case 4:
            return '4-FSK';
        case 7:
            return 'MSK';
    }
    return 'Unknown';
}

const hexToDataRate = (mdmcfg4, mdmcfg3) => {
    const mdmcfg4Value = parseInt(mdmcfg4, 16);
    const mdmcfg3Value = parseInt(mdmcfg3, 16);
    const DRATE_E = (mdmcfg4Value & 0x0F); // lower 4 bits
    const DRATE_M = mdmcfg3Value; // entire byte value
    return (OscillatorFrequency / Math.pow(2, 28)) * (256 + DRATE_M) * Math.pow(2, DRATE_E);
}

const hexToDeviation = (deviatn) => {
    const deviation = parseInt(deviatn, 16);
    const DEVIATION_E = (deviation & 0x70) >> 4;
    const DEVIATION_M = (deviation & 0x07);
    return (OscillatorFrequency / Math.pow(2, 17)) * (8 + DEVIATION_M) * Math.pow(2, DEVIATION_E);
}

export const getConfigValues = (config) => {
    const frequency = hexToFrequency(config[CC1101.FREQ2], config[CC1101.FREQ1], config[CC1101.FREQ0]);
    const bandwidth = hexToBandwidth(config[CC1101.MDMCFG4]);
    const modulation = hexToModulation(config[CC1101.MDMCFG2]);
    const modulationName = hexToModulationName(config[CC1101.MDMCFG2]);
    const dataRate = hexToDataRate(config[CC1101.MDMCFG4], config[CC1101.MDMCFG3]);
    const deviation = hexToDeviation(config[CC1101.DEVIATN]);
    return {frequency, bandwidth, modulation, modulationName, dataRate, deviation};
}