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
    const res = await axios.get('/api/prdp/selectMonth') // 실제 경로에 맞게 조정
    tableData.value = res.data
    console.log('✅ 조회된 리스트:', tableData.value)
  } catch (err) {
    console.error('❌ 리스트 조회 실패:', err)
  }
}

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
