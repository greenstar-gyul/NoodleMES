<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  label: String,
  modelValue: [String, Number, Object, null],
  options: {
    type: Array,
    default: () => []
  },
  optionLabel: {
    type: String,
    default: 'label'
  },
  optionValue: {
    type: String,
    default: 'value'
  },
  placeholder: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

// 드롭다운 내부에서 쓸 객체 전체
const internalValue = ref(null);

// modelValue가 바뀌면 options에서 해당 객체 찾아서 internalValue 세팅
watch(() => props.modelValue, (newVal) => {
  internalValue.value = props.options.find(opt => opt[props.optionValue] === newVal) || null;
}, { immediate: true });

// internalValue가 바뀌면 해당 객체의 value만 emit
watch(internalValue, (val) => {
  emit('update:modelValue', val?.[props.optionValue] ?? null);
});
</script>

<template>
  <div class="flex items-center gap-3 w-full">
    <label class="font-semibold w-24">{{ label }}</label>
    <Dropdown
      v-model="internalValue"
      :options="options"
      :optionLabel="optionLabel"
      :placeholder="placeholder"
      class="flex-1"
    />
  </div>
</template>
