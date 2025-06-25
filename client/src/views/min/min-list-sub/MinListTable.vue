<script setup>
// import axios from 'axios';
import { onMounted, defineProps, defineEmits } from 'vue';
import { useMinStore } from '@/stores/minStore.js';
import { storeToRefs } from 'pinia';
import minMapping from '@/service/MinMapping.js';
import TableWithExcel from '@/components/form/TableWithExcel.vue';

const minStore = useMinStore();

const { mins } = storeToRefs(minStore);
const { fetchMinsSearch, fetchAllMins } = minStore;

onMounted(async () => {
  fetchAllMins();
})

</script>

<template>
   <!-- 결과 테이블 -->
  <TableWithExcel :data="mins" :dataKey="'minbnd_code'" :mapper="minMapping.minbndMapping" title="자재입고내역" />
</template>