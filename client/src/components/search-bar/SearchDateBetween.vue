<script setup>
import { watch, toRef } from 'vue';

const props = defineProps({
    label: String,
    from: Date,
    to: Date,
    dateFormat: {
        type: String,
        default: 'yy-mm-dd'
    }
});

const emit = defineEmits(['update:from', 'update:to']);

const internalFrom = toRef(props, 'from');
const internalTo = toRef(props, 'to');

watch(internalFrom, (val) => emit('update:from', val));
watch(internalTo, (val) => emit('update:to', val));
</script>
<template>
    <div class="flex items-center gap-3 w-full">
        <label class="font-semibold w-24">{{ label }}</label>
        <div class="flex items-center flex-1 gap-2">
            <Calendar v-model="internalFrom" class="flex-1" dateFormat="yy-mm-dd" />
            <span>~</span>
            <Calendar v-model="internalTo" class="flex-1" dateFormat="yy-mm-dd" />
        </div>
    </div>
</template>
<style></style>