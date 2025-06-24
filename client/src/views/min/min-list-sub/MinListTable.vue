<script setup>
// import axios from 'axios';
import { onMounted, defineProps, defineEmits } from 'vue';
import minMapping from '@/service/MinMapping.js';
import TableWithExcel from '@/components/form/TableWithExcel.vue';

// 상위 props로부터 데이터 전달받기
const mins = defineProps({
  mInBndCode: { type: Object, required: true }, // 자재입고코드
  matCode: { type: Object, required: true }, // 자재코드
  matType: { type: Object, required: true }, // 자재유형코드
  commMatType: { type: Object, required: true }, // 자재유형
  ordQtt: { type: Object, required: true }, // 주문수량
  inbndQtt: { type: Object, required: true }, // 입고수량
  unit: { type: Object, required: true }, // 단위코드
  commUnit: { type: Object, required: true }, // 단위
  inbndDateFrom: { type: Object, required: true }, // 입고일자(시작값)
  inbndDateTo: { type: Object, required: true }, // 입고일자(종료값)
  matSup: { type: Object, required: true }, // 공급업체
  supName: { type: Object, required: true }, // 공급업체명
  mCode: { type: Object, required: true }, // 담당자
  mName: { type: Object, required: true }, // 담당자명
  qioCode: { type: Object, required: true }, // 검사지시코드
  lotNum: { type: Object, required: true }, // LOT 번호
});


</script>

<template>
   <!-- 결과 테이블 -->
  <TableWithExcel :data="mins" :dataKey="'min_code'" :mapper="minMapping.minbndMapping" title="검색결과" />
</template>