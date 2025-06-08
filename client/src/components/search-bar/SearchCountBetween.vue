<script setup>
import { watch, ref } from 'vue';

const props = defineProps({
    label: String,
    from: String,
    to: String
});

const emit = defineEmits(['update:from', 'update:to']);

const qtyFrom = ref(props.from);
const qtyTo = ref(props.to);

watch(qtyFrom, (val) => emit('update:from', val));
watch(qtyTo, (val) => emit('update:to', val));

watch(() => props.from, (val) => qtyFrom.value = val);
watch(() => props.to, (val) => qtyTo.value = val);

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