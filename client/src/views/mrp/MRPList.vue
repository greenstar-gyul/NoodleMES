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
    tableData.value = formatDateFields(res.data);
    console.log('✅ 조회된 리스트:', tableData.value);
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
    const response = await axios.get('/api/mrp/search', {
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
  <MRPSearchBar @search="handleSearch" @reset="resetSearch" />
  <MRPTable :data="tableData" :mapper="MRPMapping.mrpListMapping" />
  <div v-if="tableData.length === 0" class="text-center text-gray-500 mt-4">
    조건에 맞는 데이터가 없습니다.
  </div>
</template>
