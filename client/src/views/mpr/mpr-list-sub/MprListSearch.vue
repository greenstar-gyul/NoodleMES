<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import TableList from '@/components/form/TableWithExcel.vue';
import SearchText from '@/components/search-bar/SearchText.vue';
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue';

import MprData from '@/service/MprData.js';

const emit = defineEmits(['search', 'reset']);

// 데이터 및 옵션
// const mprdata = ref(MprData);

// 검색 조건 초기값
const search = ref({
  mat_code: '',
  mat_name: '',
  req_date_from: null,
  req_date_to: null,
  client_name: '',
  req_name: '',
  line: ''
});

// 초기화
const resetSearch = () => {
  search.value = {
    mat_code: '',
    mat_name: '',
    req_date_from: null,
    req_date_to: null,
    client_name: '',
    req_name: '',
    line: ''
  };
  mprdata.value = [...MprData];
  emit('reset');
};


</script>

<template>
  <!-- 🔍 검색바 영역 -->
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      <!-- 자재코드 -->
      <SearchText v-model="search.mat_code" label="자재코드" placeholder="자재코드를 입력하세요" />

      <!-- 자재명 -->
      <SearchText v-model="search.mat_name" label="자재명" placeholder="자재명을 입력하세요" />

      <!-- 요청일자 -->
      <SearchDateBetween
        label="요청일자"
        :from="search.req_date_from"
        :to="search.req_date_to"
        @update:from="search.req_date_from = $event"
        @update:to="search.req_date_to = $event"
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