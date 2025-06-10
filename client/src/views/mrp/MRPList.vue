<template>
  <!-- 🔍 검색바 영역 -->
  <MRPListSearch></MRPListSearch>

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
import MRPListSearch from './mrp-sub/MRPListSearch.vue';

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


const fetchOrders = () => {
  productiondata.value = ProductionData.filter(item => {
    const matchCode = !search.value.prdp_code || item.prdp_code.includes(search.value.prdp_code);
    const matchName = !search.value.prdp_name || item.prdp_name.includes(search.value.prdp_name);

    const prdpDate = new Date(item.prdp_date);
    const dueDate = new Date(item.due_date);

    const matchDate =
      (!search.value.prdp_date_from && !search.value.prdp_date_to) ||
      ((!search.value.prdp_date_from || prdpDate >= search.value.prdp_date_from) &&
        (!search.value.prdp_date_to || prdpDate <= search.value.prdp_date_to));

    const matchDueDate =
      (!search.value.due_date_from && !search.value.due_date_to) ||
      ((!search.value.due_date_from || dueDate >= search.value.due_date_from) &&
        (!search.value.due_date_to || dueDate <= search.value.due_date_to));

    return matchCode && matchName && matchDate && matchDueDate;
  });
};



</script>
