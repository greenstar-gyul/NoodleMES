<script setup>
import { ref, watch } from 'vue'
import Checkbox from 'primevue/checkbox'

const props = defineProps({
  label: { type: String, required: true },
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const internalValue = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  internalValue.value = newVal
})

watch(internalValue, (newVal) => {
  emit('update:modelValue', newVal)
})
</script>

<template>
  <div class="flex items-center gap-3">
    <div class="font-semibold text-xl w-32">{{ label }}</div>
    <Checkbox
      v-model="internalValue"
      :binary="true"
    />
  </div>
</template>
