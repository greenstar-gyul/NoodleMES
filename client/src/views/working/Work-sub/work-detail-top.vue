<script setup>
import { defineProps } from 'vue';
import Button from 'primevue/button';
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
      <div class="font-semibold text-2xl">실적 정보</div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="공정명" v-model="props.detail.prdr_code" :readonly="true" />
      <LabeledInput label="제품명" v-model="props.detail.prod_code" :readonly="true" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="작업지시코드" v-model="props.detail.wko_code" :readonly="true" />
      <LabeledInput label="라인코드" v-model="props.detail.line_code" :readonly="true" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledDateTimePicker label="시작일시" v-model="props.detail.start_date" :readonly="true" />
      <LabeledDateTimePicker label="종료일시" v-model="props.detail.end_date" :readonly="true" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledDateTimePicker label="소요시간" v-model="props.detail.total_time" :readonly="true" />
      <LabeledInput label="작업자" v-model="props.detail.emp_code" :readonly="true" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="목표수량" v-model="props.detail.wko_qtt" :readonly="true" />
      <LabeledInput label="생산수량" v-model="props.detail.make_qtt" :readonly="true" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="불량수량" v-model="props.detail.def_qtt" :readonly="true" />
      <LabeledInput label="달성률" v-model="props.detail.peform_rate" :readonly="true" />
    </div>

    <div class="flex justify-center gap-3 mt-4">
      <Button label="뒤로가기" severity="secondary" raised />
      <Button label="작업시작" severity="success"  raised  /> 
      <Button label="작업시작" severity="contrast" raised />
    </div>

  </div>
</template>
