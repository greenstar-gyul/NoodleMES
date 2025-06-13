<!--
25.06.09 ~ 13
made by KMS
자재구매요청목록
-->

<script setup>
import axios from 'axios';
import MprListSearch from './mpr-list-sub/MprListSearch.vue';
import MprListTable from './mpr-list-sub/MprListTable.vue';
import { onMounted, ref } from 'vue';
import MprMapper from '@/service/MprMapping.js';

// 데이터 및 옵션
const mprdata = ref([]); // 화면에 표시할 원본 데이터
const originalData = ref([]);   // 초기값으로 사용할 원본 데이터 (mprdata와 굳이 나눌 필요가 없나?) 
const searchRef = ref(null); // 초기화 기능에 사용

// 일단 초기 데이터 표시를 위한 코드
const initData = async () => {
  try{
    let result = await axios.get('/api/mpr/all');
    originalData.value = await result.data;
    mprdata.value = result.data; 
  } catch (err) {
    console.log(result.data);
    console.error(err);
  } 
}

// 검색(조회 이벤트)
const handleSearch = async (search) => {
  try {
    console.log(search);
    let result = await axios.get(`/api/mpr/search`, {
      params:search
    });
    // console.log(result.data);
    mprdata.value = await result.data;
  } catch (err) {
    console.error(err);
  }
  // axios로 서버에 요청
  // 임시로 전체 데이터 조회
};


// 검색 조건을 초기화 (다시 봐야함)
const resetSearch = () => {
  mprdata.value = [...originalData.value];
};

onMounted(() => {
  initData();
})

</script>

<template>
  <MprListSearch @searchOption="handleSearch" @resetSearch="resetSearch"  ref="searchRef" />
  <MprListTable :mprdata="mprdata" :mapper="MprMapper" @initData="initData" />
 
  <!-- 조건 미일치 메시지 -->
  <div v-if="mprdata.length === 0" class="text-center text-gray-500 mt-4">
    조건에 맞는 데이터가 없습니다.
  </div>
</template>

