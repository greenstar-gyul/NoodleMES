<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import moment from 'moment'; // ✅ moment 추가
import MRPSearchBar from './mrp-list-sub/MRPSearchBar.vue';
import MRPTable from './mrp-list-sub/MRPTable.vue';
import MRPMapping from '../../service/MRPMapping';

const tableData = ref([]);

const formatDateFields = (data) => {
  return data.map(item => ({
    ...item,
    plan_date: item.plan_date ? moment(item.plan_date).format('YYYY-MM-DD') : '',
  }));
};

// ✅ 초기 리스트 조회
const loadTableData = async () => {
  try {
    const res = await axios.get('/api/mrp/searchMonth');
    tableData.value = await formatDateFields(res.data.data);
  } catch (err) {
    alert('리스트 조회 실패:', err);
  }
};

// ✅ 검색 기능
const handleSearch = async (searchParams) => {
  const cleanParams = Object.fromEntries(
    Object.entries(searchParams).map(([key, val]) => [key, val === '' ? null : val])
  );

  try {
    const response = await axios.get('/api/mrp/search', {
      params: cleanParams,
    });

    if (response.data && response.data.result_code === "SUCCESS") {
      tableData.value = formatDateFields(response.data.data || []);
    } else if (Array.isArray(response.data.data)) {
      tableData.value = formatDateFields(response.data.data);
    } else {
      tableData.value = [];
    }
  } catch (error) {
    alert('검색 API 호출 실패:', error);
    tableData.value = [];
  }
};

// 검색 초기화
const resetSearch = async () => {
  await loadTableData();
};

onMounted(() => {
  loadTableData();
});
</script>

<template>
  <MRPSearchBar @search="handleSearch" @reset="resetSearch" />
  <MRPTable :data="tableData" :mapper="MRPMapping.mrpListMapping" />
</template>
