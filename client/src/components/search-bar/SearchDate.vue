<script setup>
import { watch, ref } from 'vue';

const props = defineProps({
    label: String,
    modelValue: Date,
    dateFormat: {
        type: String,
        default: 'yy-mm-dd'
    },
    placeholder: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:modelValue']);

const internalValue = ref(props.modelValue);

watch(internalValue, (val) => emit('update:modelValue', val));
watch(() => props.modelValue, (val) => internalValue.value = val);
</script>
<template>
    <div class="flex items-center gap-3 w-full">
        <label class="font-semibold w-24">{{ label }}</label>
        <div class="flex items-center flex-1 gap-2">
            <Calendar v-model="internalValue" :placeholder="placeholder" class="flex-1" dateFormat="yy-mm-dd" :showIcon="true"/>
        </div>
    </div>
</template>
<style></style>