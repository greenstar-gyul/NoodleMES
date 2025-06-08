<template>
  <div class="flex items-center gap-3">
    <div class="font-semibold text-xl w-32">{{ label }}</div>
    <Textarea
      v-model="internalValue"
      :placeholder="placeholder"
      :autoResize="true"
      :rows="rows"
      :cols="cols"
      class="flex-1"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Textarea from 'primevue/textarea'

const props = defineProps({
  label: { type: String, required: true },
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  rows: { type: Number, default: 1 },
  cols: { type: Number, default: 30 }
})

const emit = defineEmits(['update:modelValue'])

const internalValue = ref(props.modelValue)

// 외부에서 값이 바뀌면 내부도 업데이트
watch(() => props.modelValue, (val) => {
  if (val !== internalValue.value) internalValue.value = val
})

// 내부 값이 바뀌면 외부에 알림
watch(internalValue, (val) => {
  if (val !== props.modelValue) emit('update:modelValue', val)
})
</script>
