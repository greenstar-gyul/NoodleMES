<script setup>
import { ref } from 'vue';
import axios from 'axios';
import Button from 'primevue/button';
import moment from 'moment';

import LabeledInput from '@/components/registration-bar/LabeledInput.vue';
import LabeledInputIcon from '@/components/registration-bar/LabeledInputIcon.vue';
import LabeledDatePicker from '@/components/registration-bar/LabeledDatePicker.vue';
import LabeledTextarea from '@/components/registration-bar/LabeledTextarea.vue';

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
      <LabeledInput label="생산계획코드" v-model="prdp_code" placeholder="생산계획코드" :disabled="true" />
      <LabeledInput label="계획명" v-model="prdp_name" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="계획일자" v-model="prdp_date" :disabled="true" />
      <LabeledInput label="작성자" v-model="reg" placeholder="작성자명" :disabled="true" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledDatePicker label="계획시작일" v-model="start_date" />
      <LabeledDatePicker label="계획종료일" v-model="end_date" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInputIcon label="주문코드"  placeholder="검색" v-model="ord_code"/>
      <LabeledDatePicker label="납기일자" v-model="due_date" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledTextarea label="비고" v-model="note" placeholder="특이사항 입력" />
    </div>
  </div>

</template>