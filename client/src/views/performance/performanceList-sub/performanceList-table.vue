<script setup>
import { defineProps, defineEmits } from 'vue';
import TableWithDelExcelFix from '../../../components/form/TableWithDelExcelFix.vue';

const props = defineProps({
  data: Array,
  mapper: Object // 있으면 받아줍니다
});

const emit = defineEmits(['row-click']);

const handleRowClick = (row) => {
  emit('row-click', row);
};
</script>

<template>
  <TableWithDelExcelFix
    :data="props.data"
    :mapper="props.mapper"
    :dataKey="'prdr_code'"
    title="검색결과"
    class="mt-5"
    @row-click="handleRowClick"
  />
</template>
