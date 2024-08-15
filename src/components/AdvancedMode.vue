<template>
    <span class="align-top">Advanced Mode</span> <InputSwitch v-model="store.state.advancedMode" color="primary" hide-details class="advanced-mode" :invalid="!store.state.advancedMode"></InputSwitch>
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

<style scoped>
.advanced-mode {
    margin: 5px;
}
</style>
