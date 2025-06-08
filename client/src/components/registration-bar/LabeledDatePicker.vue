<template>
  <div class="flex items-center gap-3">
    <div class="font-semibold text-xl w-32">{{ label }}</div>
    <Calendar
      v-model="dateValue"
      :placeholder="placeholder"
      class="flex-1"
      :showIcon="true"
      dateFormat="yy-mm-dd"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  modelValue: { type: Date, default: null },
  placeholder: { type: String, default: '날짜 선택' },
})
const emit = defineEmits(['update:modelValue'])

const dateValue = ref(props.modelValue)

watch(dateValue, (newValue) => {
  emit('update:modelValue', newValue)
})

watch(() => props.modelValue, (newVal) => {
  if (newVal !== dateValue.value) {
    dateValue.value = newVal
  }
})
</script>
