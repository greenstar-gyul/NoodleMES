<script setup>
import { ref,onMounted } from 'vue';
import axios from 'axios';
import ProductionSearchBar from './production-list-sub/Production-searchBar.vue';
import ProductionTable from './production-list-sub/Production-Table.vue';
import ProductMapper from '@/service/ProductionMapping';


// 데이터 연동
const tableData = ref([])


const loadTableData = async () => {
  try {
    const res = await axios.get('/api/prdp/selectMonth')
    tableData.value = res.data
    console.log('✅ 조회된 리스트:', tableData.value)
  } catch (err) {
    console.error('❌ 리스트 조회 실패:', err)
  }
}

const handleSearch = async (searchParams) => {
  // 🔽 빈 문자열을 null로 변환
  const cleanParams = Object.fromEntries(
    Object.entries(searchParams).map(([key, val]) => [key, val === '' ? null : val])
  );

  console.log('👉 정제된 검색 파라미터:', cleanParams);

  try {
    const response = await axios.get('/api/prdp/search', {
      params: cleanParams,
    });

    if (response.data && response.data.success) {
      tableData.value = response.data.data || [];
    } else if (Array.isArray(response.data)) {
      tableData.value = response.data;
    } else {
      console.error('검색 실패:', response.data);
      tableData.value = [];
    }
  } catch (error) {
    console.error('검색 API 호출 실패:', error);
    tableData.value = [];
  }
};

const resetSearch = async () => {
  await loadTableData(); // 초기 리스트 재조회
};

// Mounted
onMounted(() => {
  loadTableData()
})
</script>

<template>
  <ProductionSearchBar  @search="handleSearch" @reset="resetSearch" />
  <ProductionTable :data="tableData" :mapper="ProductMapper"/>
  <div v-if="tableData.length === 0" class="text-center text-gray-500 mt-4">
    조건에 맞는 데이터가 없습니다.
  </div>
</template>