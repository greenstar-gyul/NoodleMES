<script setup>
import Checkbox from 'primevue/checkbox'
import { defineProps, defineEmits } from 'vue'

// Props
const props = defineProps({
  modelValue: Boolean,
  label: String,
  disabled: Boolean,
  trueValue: { type: [String, Boolean], default: true },
  falseValue: { type: [String, Boolean], default: false }
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div>
    <label class="font-semibold text-xl block mb-2">{{ label }}</label>
    <Checkbox
      :binary="true"
      :modelValue="modelValue"
      :disabled="disabled"
      @update:modelValue="emit('update:modelValue', $event)"
    />
  </div>
</template>
