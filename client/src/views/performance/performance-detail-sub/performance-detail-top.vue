<script setup>
import { defineProps } from 'vue';

import LabeledInput from '@/components/registration-bar/LabeledInput.vue';
import LabeledDateTimePicker from '@/components/registration-bar/LabeledDateTimePicker.vue';

const props = defineProps({
  detail: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <div class="grid grid-cols-1 gap-4">
      <div class="font-semibold text-2xl">작업진행 정보</div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="공정명" v-model="props.detail.prdr_code" :readonly="true" />
      <LabeledInput label="제품명" v-model="props.detail.prod_code" :readonly="true" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="라인명" v-model="props.detail.work_order_code" :readonly="true" />
      <LabeledInput label="제품명" v-model="props.detail.line_code" :readonly="true" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledDateTimePicker label="시작일시" v-model="props.detail.start_date" :readonly="true" />
      <LabeledDateTimePicker label="종료일시" v-model="props.detail.end_date" :readonly="true" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="지시량" v-model="props.detail.wko_qtt" :readonly="true" />
      <LabeledInput label="생산량" v-model="props.detail.production_qtt" :readonly="true" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="불량" v-model="props.detail.peform_rate" :readonly="true" />
      <LabeledInput label="진행률" v-model="props.detail.peform_rate" :readonly="true" />
    </div>
  </div>
</template>
