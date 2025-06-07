<script setup>
import { toRef, watch } from 'vue';

const props = defineProps({
  label: String,
  modelValue: [String, Number, Object],
  options: {
    type: Array,
    default: () => []
  },
  optionLabel: {
    type: String,
    default: 'label'
  },
  optionValue: {
    type: String,
    default: 'value'
  },
  placeholder: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);
const internalValue = toRef(props, 'modelValue');

watch(internalValue, (val) => {
  emit('update:modelValue', val);
});
</script>
<template>
    <div class="flex items-center gap-3 w-full">
        <label class="font-semibold w-24">{{ label }}</label>
        <Dropdown
            v-model="internalValue"
            :options="options"
            :optionLabel="optionLabel"
            :optionValue="optionValue"
            :placeholder="placeholder" class="flex-1" 
        />
    </div>
</template>
<style>
  
</style>