<template>
    <Toolbar width="100%" class="ma-0" density="compact" flat color="secondary">
        <template #start>
            <Button size="small" class="mr-2" @click="transmit">Transmit</Button>
        </template>
    </Toolbar>
    <TabView>
        <TabPanel header="File content">
            <div class="mx-auto pa-5 pt-0 flex-0 break-words file-content whitespace-pre-line text-justify">
                <span class="signal-raw-data text-left">
                    {{ file }}
                </span>
            </div>
        </TabPanel>
        <TabPanel header="Analyse" v-if="inputData">
            <span class="signal-raw-data text-left">
                <PulsePlot :inputData="inputData"></PulsePlot>
            </span>
        </TabPanel>
    </TabView>
</template>
<script>
import { DeviceController } from '@/controllers/device'
import PulsePlot from '@/components/PulsePlot.vue'

export default {
    components: {
        PulsePlot
    },
    props: {
        data: {
            type: Object,
            required: true
        },
        file: {
            type: String,
        },
        filename: {
            type: String,
            required: true
        }
    },

    setup({ data, filename, file }) {
        const { transmitFromFile } = DeviceController();
        const transmit = () => transmitFromFile(filename);

        const getInputData = () => {
            if (data.raw) {
                return data.raw.flat().join(' ')
            }

            return '';
        }

        const inputData = getInputData();

        return {
            transmit,
            inputData,
        }
    }
}
</script>
<style scoped>
.signal-raw-data {
    font-size: 12px;
    font-family: monospace;
}

.file-content {
    height: calc(100vh - 168px);
    max-height: 600px;
}
</style>
