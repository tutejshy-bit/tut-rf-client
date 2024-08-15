<template>
    <Dialog v-model:visible="visible" maximizable modal :header="path" position="top" :style="{ width: '50rem' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <div class="container w-full">
            <SwSub :data="fileData" :file="file" :filename="path" v-if="type === '.sub'" />
        </div>
    </Dialog>
</template>

<script>
import { useStore } from '@/store/store'
import { DeviceController } from '@/controllers/device'
import { computed, ref } from "vue";
import { ParseFzSub, ParseTutJson } from "@/utils/file-parsers/parser"
import SwSub from "@/components/SignalWindows/SwSub.vue"

export default {
    components: {
        SwSub,
    },
    setup(props, { expose }) {
        const device = DeviceController();
        const store = useStore()
        const visible = ref(false);
        const path = ref('');
        const file = computed(() => store.files[path.value]);

        const type = computed(() => path.value.slice(path.value.lastIndexOf(".")).toLowerCase());
        const fileData = computed(() => {
            let data = {};
            switch (type.value) {
                case '.json':
                    data = ParseTutJson(file.value);
                    break;
                case '.sub':
                    data = ParseFzSub(file.value);
                    break;
            }

            return data;
        })

        const show = () => {
            if (store.files[path.value] === undefined) {
                device.loadFileData(path.value, () => visible.value = true)
            } else {
                visible.value = true
            }
        }
        const hide = () => visible.value = false;

        expose({
            show: show,
            hide: hide,
            path: path,
        })

        const transmitBinary = () => {
            const f = file.value;
            device.transmitBinary(
                f.frequency,
                f.pulseDuration,
                f.binary,
                f.module,
                f.modulation,
                f.deviation,
                f.repeatCount
            );
        }

        return {
            path,
            fileData,
            visible,
            type,
            file,
            transmitBinary,
        }
    }
}
</script>
