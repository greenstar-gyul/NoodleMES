<template>
  <div class="flex items-center gap-3">
    <div class="font-semibold text-xl w-32">{{ label }}</div>
    <InputText
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :model-value="modelValue"
      @update:modelValue="$emit('update:modelValue', $event)"
      class="flex-1"
    />
  </div>
</template>

<script setup>

defineEmits(['update:modelValue'])

defineProps({
  label: { type: String, required: true },
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'text' },
})

</script>