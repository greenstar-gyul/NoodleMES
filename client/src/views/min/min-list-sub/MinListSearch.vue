<script setup>
// import axios from 'axios';
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useMinStore } from '@/stores/minStore.js';
import axios from 'axios';
import moment from 'moment';
import Button from 'primevue/button';
import SearchText from '@/components/search-bar/SearchText.vue';
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue';

// pinia
const minStore = useMinStore();

// 상태
const { mins, selectedMin, } = storeToRefs(minStore);

const { fetchMinsSearch, resetSearch, fetchAllMins } = minStore;

// 컴포넌트 초기화
onMounted(() => {
  fetchAllMins();
});

// 검색 초기화 함수
const onReset = () => {
  resetSearch();
  // fetchMinsSearch(); // 초기화 후 기본 날짜로 조회
};

// 검색 실행 함수
const onSearch = () => {
    fetchMinsSearch();
    console.log(mins);
};

// 단위 코드 매핑 (단방향: 값 → 코드)
const unitCodeMap = {
  'kg': 'h1',
  'L': 'h3',
  'ea': 'h4',
};

// 자재유형 매핑 (양방향: 코드 → 분류명)
const matTypeMap = {
  '원자재': 't1',
  '원자재': 'i4',
  '부자재': 't2',
  '부자재': 'i3',
};

// 거래처 코드 매핑 (CLIENT-001 ~ CLIENT-011)
const clientMap = {
  '대형마트A': 'CLIENT-001',
  '대형마트B': 'CLIENT-002',
  '편의점체인A': 'CLIENT-003',
  '온라인쇼핑몰A': 'CLIENT-004',
  '밀가루공급사': 'CLIENT-005',
  '팜유공급사': 'CLIENT-006',
  '포장재공급사': 'CLIENT-007',
  '야채공급사': 'CLIENT-008',
  '조미료공급사': 'CLIENT-009',
  '컵용기공급사': 'CLIENT-010',
  '예담마트': 'CLIENT-011',
};

// 최초 로딩시 자재입고 정보 조회
onMounted(() => {
  try {
    fetchMinsSearch();
  } catch(err){
    throw err;
  }
});

</script>

<template>
  <!-- 검색바 영역 -->
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      <!-- 자재명 -->
      <SearchText v-model="selectedMin.matName" label="자재이름" />
      
      <!-- 자재유형 -->
      <SearchText v-model="selectedMin.matType" label="자재유형" />

      <!-- 입고일자 -->
      <SearchDateBetween
        label="입고일자"
        :from="selectedMin.inbndDateFrom"
        :to="selectedMin.inbndDateTo"
        @update:from="selectedMin.inbndDateFrom = $event"
        @update:to="selectedMin.inbndDateTo = $event"
      />

      <!-- 공급업체  -->
      <SearchText v-model="selectedMin.supName" label="공급업체" />

      <!-- 입고담당자  -->
      <SearchText v-model="selectedMin.mName" label=" 입고담당자" />
    </div>

    <!-- 조회/초기화 버튼 -->
    <div class="flex justify-center gap-3 mt-4">
      <Button label="초기화" severity="contrast" @click="onReset" />
      <Button label="조회" severity="info" @click="onSearch" />
    </div>
  </div>
</template>