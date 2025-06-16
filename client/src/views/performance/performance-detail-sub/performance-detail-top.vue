<script setup>
import { ref,defineProps } from 'vue';
import axios from 'axios';

import LabeledInput from '@/components/registration-bar/LabeledInput.vue';
import LabeledDateTimePicker from '@/components/registration-bar/LabeledDateTimePicker.vue';
import LabeledTextarea from '@/components/registration-bar/LabeledTextarea.vue';

defineProps({
  data: {
    type: Object,
    required: true
  }
});

const {
  prdr_code,
  prod_code,
  work_order_code,
  line_code,
  start_date,
  end_date,
  total_time,
  emp_code,
  wko_qtt,
  production_qtt,
  peform_rate,
  note } = data;
</script>

<template>
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <div class="grid grid-cols-1 gap-4">
            <div class="font-semibold text-2xl">실적 정보</div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="생산실적코드" v-model="prdr_code" :readonly="true" />
            <LabeledInput label="제품명" v-model="prod_code" :readonly="true" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="작업지시코드" v-model="work_order_code" :readonly="true" />
            <LabeledInput label="라인코드" v-model="line_code" :readonly="true" />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledDateTimePicker label="시작시간" v-model="start_date" :readonly="true" />
            <LabeledDateTimePicker label="종료시간" v-model="end_date" :readonly="true" />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledDateTimePicker label="소요시간" v-model="total_time" :readonly="true" />
            <LabeledInput label="작업자" v-model="emp_code":readonly="true" />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="목표수량" v-model="wko_qtt" :readonly="true" />
            <LabeledInput label="생산수량" v-model="production_qtt" :readonly="true" />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="달성률" v-model="peform_rate" :readonly="true" />
            <LabeledTextarea label="비고" v-model="note"  readonly />
        </div>
    </div>
</template>
