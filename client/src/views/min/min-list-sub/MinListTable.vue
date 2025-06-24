<script setup>
// import axios from 'axios';
import { onMounted, defineProps, defineEmits } from 'vue';
import { useMinStore } from '@/stores/minStore.js';
import { storeToRefs } from 'pinia';
import minMapping from '@/service/MinMapping.js';
import TableWithExcel from '@/components/form/TableWithExcel.vue';

const minStore = useMinStore();

// 상위 props로부터 데이터 전달받기
const { mins } = storeToRefs(minStore);
const { fetchMinsByDate, setDefaultDateRange } = minStore;

onMounted(async () => {
  fetchMinsByDate();
})

</script>

<template>
   <!-- 결과 테이블 -->
  <TableWithExcel :data="mins" :dataKey="'min_code'" :mapper="minMapping.minbndMapping" title="검색결과" />
</template>