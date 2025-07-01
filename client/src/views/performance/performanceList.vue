<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import moment from 'moment';
import performanceListSearchbar from './performanceList-sub/performanceList-searchbar.vue';
import performanceListTable from './performanceList-sub/performanceList-table.vue';
import PrdrMapper from '@/service/PrdrMapping';
const tableData = ref([]);
const start = moment().startOf('month').format('YYYY-MM-DD 00:00:00');
const end = moment().endOf('month').format('YYYY-MM-DD 23:59:59');

// 초기 리스트 조회
const loadTableData = async () => {
  try {
    const res = await axios.get('/api/prdr/month', {
      params: {
        start,
        end
      }
    });
    tableData.value = formatDateFields(res.data);
  } catch (err) {
    alert('오류가 발생했습니다. 다시 시도해주세요.');
  }
};
// 날자 변환 함수 
const formatDateFields = (list) => {
  return list.map(item => ({
    ...item,
    start_date: item.start_date ? moment(item.start_date).format('YYYY-MM-DD HH:mm') : '',
    end_date: item.end_date ? moment(item.end_date).format('YYYY-MM-DD HH:mm') : ''
  }));
};
onMounted(() => {
  loadTableData();
});
// 검색 초기화
const resetSearch = async () => {
    await loadTableData();
};
// 검색 기능
const handleSearch = async (searchParams) => {
  const cleanParams = Object.fromEntries(
    Object.entries(searchParams).map(([key, val]) => [key, val === '' ? null : val])
  );
  try {
    const response = await axios.post('/api/prdr/search', cleanParams);
    if (Array.isArray(response.data)) {
      tableData.value = formatDateFields(response.data);
    } else {
      tableData.value = [];
    }
  } catch (error) {
    alert('오류가 발생했습니다. 다시 시도해주세요.');
    tableData.value = [];
  }
};
</script>

<template>
    <performanceListSearchbar @search="handleSearch" @reset="resetSearch"/>

    <performanceListTable :data="tableData" :mapper="PrdrMapper" @row-click="handleRowClick"/>
    <div v-if="tableData.length === 0" class="text-center text-gray-500 mt-4">
    조건에 맞는 데이터가 없습니다.
    </div>
</template>