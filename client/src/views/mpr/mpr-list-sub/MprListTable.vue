<script setup>
// import axios from 'axios';
import { defineProps } from 'vue';
import MprMapper from '@/service/MprMapping.js';
import TableWithExcel from '../../../components/form/TableWithExcel.vue';

// 데이터 및 옵션
defineProps({
  mprdata: Array
});

</script>

<template>
   <!-- 결과 테이블 -->
  <TableWithExcel :data="mprdata" :dataKey="'req_code'" :mapper="MprMapper" title="검색결과" />
</template>