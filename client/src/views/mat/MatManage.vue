<!--
자재입고관리
-->

<script setup>
import axios from 'axios';
import MatManageMain from './mat-manage-sub/MatManageMain.vue';
import MatManageDetail from './mat-manage-sub/MatManageDetail.vue';
import { onMounted, ref } from 'vue';
import MatMapper from '@/service/MatMapping.js';


// 데이터 및 옵션
const mInBndCode = ref({}); // 자재입고코드
const matCode = ref({}); // 자재코드
const inbndQtt = ref({}); // 입고수량
const inbndDate = ref({}); // 입고일자
const ordQtt = ref({}); // 주문 수량
const qioCode = ref({}); // 검사지시코드
const lotNum = ref({}); // LOT 번호
const matSup = ref({}); // 공급 업체
const mCode = ref({ value: "EMP-10001" });   // 담당자 (로그인 정보로 받아와야함, 현재 임시 사용)

</script>

<template>
  <MatManageMain 
    :mInBndCode="mInBndCode"
    :matCode="matCode"
    :inbndQtt="inbndQtt"
    :inbndDate="inbndDate"
    :ordQtt="ordQtt"
    :qioCode="qioCode"
    :lotNum="lotNum"
    :matSup="matSup"
    :mCode="mCode"
  />
  <MatManageDetail/>
</template>

