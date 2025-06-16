<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import moment from 'moment'; // ✅ moment 추가
import ProductionSearchBar from './production-list-sub/Production-searchBar.vue';
import ProductionTable from './production-list-sub/Production-Table.vue';
import ProductMapper from '@/service/ProductionMapping';

const tableData = ref([]);

// 날자 변환 함수 
const formatDateFields = (data) => {
  return data.map(item => ({
    ...item,
    prdp_date: item.prdp_date ? moment(item.prdp_date).format('YYYY-MM-DD') : '',
    start_date: item.start_date ? moment(item.start_date).format('YYYY-MM-DD') : '',
    end_date: item.end_date ? moment(item.end_date).format('YYYY-MM-DD') : '',
    due_date: item.due_date ? moment(item.due_date).format('YYYY-MM-DD') : '',
  }));
};

// ✅ 초기 리스트 조회
const loadTableData = async () => {
  try {
    const res = await axios.get('/api/prdp/selectMonth');
    console.log('📦 받은 데이터:', res.data);

    if (!Array.isArray(res.data)) {
      console.error('❌ 배열 아님:', res.data);
      return;
    }

    tableData.value = formatDateFields(res.data);  // 여기에 출력됨
  } catch (err) {
    console.error('❌ 리스트 조회 실패:', err);
  }
};

// ✅ 검색 기능
const handleSearch = async (searchParams) => {
  const cleanParams = Object.fromEntries(
    Object.entries(searchParams).map(([key, val]) => [key, val === '' ? null : val])
  );

  console.log('👉 정제된 검색 파라미터:', cleanParams);

  try {
    const response = await axios.get('/api/prdp/search', {
      params: cleanParams,
    });

    if (response.data && response.data.success) {
      tableData.value = formatDateFields(response.data.data || []);
    } else if (Array.isArray(response.data)) {
      tableData.value = formatDateFields(response.data);
    } else {
      console.error('검색 실패:', response.data);
      tableData.value = [];
    }
  } catch (error) {
    console.error('검색 API 호출 실패:', error);
    tableData.value = [];
  }
};

// ✅ 검색 초기화
const resetSearch = async () => {
  await loadTableData();
};

onMounted(() => {
  loadTableData();
});
</script>

<template>
  <ProductionSearchBar @search="handleSearch" @reset="resetSearch" />
  <ProductionTable :data="tableData" :mapper="ProductMapper" />
  <div v-if="tableData.length === 0" class="text-center text-gray-500 mt-4">
    조건에 맞는 데이터가 없습니다.
  </div>
</template>
