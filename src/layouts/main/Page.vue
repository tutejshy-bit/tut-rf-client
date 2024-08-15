<template>
    <div class="container mx-auto max-w-[800px]">
        <div class="pt-5" v-if="slots['actions-top']">
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
import { mobile } from '@/utils/mobile-checker'

export default {
    setup() {
        const slots = useSlots()

        return { slots, mobile }
    }
}
</script>