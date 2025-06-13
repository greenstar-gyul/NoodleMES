<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import Button from 'primevue/button';
import SearchText from '@/components/search-bar/SearchText.vue';
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue';

import MprData from '@/service/MprData.js';


// 데이터 및 옵션
// const mprdata = ref(MprData);

const searchmprdate = ref([])

// 검색 조건 초기값
const searchOption = ref({
  mpr_code: '',         // 구매요청코드
  req_date_from: null,  // 요청일자(시작값)
  req_date_to: null,    // 요청일자(마지막값)
  deadline_from: null,  // 납기일자(시작값)
  deadline_to: null,    // 납기일자(마지막값)
  mrp_code: '',         // MRP 코드
  mcode: '',            // 요청자
});

const emit = defineEmits(['searchOption', 'resetSearch']);
const fetchSearch = () => {
  emit('searchOption', searchOption.value); // 조건을 상위로 emit
};

// 초기화
const resetSearchOption  = () => {
  searchOption.value = {
    mpr_code: '',
    req_date_from: null,
    req_date_to: null,
    deadline_from: null,
    deadline_to: null,
    mrp_code: '',
    mcode: '',
  };
};

const handleReset = () => {
  resetSearchOption();               // 검색 조건 초기화
  emit('resetSearch');              // 부모에게 "초기화했어"라고 알림
};

defineExpose({ resetSearchOption }); 

</script>

<template>
  <!-- 검색바 영역 -->
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      <!-- 구매요청코드 -->
      <SearchText v-model="searchOption.mpr_code" label="구매요청코드" placeholder="구매요청코드를 입력하세요" />
      
      <!-- 요청일자 -->
      <SearchDateBetween
        label="요청일자"
        :from="searchOption.req_date_from"
        :to="searchOption.req_date_to"
        @update:from="searchOption.req_date_from = $event"
        @update:to="searchOption.req_date_to = $event"
      />

      <!-- 납기일자 -->
      <SearchDateBetween
        label="납기일자"
        :from="searchOption.deadline_from"
        :to="searchOption.deadline_to"
        @update:from="searchOption.deadline_from = $event"
        @update:to="searchOption.deadline_to = $event"
      />

      <!-- 거래처 -->
      <SearchText v-model="searchOption.mrp_code" label="MRP 코드" placeholder="거래처 이름을 입력하세요" />

      <!-- 요청자 -->
      <SearchText v-model="searchOption.mcode" label="요청자" placeholder="요청자 이름을 입력하세요" />
    </div>

    <!-- 조회/초기화 버튼 -->
    <div class="flex justify-center gap-3 mt-4">
      <Button label="초기화" severity="contrast" @click="handleReset" />
      <Button label="조회" severity="info" @click="fetchSearch" />
    </div>
  </div>
</template>