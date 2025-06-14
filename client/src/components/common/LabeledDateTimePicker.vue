<script setup>
import Calendar from 'primevue/calendar'
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: Date,
  label: String,
  placeholder: {
    type: String,
    default: '날짜 및 시간을 선택하세요'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showIcon: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const internalValue = ref(props.modelValue ?? new Date())

watch(() => props.modelValue, (val) => {
  if (val) internalValue.value = val
})

watch(internalValue, (val) => {
  emit('update:modelValue', val)
})
</script>

<template>
  <div>
    <label class="font-semibold text-xl block mb-2">{{ label }}</label>
    <Calendar
      class="w-full"
      v-model="internalValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :showIcon="showIcon"
      showTime
      showSeconds
      dateFormat="yy.mm.dd"
    />
  </div>
</template>
