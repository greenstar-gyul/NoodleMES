<script setup>
import { ref, watch } from 'vue'
import Calendar from 'primevue/calendar'

const props = defineProps({
  label: { type: String, required: true },
  modelValue: { type: Date, default: null },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  showIcon: { type: Boolean, default: true },
  showTime: { type: Boolean, default: true },
  readonly: { type: Boolean, default: false },
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


<template>
  <div class="flex items-center gap-3">
    <div class="font-semibold text-xl w-32">{{ label }}</div>
    <Calendar
      v-model="dateValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :showIcon="showIcon"
      :showTime="showTime"
      :showSeconds="false"
      :readonly="readonly"
      dateFormat="yy-mm-dd"
      class="flex-1"
    />
  </div>
</template>


