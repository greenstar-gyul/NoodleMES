<script setup>
import { ref, watch } from 'vue'
import Dropdown from 'primevue/dropdown'

const props = defineProps({
  label: { type: String, required: true },
  modelValue: { type: [String, Number, Object], default: null },
  options: { type: Array, required: true },
  placeholder: { type: String, default: '선택하세요' },
  readonly: { type: Boolean, default: false },
  optionLabel: { type: String, default: 'label' },
  optionValue: { type: String, default: 'value' }
})

const emit = defineEmits(['update:modelValue'])

const internalValue = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  if (val !== internalValue.value) internalValue.value = val
})

watch(internalValue, (val) => {
  if (val !== props.modelValue) emit('update:modelValue', val)
})
</script>
<template>
  <div class="flex items-center gap-3">
    <div class="font-semibold text-xl w-32">{{ label }}</div>
    <Dropdown
      v-model="internalValue"
      :options="options"
      :optionLabel="optionLabel"
      :optionValue="optionValue"
      :placeholder="placeholder"
      :readonly="readonly"
      class="flex-1"
    />
  </div>
</template>


