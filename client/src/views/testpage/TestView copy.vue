<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import TableWithExcel from '../../components/form/TableWithExcel.vue';

const testData = ref([]);
const selectedRows = ref([]);

// Mounted
onMounted(async () => {
  // axios로 서버에 요청
  // let result = await axios.get('/api/prdp/all');
  // console.log(result.data);
  // testData.value = result.data;
   // axios로 서버에 요청
  // let result = await axios.get('/api/prdp/detail/all');
  // console.log(result.data);
  // testData.value = result.data;
  // let result = await axios.get('/api/prdp/Test');
  // console.log(result.data);
  // testData.value = result.data;
  let result = await axios.get('/api/prdp/line');
  console.log(result.data);
  testData.value = result.data;
})

</script>
<template>
<!-- <TableWithExcel :data="testData" :mapper="{ prdp_code: '생산계획코드', prdp_name: '계획명' }" :data-key="'prdp_code'" :title="'생산계획목록'"></TableWithExcel> -->
<TableWithExcel :data="testData" :mapper="{ line_code: '라인코드', line_name: '라인이름' }" :data-key="'line_code'" :title="'라인목록'"  v-model="selectedRows"></TableWithExcel>
</template>