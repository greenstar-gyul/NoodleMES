<template>
    <div class="flex items-center gap-3 w-full search-input">
        <label class="font-semibold w-24">{{ label }}</label>
        <InputText :placeholder="placeholder" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" class="flex-1" />
    </div>
</template>

<script setup>
defineProps({
  label: String,
  placeholder: String,
  modelValue: String
});
</script>