<template>
    <Toolbar width="100%" class="ma-0" density="compact" flat color="secondary">
        <template #start>
            <Button size="small" class="mr-2" @click="transmit">Transmit</Button>
        </template>
        <template #end>
            <Button variant="text" size="small" text>
                <e-icon icon='content-copy' size="x-small" />
            </Button>
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
        <TabPanel header="Raw">
            <div class="mx-auto pa-5 pt-0 flex-0 break-words file-content">
                <span class="signal-raw-data text-left">
                    <div v-for="raw in data.raw">{{ raw.join(' ') }}
                        <divider />
                    </div>
                </span>
            </div>
        </TabPanel>
    </TabView>
</template>
<script>
import { DeviceController } from '@/controllers/device'

export default {
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

        return {
            transmit
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
