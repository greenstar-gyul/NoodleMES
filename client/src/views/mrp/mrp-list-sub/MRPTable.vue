<script setup>
import { ref,defineProps } from 'vue';
import TableWithExcel from '@/components/form/TableWithExcel.vue';

defineProps({
  data: Array
})
</script>

<template>
  <TableWithExcel :data="data" :dataKey="'prdp_code'" title="검색결과" />
</template>