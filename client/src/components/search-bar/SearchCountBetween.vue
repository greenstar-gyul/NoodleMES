<script setup>
import { watch, toRef } from 'vue';

const props = defineProps({
    label: String,
    from: Number,
    to: Number
});

const emit = defineEmits(['update:from', 'update:to']);

const qtyFrom = toRef(props, 'from');
const qtyTo = toRef(props, 'to');

watch(qtyFrom, (val) => emit('update:from', val));
watch(qtyTo, (val) => emit('update:to', val));
</script>
<template>
<div class="flex items-center gap-3 w-full">
    <label class="font-semibold w-24">{{ label }}</label>
    <div class="flex items-center flex-1 gap-2">
        <InputText v-model="qtyFrom" class="flex-1" />
        <span>~</span>
        <InputText v-model="qtyTo" class="flex-1" />
    </div>
</div>
</template>
<style></style>