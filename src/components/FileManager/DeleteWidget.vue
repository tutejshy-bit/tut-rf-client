<template>
    <Dialog v-model:visible="visible" modal position="top" class="w-full max-w-96">
        <template #header>
            <span class="align-start">
                <e-icon icon="trash-can-outline" size="small" /> Are you sure you want to remove?
            </span>
        </template>
        <div class="mb-2">
            <span class="font-light">{{ path.length > 30 ? `${path.slice(0, 15)}...${path.slice(-15)}` : path }}</span>
        </div>
        <template #footer>
            <Button severity="warning" @click="remove">Remove</Button>
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
        const visible = ref(false);
        const path = ref('');

        const show = () => visible.value = true;
        const hide = () => visible.value = false;

        const remove = () => {
            const name = path.value;
            device.remove(name);
            path.value = '';
            hide();
            emit('removed', {path: name});
        }

        expose({
            show: show,
            hide: hide,
            path: path,
        })

        return  {
            visible,
            path,
            remove,
        }
    }
}
</script>
