<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import TableWithExcel from '../../components/form/TableWithExcel.vue';

const testData = ref([]);
const testData2 = ref([]);

// Mounted
onMounted(async () => {
  // axios로 서버에 요청
  let result = await axios.get('/api/mrp/all');
  testData.value = result.data;
  // console.log(result.data);

  let result2 = await axios.get('/api/mrp/detail-all');
  testData2.value = result2.data;
})

</script>
<template>
<TableWithExcel :data="testData" :mapper="{ mrp_code: 'MRP코드' }" :data-key="'mrp_code'" :title="'MRP목록'"></TableWithExcel>
<TableWithExcel :data="testData2" :mapper="{ mrp_code: 'MRP코드' }" :data-key="'mrp_code'" :title="'MRP상세목록'"></TableWithExcel>
</template>