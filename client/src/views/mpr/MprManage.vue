<!--
25.06.08 ~ 17
made by KMS
자재구매요청관리
-->

<script setup>
import axios from 'axios';
import MprManageMain from './mpr-manage-sub/MprManageMain.vue';
import MprManageDetail from './mpr-manage-sub/MprManageDetail.vue';
import { onMounted, ref } from 'vue';
import MprMapper from '@/service/MprMapping.js';

// 데이터 및 옵션
const mprCode = ref({}); // 자재구매요청코드
const reqDate = ref({});   // 요청일자
const deadLine = ref({});   // 납기일자
const mrpCode = ref({});   // MRP 계획번호
const mCode = ref({ value: "EMP-10001" });   // 요청자 (로그인 정보로 받아와야함, 현재 임시 사용)
</script>

<template>
  <MprManageMain 
    :mprCode="mprCode"
    :reqDate="reqDate"
    :deadLine="deadLine"
    :mrpCode="mrpCode"
    :mCode="mCode"
  />
  <MprManageDetail/>
</template>

