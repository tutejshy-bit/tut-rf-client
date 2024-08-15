<template>
    <e-icon icon="signal-cellular-3" v-if="rssi >= -30" v-bind="$attrs" />
    <e-icon icon="signal-cellular-2" v-if="rssi >= -67 && rssi < -30" v-bind="$attrs" />
    <e-icon icon="signal-cellular-1" v-if="rssi >= -70 && rssi < -67" v-bind="$attrs" />
    <e-icon icon="signal-cellular-outline" v-if="rssi < -70" v-bind="$attrs" />
</template>

<script setup>
const props = defineProps({
    rssi: {
        type: Number,
        required: true
    }
})
</script>
