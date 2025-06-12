<!--
25.06.09 ~ 10
made by KMS
자재구매요청목록
-->

<script setup>
import axios from 'axios';
import MprListSearch from './mpr-list-sub/MprListSearch.vue';
import MprListTable from './mpr-list-sub/MprListTable.vue';
import { onMounted, ref } from 'vue';
import MprMapper from '@/service/MRPMapping.js';

// 데이터 및 옵션
const mprdata = ref([]); // 검색 결과
const originalData = ref([]);   // 전체 원본 데이터



const initData = async () => {
  try{
    const res = await axios.get('/api/mpr/all');
    originalData.value = await res.data; 
  } catch (err) {
    console.error('리스트 조회 실패', err)
  } 
}

// 검색(조회 이벤트)
const handleSearch = async (search) => {
  // axios로 서버에 요청
  // 임시로 전체 데이터 조회
  console.log(search);
  let result = await axios.get(`/api/mpr/search`, {
    params:search
  });
  console.log(result.data);
  mprdata.value = await result.data;
};

// 초기화
const resetSearch = () => {
  mprdata.value = [...originalData.value];
};

onMounted(() => {
  initData();
})

</script>

<template>
  <MprListSearch @searchOption="handleSearch" @resetSearch="resetSearch"/>
  <MprListTable :data="mprdata" :mapper="MprMapper"/>
 
  <!-- 조건 미일치 메시지 -->
  <div v-if="mprdata.length === 0" class="text-center text-gray-500 mt-4">
    조건에 맞는 데이터가 없습니다.
  </div>
</template>

