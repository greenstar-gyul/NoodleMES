<script setup>
import { ref } from 'vue';
import TableList from '@/components/form/TableWithExcel.vue';
import ProductMapper from '@/service/ProductionMapping.js';
import ProductionData from '@/service/ProductionData.js';

// 데이터 및 옵션
const productiondata = ref(ProductionData);

</script>

<template>
  <TableList :data="productiondata" :dataKey="'prdp_code'" :mapper="ProductMapper" title="검색결과" />
</template>