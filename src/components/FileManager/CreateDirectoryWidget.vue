<template>
    <Dialog v-model:visible="visible" modal position="top" class="w-full max-w-96">
        <template #header>
            <span class="align-start">
                <e-icon icon="folder-plus-outline" size="small" /> <span class="align-top font-bold">Create Directory</span>
            </span>
        </template>
        <div class="mb-2">
            In <span class="font-light">{{ path.length > 30 ? `${path.slice(0, 15)}...${path.slice(-15)}` : path }}/</span>
        </div>
        <InputText id="dirname" v-model="directoryName" placeholder="Directory Name" class="w-full" />
        <template #footer>
            <Button severity="primary" @click="createDirectory">Create</Button>
            <Button severity="secondary" @click="visible = false">Close</Button>
        </template>
    </Dialog>
</template>

<script>
import { DeviceController } from '@/controllers/device'
import { ref } from 'vue';

export default {

    setup(props, {emit, expose}) {
        const device = DeviceController();
        const directoryName = ref('');

        const visible = ref(false);
        const path = ref('');

        const show = () => visible.value = true;
        const hide = () => visible.value = false;

        const createDirectory = () => {
            const dir = path.value === '' ? directoryName.value : `${path.value}/${directoryName.value}`
            device.createDirectory(dir);
            directoryName.value = '';
            hide();
            emit('created', {name: dir});
        }

        expose({
            show: show,
            hide: hide,
            path: path,
        })

        return  {
            directoryName,
            visible,
            path,
            createDirectory,
        }
    }
}
</script>
