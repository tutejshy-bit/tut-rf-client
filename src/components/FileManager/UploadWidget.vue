<template>
    <FileUpload :multiple="true" custom-upload @uploader="uploadFile" accept="*" :maxFileSize="30480">
        <template #header="{ chooseCallback, uploadCallback, clearCallback, files }">
            <div class="flex flex-wrap justify-content-between align-items-center flex-1 gap-2">
                <div class="flex gap-2">
                    <Button severity="info" @click="chooseCallback()" size="small" outlined class="font-medium">
                        <e-icon icon="file-plus-outline" size="small" prepended/>
                        Choose
                    </Button>
                    <Button @click="uploadCallback" size="small" outlined severity="success" :disabled="!files || files.length === 0" class="font-medium">
                        <e-icon icon="upload-outline" size="small" prepended/>
                        Upload
                    </Button>
                    <Button @click="clearCallback()" outlined severity="danger" :disabled="!files || files.length === 0" class="font-medium" size="small">
                        <e-icon icon="close" size="small" prepended/>
                        Clear
                    </Button>
                </div>
            </div>
        </template>
        <template #content="{ files, removeFileCallback }">
            <template v-if="files.length > 0">
                <div v-for="file of files" :key="file.name + file.type + file.size" class="w-max my-4 ">
                    <span class="align-middle">
                        <e-icon icon="flipper-zero" size="x-small" prepended /> <span class="font-medium">{{ file.name }}</span> <span class="font-light">{{ formatSize(file.size) }}</span>
                        <Button  text severity="warning" size="small" class="font-medium p-0 ml-4 align-middle" rounded>
                            <e-icon icon="close" size="small" @click="removeFileCallback"/>
                        </Button>
                    </span>
                </div>
            </template>
        </template>
        <template #empty>
            <div class="text-center">
                <e-icon icon="upload-outline" />
                <p class="mt-4 mb-0">Drag and drop files to here to upload.</p>
            </div>
        </template>
    </FileUpload>
</template>
<script>
import { DeviceController } from '@/controllers/device'
import { usePrimeVue } from 'primevue/config';

export default {
    setup(props, {emit}) {
        const device = DeviceController();
        const $primevue = usePrimeVue();

        const uploadFile = async (event) => {
            for (const file of event.files) {
                await device.upload(file);
            }
            emit('upload-finished');
        }

        const formatSize = (bytes) => {
            const k = 1024;
            const dm = 3;
            const sizes = $primevue.config.locale.fileSizeTypes;

            if (bytes === 0) {
                return `0 ${sizes[0]}`;
            }

            const i = Math.floor(Math.log(bytes) / Math.log(k));
            const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

            return `${formattedSize} ${sizes[i]}`;
        };

        return {
            uploadFile,
            formatSize,
        }
    }
}
</script>
