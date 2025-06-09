<!-- src/components/common/LabeledTextarea.vue -->
<script setup>
import Textarea from 'primevue/textarea';

const props = defineProps({
  modelValue: String,
  label: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: ''
  },
  rows: {
    type: Number,
    default: 5
  },
  autoResize: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div>
    <label class="font-semibold text-xl block mb-2">{{ label }}</label>
    <Textarea
      class="w-full"
      :modelValue="modelValue"
      @update:modelValue="emit('update:modelValue', $event)"
      :placeholder="placeholder"
      :rows="rows"
      :autoResize="autoResize"
      :disabled="disabled"
    />
  </div>
</template>
