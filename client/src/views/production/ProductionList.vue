<script setup>
import { ref } from 'vue';
import ProductionSearchBar from './production-list-sub/Production-searchBar.vue';
import ProductionTable from './production-list-sub/Production-Table.vue';
import ProductMapper from '@/service/ProductionMapping';
import ProductionData from '@/service/ProductionData';

const productiondata = ref([...ProductionData]); // 검색 결과
const originalData = ref([...ProductionData]);   // 전체 원본 데이터

// 검색 처리 함수
const handleSearch = (search) => {
  productiondata.value = originalData.value.filter(item => {
    // 생산계획 코드 검색: 값이 없으면 true, 값이 있으면 포함 여부 확인
    const matchCode = !search.prdp_code || item.prdp_code.includes(search.prdp_code);
    // 계획명 검색: 위와 동일한 방식
    const matchName = !search.prdp_name || item.prdp_name.includes(search.prdp_name);

    // 계획일자 비교
    const prdpDate = new Date(item.prdp_date.replace(/\./g, '-'));
    const dueDate = new Date(item.due_date.replace(/\./g, '-'));

    // 계획일자 조건 필터
    const matchPrdpDate =
      (!search.prdp_date_from && !search.prdp_date_to) ||
      ((!search.prdp_date_from || prdpDate >= new Date(search.prdp_date_from)) &&
       (!search.prdp_date_to || prdpDate <= new Date(search.prdp_date_to)));
    // 납기일자 조건 필터
    const matchDueDate =
      (!search.due_date_from && !search.due_date_to) ||
      ((!search.due_date_from || dueDate >= new Date(search.due_date_from)) &&
       (!search.due_date_to || dueDate <= new Date(search.due_date_to)));
    // 모든 조건이 일치하는 경우만 필터링 결과에 포함
    return matchCode && matchName && matchPrdpDate && matchDueDate;
  });
};

// 초기화 함수
const resetSearch = () => {
  productiondata.value = [...originalData.value];
};
</script>

<template>
  <ProductionSearchBar @search="handleSearch" @reset="resetSearch" />
  <ProductionTable :data="productiondata" :dataKey="'prdp_code'" :mapper="ProductMapper" title="검색결과" />
  <div v-if="productiondata.length === 0" class="text-center text-gray-500 mt-4">
    조건에 맞는 데이터가 없습니다.
  </div>
</template>