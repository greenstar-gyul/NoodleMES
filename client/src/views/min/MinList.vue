<!--
자재입고조회
-->

<script setup>
import { ref } from 'vue';
import MinListSearch from './min-list-sub/MinListSearch.vue';
import MinListTable from './min-list-sub/MinListTable.vue';

// 데이터 및 옵션
const mInBndCode = ref({}); // 자재입고코드
const matCode = ref({}); // 자재코드
const matType = ref({}); // 자재유형코드
const commMatType = ref({}); // 자재유형
const ordQtt = ref({}); // 주문수량
const inbndQtt = ref({}); // 입고수량
const unit = ref({}); // 단위코드
const commUnit = ref({}); // 단위
const inbndDateFrom = ref({}); // 입고일자(시작값)
const inbndDateTo = ref({}); // 입고일자(종료값)
const matSup = ref({}); // 공급업체
const supName = ref({}); // 공급업체명
const mCode = ref({ value: "EMP-10001" });   // 담당자 (로그인 정보로 받아와야함, 현재 임시 사용)
const mName = ref({ value: "김영업"}); // 담당자 이름 (화면 출력용)
const qioCode = ref({}); // 검사지시코드
const lotNum = ref({}); // LOT 번호
</script>

<template>
  <MinListSearch 
    :mInBndCode="mInBndCode"
    :matCode="matCode"
    :matType="matType"
    :commMatType="commMatType"
    :ordQtt="ordQtt"
    :inbndQtt="inbndQtt"
    :unit="unit"
    :commUnit="commUnit"
    :inbndDateFrom="inbndDateFrom"
    :inbndDateTo="inbndDateTo"
    :matSup="matSup"
    :supName="supName"
    :mCode="mCode"
    :mName="mName"
    :qioCode="qioCode"
    :lotNum="lotNum"/> 
  <MinListTable />
</template>

