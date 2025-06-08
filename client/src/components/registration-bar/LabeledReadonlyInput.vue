<template>
  <div class="flex items-center gap-3">
    <div class="font-semibold text-xl w-32">{{ label }}</div>
    <InputText
      type="text"
      :value="computedValue"
      :disabled="true"
      class="flex-1"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  label: { type: String, required: true },
  value: { type: String, default: '' },
})

const computedValue = props.value || new Date().toLocaleDateString()
</script>