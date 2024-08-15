export const ParseTutJson = (data) => {
    return {
        frequency: data.frequency,
        raw: data.raw,
        binary: data.binary,
        smoothed: data.smoothed,
        dataRate: data.dataRate,
        deviation: data.deviation,
        modulation: data.modulation,
        pulseDuration: data.pulseDuration,
        samplesCount: data.samplesCount,
        rxBandwidth: data.rxBandwidth,
        preset: data.preset,
    }
}

export const ParseFzSub = (data) => {

    const parseV1 = (lines) => {
        const presets = {
            "FuriHalSubGhzPresetOok270Async": {
                modulation: 2,
                rxBandwidth: 270.83,
            },
            "FuriHalSubGhzPresetOok650Async": {
                modulation: 2,
                rxBandwidth: 650,
            },
            "FuriHalSubGhzPreset2FSKDev238Async": {
                modulation: 0,
                deviation: 2.38,
                dataRate: 4.8,
                rxBandwidth: 270.83,
            },
            "FuriHalSubGhzPreset2FSKDev476Async": {
                modulation: 0,
                deviation: 47.6,
                dataRate: 4.8,
                rxBandwidth: 270.83,
            }

        }
        let result = {};
        for (const [index, line] of lines) {
            if (line === undefined || line.trim() === '') continue;
            const [key, value] = line.split(':').map(part => part.trim());

            switch (key) {
                case 'Preset':
                    if (presets[value] === undefined) throw `Unknown preset ${value} for .sub`
                    result = {...result, ...presets[value]};
                    break;
                case 'Custom_preset_module':
                case 'Custom_preset_data':
                    lines.splice(index, 1);
                    break;
            }
        }

        for (const line of lines) {
            if (line.trim() === '') continue;
            const [key, value] = line.split(':').map(part => part.trim());

            switch (key) {
                case 'Protocol':
                    result['protocol'] = value.trim();
                    break;
                case 'RAW_Data':
                    if (result['raw'] === undefined) result['raw'] = [];
                    result['raw'].push(value.split(' ').map(Number));
                    break;
            }
        }

        return result;
    }

    const lines = data.split(/\r?\n/);
    const filteredLines = lines.filter(line => !line.trim().startsWith('#'));

    let result = {};

    const filetype = filteredLines.shift().split(':')[1].trim();
    const version = Number(filteredLines.shift().split(':')[1].trim());
    const frequency = filteredLines.shift().split(':')[1].trim();

    if (!["Flipper SubGhz Key File", "Flipper SubGhz RAW File"].includes(filetype)) {
        throw `Wrong Filetype for .sub file '${filetype}'`;
    }

    switch (version) {
        case 1:
            data = parseV1(lines);
            break;
        default:
            throw `Unsupported .sub version "${version}"`
    }

    result['frequency'] = frequency;
    result = {...result, ...data};

    return result;
}


export default ParseTutJson
