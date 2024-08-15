<template>
    <Dialog v-model:visible="visible" modal class="w-1/2 max-w-96" position="top">
        <template #header>
            <span class="align-start">
                <e-icon icon="content-save-outline" size="small" prepended /> <span class="align-top">{{ title }}</span>
            </span>
        </template>
        <InputText id="filename" v-model="filename" placeholder="File Name" class="w-full"/>
        <template #footer>
            <Button severity="primary" @click="save">Save</Button>
            <Button severity="secondary" @click="visible = false">Cancel</Button>
        </template>
    </Dialog>
</template>

<script>
import { DeviceController } from '@/controllers/device'
import {ref} from 'vue';

export default {
    emits: [
        'saved',
    ],
    setup(props, {emit, expose}) {
        const device = DeviceController();
        const visible = ref(false);
        const filename = ref('');
        const title = ref('Save File');
        const content = ref();

        const show = () => visible.value = true;
        const hide = () => visible.value = false;

        expose({
            filename: filename,
            title: title,
            content: content,
            show: show,
            hide: hide,
        })

        const save = () => {
            const file = new File([content.value], filename.value, { type: "text/plain" });
            device.upload(file);
            hide();
            emit('saved', {filename: filename.value, content: content.value});
        }

        return {
            visible,
            filename,
            title,
            save
        }
    }
}
</script>
