<template>
    <PageLayout>
        <template #actions-top>
            <Button @click="device.requestState">Update state</Button>
        </template>
        <template #content>
            <Card>
                <template #title>Debug info</template>
                <template #content>
                    <p class="m-0">
                        <pre class="overflow-x-auto">
{{ store.state }}
                        </pre>
                    </p>
                </template>
            </Card>
            
        </template>
    </PageLayout>
</template>

<script>
import { useStore } from '@/store/store'
import { computed } from 'vue'
import { CC1101 } from '@/lib/cc1101-calculator'
import { DeviceController } from '@/controllers/device'
import PageLayout from '../layouts/main/Page.vue'

export default {
    components: {
        PageLayout,
    },
    setup() {
        const store = useStore();
        const deviceState = computed(() => store.state.device);
        const cc1101 = computed(() => store.state.cc1101);
        const device = DeviceController();


        return {
            CC1101,
            store,
            device,
            deviceState,
            cc1101,
        }
    }
}
</script>
