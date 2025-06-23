<script setup>
// import axios from 'axios';
import { onMounted, defineProps, defineEmits } from 'vue';
import mprMapping from '@/service/MprMapping.js';
import TableWithExcel from '@/components/form/TableWithExcel.vue';

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
  <TableWithExcel :data="mprdata" :dataKey="'mpr_code'" :mapper="mprMapping.MprMapper" title="자재구매 요청목록" />
</template>