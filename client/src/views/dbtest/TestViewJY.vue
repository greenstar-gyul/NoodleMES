<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import TableWithExcel from '../../components/form/TableWithExcel.vue';

const testData = ref([]);

// Mounted
onMounted(async () => {
  // axios로 서버에 요청
  let result = await axios.get('/api/order/orders/clients');
  console.log(result.data);
  testData.value = result.data;
})

</script>
<template>
<TableWithExcel :data="testData" :mapper="{ client_code: '거래처코드', client_name: '거래처명', client_mname: '거래처담당자' }" :data-key="'client_code'" :title="'거래처'"></TableWithExcel>
</template>