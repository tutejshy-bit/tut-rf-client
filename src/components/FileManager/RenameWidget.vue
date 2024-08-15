<template>
    <Dialog v-model:visible="visible" modal class="w-1/2 max-w-96" position="top">
        <template #header>
            <span class="align-start">
                <e-icon icon="rename-outline" size="small" /> Rename
            </span>
        </template>
        <InputText id="filename" v-model="newName" placeholder="New name" class="w-full"/>
        <template #footer>
            <Button severity="primary" @click="renameDirectory">Rename</Button>
            <Button severity="secondary" @click="visible = false">Close</Button>
        </template>
    </Dialog>
</template>

<script>
import { DeviceController } from '@/controllers/device'
import {ref, watch} from 'vue';

export default {
    emits: [
        'renamed'
    ],
    setup(props, {emit, expose}) {
        const device = DeviceController();
        const newName = ref('');

        const visible = ref(false);
        const fullpath = ref('');
        const path = ref('');
        const name = ref('');

        const show = () => visible.value = true;
        const hide = () => visible.value = false;

        watch(name, (newValue) => newValue ? newName.value = name.value : newName.value = null);

        expose({
            show: show,
            hide: hide,
            path: path,
            name: name,
            fullpath: fullpath
        })

        const renameDirectory = () => {
            const data = {
                from: fullpath.value,
                to: path.value === '' ? newName.value : path.value + '/' + newName.value
            };
            device.rename(data.from, data.to);
            newName.value = '';
            hide();
            emit('renamed', data);
        }

        return {
            newName,
            visible,
            name,
            renameDirectory
        }
    }
}
</script>
