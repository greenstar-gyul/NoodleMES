<!--
25.06.08 ~ 12
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
const mpr_code = ref({}); // 자재구매요청코드
const reqdate = ref({});   // 요청일자
const deadline = ref({});   // 납기일자
const mrp_code = ref({});   // MRP 계획번호
const mcode = ref({});   // 요청자

</script>

<template>
  <MprManageMain 
    :mpr_code="mpr_code"
    :reqdate="reqdate"
    :deadline="deadline"
    :mrp_code="mrp_code"
    :mcode="mcode"
  />
  <MprManageDetail/>
</template>

