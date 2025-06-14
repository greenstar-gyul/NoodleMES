<script setup>
import { ref } from 'vue';
import axios from 'axios';
import Button from 'primevue/button';
import moment from 'moment';

import LabeledInput from '@/components/registration-bar/LabeledInput.vue';
import LabeledInputIcon from '@/components/registration-bar/LabeledInputIcon.vue';
import LabeledDatePicker from '@/components/registration-bar/LabeledDatePicker.vue';
import LabeledTextarea from '@/components/registration-bar/LabeledTextarea.vue';

const prdp_code = ref('');
const prdp_name = ref('');
const prdp_date = ref('');
const start_date = ref('');
const end_date = ref('');
const due_date = ref('');
const reg = ref('');
const ord_code = ref('');
const note = ref('');

</script>

<template>
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <div class="grid grid-cols-1 gap-4">
      <div class="flex justify-between">
        <div>
          <div class="font-semibold text-2xl">실적 정보</div>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="생산실적코드" v-model="prdr_code"  :disabled="true" />
      <LabeledInput label="제품" v-model="prdp_name" />
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="LOT코드" v-model="lot_num" :disabled="true" />
      <LabeledInput label="공정 유형" v-model="prdp_code" placeholder="생산계획코드" :disabled="true" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledDatePicker label="작업일자" v-model="start_date" />
      <LabeledDatePicker label="작업자" v-model="emp_code" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInputIcon label="시작시간"  v-model="start_date"/>
      <LabeledDatePicker label="완료시간" v-model="end_date" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInputIcon label="소요시간"  v-model="total_time"/>
      <LabeledDatePicker label="완료시간" v-model="due_date" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledTextarea label="비고" v-model="note" placeholder="특이사항 입력" />
    </div>
  </div>

</template>