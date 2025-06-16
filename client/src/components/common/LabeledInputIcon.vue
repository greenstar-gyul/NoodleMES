<script setup>
import InputText from 'primevue/inputtext';
import { defineProps } from 'vue';

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  placeholder: String,
  disabled: Boolean,
  type: {
    type: String,
    default: 'text'
  },
  icon: {
    type: String,
    default: 'pi pi-search' // 기본은 돋보기
  }
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div>
    <label class="font-semibold text-xl block mb-2">{{ label }}</label>

    <!-- Input wrapper with relative positioning -->
    <div class="relative">
      <InputText
        class="w-full pr-10"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :modelValue="modelValue"
        @update:modelValue="emit('update:modelValue', $event)"
      />
      
      <!-- Icon positioned absolutely -->
      <i :class="icon"
         class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
  </div>
</template>
