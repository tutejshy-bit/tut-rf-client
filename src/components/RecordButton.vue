<template>
    <Button v-if="store.deviceMode.cc1101[num] === 'RecordSignal'" @click="$emit('stop-record', num)" v-bind="$attrs" size="small" severity="danger">
        <e-icon icon="stop-circle-outline" size="small" prepended /> Stop
    </Button>
    <Button v-if="store.deviceMode.cc1101[num] !== 'RecordSignal'" @click="$emit('start-record', num)" v-bind="$attrs" size="small" severity="info">
        <e-icon icon="record-circle-outline" size="small" prepended /> Record
    </Button>
</template>

<script>
import { useStore } from '@/store/store'

export default {
    emits: ['start-record', 'stop-record'],
    props: {
        num: {
            type: Number,
            required: true
        }
    },
    setup(num) {
        const store = useStore();
        return {
            store,
        }
    }
 }
</script>
