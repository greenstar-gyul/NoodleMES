<script setup>
import TableWithExcel from '@/components/form/TableWithExcel.vue';
import releaseMapper from '@/service/ReleaseMapping.js';

import { onMounted } from 'vue';
import { useReleaseListStore } from '@/stores/releaseListStore';
import { storeToRefs } from 'pinia';

// 출고 스토어 연결
const relStore = useReleaseListStore();
const { releases } = storeToRefs(relStore);
const { fetchReleasesByDate, setDefaultDateRange } = relStore;

// 컴포넌트 마운트 시 출고 목록 조회
onMounted(() => {
  relStore.setDefaultDateRange();
  fetchReleasesByDate();
});
</script>

<template>
  <TableWithExcel
    title="검색결과"
    :data="releases"
    :dataKey="'out_req_d_code'" 
    :mapper="releaseMapper"
  />
</template>