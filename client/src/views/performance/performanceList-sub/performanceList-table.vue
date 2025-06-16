<script setup>
import { ref,defineProps } from 'vue';
import TableWithDelExcelWidthfix from '@/components/form/TableWithDelExcelWidthfix.vue';

defineProps({
  data: Array
})
</script>

<template>
  <TableWithDelExcelWidthfix :data="data" :dataKey="'prdr_code'" title="검색결과" class="mt-5"/>
</template>