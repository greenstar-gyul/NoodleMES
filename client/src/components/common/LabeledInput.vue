<!-- LabeledInput.vue -->
<script setup>
import InputText from 'primevue/inputtext';
import { defineProps } from 'vue';

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  placeholder: String,
  disabled: Boolean,
  type: {
    type: String,
    default: 'text'
  }
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div>
    <label class="font-semibold text-xl block mb-2">{{ label }}</label>
    <InputText
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :modelValue="modelValue"
      @update:modelValue="emit('update:modelValue', $event)"
      class="w-full"
    />
  </div>
</template>
