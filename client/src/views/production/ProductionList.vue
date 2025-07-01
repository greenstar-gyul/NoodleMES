<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import moment from 'moment'; 
import ProductionSearchBar from './production-list-sub/Production-searchBar.vue';
import ProductionTable from './production-list-sub/Production-Table.vue';
import ProductMapper from '@/service/ProductionMapping';

const tableData = ref([]);

onMounted(() => {
  loadTableData();
});

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
    if (!Array.isArray(res.data)) {
      return;
    }
    tableData.value = formatDateFields(res.data);  // 여기에 출력됨
  } catch (err) {
    alert('오류가 발생했습니다. 다시 시도해주세요.');
  }
};


// 검색 기능
const handleSearch = async (searchParams) => {
  const cleanParams = Object.fromEntries(
    Object.entries(searchParams).map(([key, val]) => [key, val === '' ? null : val])
  );
  try {
    const response = await axios.get('/api/prdp/search', {
      params: cleanParams,
    });
    if (response.data && response.data.success) {
      tableData.value = formatDateFields(response.data.data || []);
    } else if (Array.isArray(response.data)) {
      tableData.value = formatDateFields(response.data);
    } else {
      tableData.value = [];
    }
  } catch (error) {
    alert('오류가 발생했습니다. 다시 시도해주세요.');
    tableData.value = [];
  }
};

// 검색 초기화
const resetSearch = async () => {
  await loadTableData();
};
</script>

<template>
  <ProductionSearchBar @search="handleSearch" @reset="resetSearch" />
  <ProductionTable :data="tableData" :mapper="ProductMapper" />
  <div v-if="tableData.length === 0" class="text-center text-gray-500 mt-4">
    조건에 맞는 데이터가 없습니다.
  </div>
</template>
