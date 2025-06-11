<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import SearchText from '@/components/search-bar/SearchText.vue';
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue';

import MprData from '@/service/MprData.js';

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
  <!-- 검색바 영역 -->
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      <!-- 구매요청코드 -->
      <SearchText v-model="search.mpr_code" label="구매요청코드" placeholder="구매요청코드를 입력하세요" />
      
      <!-- 요청일자 -->
      <SearchDateBetween
        label="요청일자"
        :from="search.req_date_from"
        :to="search.req_date_to"
        @update:from="search.req_date_from = $event"
        @update:to="search.req_date_to = $event"
      />

      <!-- 납기일자 -->
      <SearchDateBetween
        label="납기일자"
        :from="search.deadline_from"
        :to="search.deadline_to"
        @update:from="search.deadline_from = $event"
        @update:to="search.deadline_to = $event"
      />

      <!-- 거래처 -->
      <SearchText v-model="search.client_name" label="거래처" placeholder="거래처 이름을 입력하세요" />

      <!-- 요청자 -->
      <SearchText v-model="search.req_name" label="요청자" placeholder="요청자 이름을 입력하세요" />
    </div>

    <!-- 조회/초기화 버튼 -->
    <div class="flex justify-center gap-3 mt-4">
      <Button label="초기화" severity="contrast" @click="resetSearch" />
      <Button label="조회" severity="info" @click="fetchOrders" />
    </div>
  </div>
</template>