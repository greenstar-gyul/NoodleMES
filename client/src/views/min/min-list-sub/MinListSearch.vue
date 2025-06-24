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
const { minRows, selectedMin } = storeToRefs(minStore);

// set: 목록데이터 저장,  reset: 초기화
const { setMinRows, resetMinRows,  } = minStore;

// moment사용으로 날짜 문자열로 변환
const formatDate = (date) => {
  return moment(date).format('YYYY-MM-DD'); // YYYY-MM-DD 형식으로 변환
};

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

// 초기화
const handleReset = () => {
    mins.mInBndCode.value = '';
    mins.matCode.value = '';
    mins.matType.value = '';
    mins.commMatType.value = '';
    mins.ordQtt.value = '';
    mins.inbndQtt.value = '';
    mins.unit.value = '';
    mins.commUnit.value = '';
    mins.inbndDateFrom.value = null;
    mins.inbndDateTo.value = null;
    mins.matSup.value = '';
    mins.supName.value = '';
    mins.mCode.value = '';
    mins.mName.value = '';
    mins.qioCode.value = '';
    mins.lotNum.value = '';
    resetMinRows();
};

// 자재입고정보 데이터
const minRef = ref([]);

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
onMounted(async () => {
  try {
    // 전체 자재입고정보 조회
    const MinRes = await axios.get('/api/min/all');
    console.log('자재입고정보')
    console.log(MinRes)
    minRef.value = MinRes.data.map(min => ({
      //기존  객체를 그대로 복사하면서 date 값만 YYYY-MM-DD 포맷으로 변환
      ...min,
      inbnd_date: formatDate(min.inbndDate),
    }))

  } catch(err){
    console.error('데이터 로딩 실패:', err);
  }
});


</script>

<template>
  <!-- 검색바 영역 -->
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      <!-- 자재코드 -->
      <SearchText v-model="mins.matCode.value" label="자재코드" />
      
      <!-- 자재유형코드 -->
      <SearchText v-model="mins.matType.value" label="자재유형코드" />

      <!-- 입고일자 -->
      <SearchDateBetween
        label="입고일자"
        :from="mins.inbndDateFrom"
        :to="mins.inbndDateTo"
        @update:from="mins.inbndDateFrom = $event"
        @update:to="mins.inbndDateTo = $event"
      />

      <!-- 입고수량 -->
      <SearchText v-model="mins.inbndQtt.value" label="입고수량" />

      <!-- LOT번호  -->
      <SearchText v-model="mins.lotNum.value" label="LOT 번호" />

      <!-- 공급업체  -->
      <SearchText v-model="mins.matSup.value" label="공급업체" />
    </div>

    <!-- 조회/초기화 버튼 -->
    <div class="flex justify-center gap-3 mt-4">
      <Button label="초기화" severity="contrast" @click="handleReset" />
      <Button label="조회" severity="info" @click="fetchSearch" />
    </div>
  </div>
</template>