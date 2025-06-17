<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import TableWithExcel from '../../components/form/TableWithExcel.vue';

const testData = ref([]);

// Mounted
onMounted(async () => {
  // axios로 서버에 요청
  let result = await axios.get('/api/dept/all');
  console.log(result.data);
  testData.value = result.data;
})

</script>
<template>
<TableWithExcel :data="testData" :mapper="{ dept_code: '부서코드', dept_name: '부서명' }" :data-key="'dept_code'" :title="'부서목록'"></TableWithExcel>
</template>