<script setup>
import DatePicker from 'primevue/datepicker';
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: Date,
  label: String,
  placeholder: {
    type: String,
    default: '날짜 선택'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showIcon: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue']);
const internalValue = ref(props.modelValue ?? new Date());

watch(() => props.modelValue, (val) => {
  if (val) internalValue.value = val;
});

watch(internalValue, (val) => {
  emit('update:modelValue', val);
});
</script>

<template>
  <div>
    <label class="font-semibold text-xl block mb-2">{{ label }}</label>
    <DatePicker
      class="w-full"
      v-model="internalValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :showIcon="showIcon"
      dateFormat="yy.mm.dd"
    />
  </div>
</template>
