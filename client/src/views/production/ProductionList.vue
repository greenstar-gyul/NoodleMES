<template>
  <!-- 🔍 검색바 영역 -->
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      <!-- 생산계획코드 -->
      <SearchText v-model="search.prdp_code" label="생산계획코드" placeholder="생산계획코드를 입력하세요" />

      <!-- 계획명 -->
      <SearchText v-model="search.prdp_name" label="계획명" placeholder="계획명을 입력하세요" />

      <!-- 계획일자 -->
      <SearchDateBetween
        label="계획일자"
        :from="search.prdp_date_from"
        :to="search.prdp_date_to"
        @update:from="search.prdp_date_from = $event"
        @update:to="search.prdp_date_to = $event"
      />

      <SearchDateBetween
        label="납기일자"
        :from="search.due_date_from"
        :to="search.due_date_to"
        @update:from="search.due_date_from = $event"
        @update:to="search.due_date_to = $event"
      />

    </div>

    <!-- 조회/초기화 버튼 -->
    <div class="flex justify-center gap-3 mt-4">
      <Button label="초기화" severity="contrast" @click="resetSearch" />
      <Button label="조회" severity="info" @click="fetchOrders" />
    </div>
  </div>

  <!-- 📋 결과 테이블 -->
  <TableList :data="productiondata" :dataKey="'prdp_code'" :mapper="ProductMapper" title="검색결과" />

  <!-- 조건 미일치 메시지 -->
  <div v-if="productiondata.length === 0" class="text-center text-gray-500 mt-4">
    조건에 맞는 데이터가 없습니다.
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import TableList from '@/components/form/TableWithExcel.vue';
import SearchText from '@/components/search-bar/SearchText.vue';
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue';

import ProductMapper from '@/service/ProductionMapping.js';

import ProductionData from '@/service/ProductionData.js';

// 데이터 및 옵션
const productiondata = ref(ProductionData);

// 검색 조건 초기값
const search = ref({
  prdp_code: '',
  prdp_name: '',
  prdp_date_from: null,
  prdp_date_to: null,
  line: ''
});

// 초기화
const resetSearch = () => {
  search.value = {
    prdp_code: '',
    prdp_name: '',
    prdp_date_from: null,
    prdp_date_to: null,
    line: ''
  };
  productiondata.value = [...ProductionData];
};

// 조회 필터링
const fetchOrders = () => {
  productiondata.value = ProductionData.filter(item => {
    const matchCode = !search.value.prdp_code || item.prdp_code.includes(search.value.prdp_code);
    const matchName = !search.value.prdp_name || item.prdp_name.includes(search.value.prdp_name);
    const matchDate =
      (!search.value.prdp_date_from && !search.value.prdp_date_to) ||
      ((!search.value.prdp_date_from || item.prdp_date >= search.value.prdp_date_from) &&
        (!search.value.prdp_date_to || item.prdp_date <= search.value.prdp_date_to));
    const matchDueDate =
  (!search.value.due_date_from && !search.value.due_date_to) ||
  ((!search.value.due_date_from || item.due_date >= search.value.due_date_from) &&
    (!search.value.due_date_to || item.due_date <= search.value.due_date_to));
    return matchCode && matchName && matchDate && matchDueDate;
  });
};

</script>
