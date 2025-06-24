<!--
자재입고관리
-->

<script setup>
import axios from 'axios';
import MinManageMain from './min-manage-sub/MinManageMain.vue';
import { onMounted, ref } from 'vue';
import MinMapper from '@/service/MinMapping.js';


// 데이터 및 옵션
const mInBndCode = ref({}); // 자재입고코드
const matName = ref({}); // 자재코드
const matType = ref({}); // 자재유형코드
const ordQtt = ref({}); // 주문수량
const inbndQtt = ref({}); // 입고수량
const unit = ref({}); // 단위코드
const inbndDate = ref({}); // 입고일자
const supName = ref({}); // 공급업체명
const mName = ref({ value: "김영업"}); // 담당자 이름 (화면 출력용)
const qioCode = ref({}); // 검사지시코드
const lotNum = ref({}); // LOT 번호
</script>

<template>
  <MinManageMain 
    :mInBndCode="mInBndCode"
    :matName="matName"
    :matType="matType"
    :ordQtt="ordQtt"
    :inbndQtt="inbndQtt"
    :unit="unit"
    :inbndDate="inbndDate"
    :supName="supName"
    :mName="mName"
    :qioCode="qioCode"
    :lotNum="lotNum"
  />
</template>

