<script setup>
// import axios from 'axios';
import { onMounted, defineProps, defineEmits } from 'vue';
import MprMapper from '@/service/MprMapping.js';
import TableWithExcel from '../../../components/form/TableWithExcel.vue';

// 상위에서 전달받은 데이터
defineProps({
  mprdata: Array,
  required: true,
});

const emit = defineEmits(['initData']);
onMounted(() => {
  emit('initData');
});

</script>

<template>
   <!-- 결과 테이블 -->
  <TableWithExcel :data="mprdata" :dataKey="'req_code'" :mapper="MprMapper" title="검색결과" />
</template>