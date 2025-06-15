<script setup>
defineEmits(['update:modelValue'])

defineProps({
  label: { type: String, required: true },
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  type: { type: String, default: 'text' },
})
</script>

<template>
  <div class="flex items-center gap-3">
    <div class="font-semibold text-xl w-32">{{ label }}</div>
    <div class="relative flex-1">
      <InputText
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :model-value="modelValue"
        @update:modelValue="$emit('update:modelValue', $event)"
        class="w-full pr-10"
      />
      <i class="pi pi-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
  </div>
</template>


