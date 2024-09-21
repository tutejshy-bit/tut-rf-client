<template>
    <span class="align-top mr-2">Advanced Mode</span> <InputSwitch v-model="store.state.advancedMode" color="primary" :invalid="!store.state.advancedMode" />
</template>
  
<script setup>
import { useStore } from '@/store/store';

const store = useStore()

const props = defineProps({
    switcher: {
        type: Boolean,
        default: true
    },
});
</script>