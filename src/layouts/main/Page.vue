<template>
    <div class="container mx-auto max-w-[800px]">
        <div class="align-middle my-2" v-if="showStatus && store.state.connected">
            <Cc1101Status v-for="module in store.cc1101Modules" :num="module.id" />
        </div>
        <div v-if="slots['actions-top']">
            <slot name="actions-top">
            </slot>
        </div>
        <div class="page-content" :class="mobile ? 'mobile' : ''">
            <slot name="content"></slot>
        </div>
        <div class="actions bottom-actions">
            <slot name="actions"></slot>
        </div>
    </div>
</template>

<script>
import { useSlots } from 'vue'
import { useStore } from '@/store/store'
import { mobile } from '@/utils/mobile-checker'
import Cc1101Status from '@/components/Cc1101Status.vue'

export default {
    components: { Cc1101Status },
    props: {
        showStatus: {
            type: Boolean,
            default: true
        },
    },
    setup() {
        const slots = useSlots()
        const store = useStore();

        return { slots, store, mobile }
    }
}
</script>