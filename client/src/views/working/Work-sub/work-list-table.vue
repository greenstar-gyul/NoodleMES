<script setup>
import { defineProps, defineEmits } from 'vue';
import TableWithDelExcelFixClick from '../../../components/form/TableWithDelExcelFixClick.vue';

const props = defineProps({
  data: Array,
  mapper: Object
});

const emit = defineEmits(['row-click']);

const handleRowClick = (row) => {
  emit('row-click', row);
};


</script>

<template>
  <TableWithDelExcelFixClick
    :data="props.data"
    :mapper="props.mapper"
    :dataKey="'wko_code'"
    title="작업진행목록"
    class="mt-5"
    @row-click="handleRowClick"
  />
</template>
