<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import SearchText from '@/components/search-bar/SearchText.vue';
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue';

import MprData from '@/service/MprData.js';
import LabeledInput from '../../../components/registration-bar/LabeledInput.vue';

const emit = defineEmits(['search', 'reset']);

// 데이터 및 옵션
// const mprdata = ref(MprData);

// 검색 조건 초기값
const search = ref({
  mpr_code: '',
  req_date_from: null,
  req_date_to: null,
  deadline: '',
  mrp_code: '',
  mcode: '',
  // line: ''
});

// 초기화
const resetSearch = () => {
  search.value = {
    mpr_code: '',
    req_date_from: null,
    req_date_to: null,
    deadline: '',
    mrp_code: '',
    mcode: '',
    // line: ''
  };
  mprdata.value = [...MprData];
  emit('reset');
};
</script>

<template>
  <!-- 헤더 영역 -->
  <!-- 조회/초기화 버튼
  <div class="flex justify-center gap-3 mt-4">
    <Button label="초기화" severity="contrast" @click="resetSearch" />
    <Button label="조회" severity="info" @click="fetchOrders" />
  </div>
  -->
  
  <!-- 검색바 영역 -->
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <div class="flex justify-between">
        <div>
            <div class="font-semibold text-2xl">기본정보</div>
        </div>
        <div class="flex items-center gap-2 flex-nowrap">
            <Button label="삭제" severity="danger" class="min-w-fit" @click="handleDelete" />
            <Button label="초기화" severity="contrast" class="min-w-fit" @click="handleReset" />
            <Button label="저장" severity="info" class="min-w-fit" @click="handleSave" />
            <Button
                label="주문정보 불러오기"
                severity="success"
                class="min-w-fit whitespace-nowrap"
                @click="orderPopupVisible = true"
            />
        </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      <!-- 구매요청코드 -->
      <LabeledInput label="요청코드" placeholder="요청코드입력"/>
      
      <!-- 요청자 -->
      <LabeledInput label="요청자" placeholder="요청자입력"/>

      <!-- 요청부서 -->
      <LabeledInput label="요청부서" placeholder="요청부서입력"/>

      <!-- 납기일자 -->
      <LabeledInput label="납기일자" placeholder="납기일자입력"/>

      <!-- 요청일자 -->
      <LabeledInput label="요청일자" placeholder="요청일자입력"/>
    </div>
  </div>
</template>