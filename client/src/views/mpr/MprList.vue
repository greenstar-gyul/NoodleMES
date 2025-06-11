<!--
25.06.09 ~ 10
made by KMS
자재구매요청목록
-->

<script setup>
import MprListSearch from './mpr-list-sub/MprListSearch.vue';
import MprListTable from './mpr-list-sub/MprListTable.vue';
import { ref } from 'vue';
import MprData from '@/service/MprData.js';


// 데이터 및 옵션
const mprdata = ref([...MprData]); // 검색 결과
const originalData = ref([...MprData]);   // 전체 원본 데이터


// 초기화
const resetSearch = () => {
  mprdata.value = [...originalData.value];
};
const handleSearch = (search) => {
  materialdata.value = MaterialData.filter(item => {
    const matchMatCode = !search.value.mat_code || item.mat_code.includes(search.value.mat_code);
    const matchMatName = !search.value.mat_name || item.mat_name.includes(search.value.mat_name);
    const matchClientName = !search.value.client_name || item.client_name.includes(search.value.client_name);
    const matchReqName = !search.value.req_name || item.req_name.includes(search.value.req_name);

    const matchDate = new Date(item.req_date);

    const matchReqDate =
      (!search.value.req_date_from && !search.value.req_date_to) ||
      ((!search.value.req_date_from || matDate >= search.value.req_date_from) &&
        (!search.value.req_date_to || matDate <= search.value.req_date_to));

    return matchMatCode && matchMatName && matchDate && matchReqDate && matchClientName && matchReqName;
  });
};

</script>

<template>
  <MprListSearch @search="handleSearch" @reset="resetSearch"/>
  <MprListTable/>
 
  <!-- 조건 미일치 메시지 -->
  <div v-if="mprdata.length === 0" class="text-center text-gray-500 mt-4">
    조건에 맞는 데이터가 없습니다.
  </div>
</template>

