<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import TableList from '@/components/form/TableWithExcel.vue';
import MprMapper from '@/service/MprMapping.js';

// 데이터 및 옵션
const mprdata = ref([]);

// Mounted
onMounted(async () => {
  // axios로 서버에 요청
  // 지금은 전체 조회로 했는데 조건문으로 데이터가 없는 경우 처리도 해야할 듯?

  let result = await axios.get('/api/mpr/all');
  console.log(result.data);
  mprdata.value = result.data;
})

</script>

<template>
   <!-- 결과 테이블 -->
  <TableList :data="mprdata" :dataKey="'req_code'" :mapper="MprMapper" title="검색결과" />
</template>