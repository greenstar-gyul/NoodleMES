<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import moment from 'moment';
import workListSearchBar from './Work-sub/work-list-searchBar.vue';
import workListTable from './Work-sub/work-list-table.vue';
import workMapping from '@/service/WorkMapping.js';

console.log('🚀 컴포넌트 마운트됨');

const tableData = ref([]);

const router = useRouter();

const start = moment().startOf('month').format('YYYY-MM-DD 00:00:00');
const end = moment().endOf('month').format('YYYY-MM-DD 23:59:59');

// 초기 리스트 조회
const loadTableData = async () => {
  console.log('📡 loadTableData 시작'); // ✅ 확인 로그 1

  try {
    const res = await axios.get('/api/work/month', {
      params: {
        start,
        end
      }
    });
    console.log('📦 원본 응답 데이터:', res.data); // ✅ 확인 로그 2
    tableData.value = formatDateFields(res.data);
  } catch (err) {
    console.error('❌ axios 요청 실패:', err); // ✅ 반드시 찍히는 로그
  }
};

// 날짜 포맷 가공 함수
const formatDateFields = (list) => {
  return list.map(item => ({
    ...item,
    reg_date: item.reg_date ? moment(item.reg_date).format('YYYY-MM-DD') : '',
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

// ✅ 검색 기능
const handleSearch = async (searchParams) => {
  const cleanParams = Object.fromEntries(
    Object.entries(searchParams).map(([key, val]) => [key, val === '' ? null : val])
  );

  // 날짜 가공
  if (cleanParams.reg_date_from) cleanParams.reg_date_from += ' 00:00:00';
  if (cleanParams.reg_date_to) cleanParams.reg_date_to += ' 23:59:59';

  console.log('👉 정제된 검색 파라미터:', cleanParams);

  try {
    const response = await axios.post('/api/work/search', cleanParams);

    if (Array.isArray(response.data)) {
      tableData.value = formatDateFields(response.data);
    } else {
      console.error('📛 예상치 못한 응답:', response.data);
      tableData.value = [];
    }
  } catch (error) {
    console.error('❌ 검색 API 호출 실패:', error);
    tableData.value = [];
  }
};

const handleRowClick = (row) => {
  router.push(`/work/${row.wko_code}`);
};

</script>

<template>
    <workListSearchBar @search="handleSearch" @reset="resetSearch"/>

    <workListTable :data="tableData" :mapper="workMapping" @row-click="handleRowClick"/>
    <div v-if="tableData.length === 0" class="text-center text-gray-500 mt-4">
    조건에 맞는 데이터가 없습니다.
    </div>
</template>