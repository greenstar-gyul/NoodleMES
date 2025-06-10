<template>
  <!-- 🔍 검색바 영역 -->
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <!-- 검색 조건 영역 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
      <!-- 설비명 -->
      <div class="flex items-center gap-3 w-full">
        <label class="font-semibold w-24">설비명</label>
        <InputText v-model="search.eq_name" class="flex-1" />
      </div>

      <!-- 점검지시서코드 -->
      <div class="flex items-center gap-3 w-full">
        <label class="font-semibold w-24">점검결과코드</label>
        <InputText v-model="search.eqir_code" class="flex-1" />
      </div>

      <!-- 지시일자 -->
      <div class="flex items-center gap-3 w-full">
        <label class="font-semibold w-24">점검일자</label>
        <Calendar type="text" class="w-full" />
      </div>

      <!-- 점검유형 -->
      <div class="flex items-center gap-3 w-full">
        <label class="font-semibold w-24">점검유형</label>
        <Dropdown v-model="search.chk_date" :options="orderchk_resultusOptions" optionLabel="label" optionValue="value"
          placeholder="" class="flex-1" />
      </div>

      <!-- 상태 -->
      <div class="flex items-center gap-3 w-full">
        <label class="font-semibold w-24">상태</label>
        <Dropdown v-model="search.chk_result" :options="orderchk_resultusOptions" optionLabel="label" optionValue="value"
          placeholder="" class="flex-1" />
      </div>
    </div>

    <!-- 조회/초기화 버튼 영역 -->
    <div class="flex justify-center gap-3 mt-4">
      <Button label="초기화" severity="contrast" @click="resetSearch" />
      <Button label="조회" severity="info" @click="fetchOrders" />
    </div>
  </div>

  <!-- 📋 검색 조회 테이블 영역 -->
  <div class="flex flex-col lg:flex-row gap-6 mt-6">
    <!-- 좌측: 검색결과 + 하위자재 구성 (50%) -->
    <div class="space-y-6" style="width: 100%">
      <!-- 검색결과 테이블 -->
      <EqIITable style="margin-bottom:0px; height:730px" :data="products" :dataKey="'eq_code'" :mapper="eqiiresMapper" />
    </div>
  </div>

  <!-- <MultiplePopup v-model:visible="dialogVisible" :items="submats" @confirm="handleConfirm" :mapper="bomSubMapper" :dataKey="'mat_code'"></MultiplePopup> -->
  <!-- <SinglePopup v-model:visible="dialogVisible" :items="clients" @confirm="handleConfirm" :mapper="clientMapper"
    :dataKey="'client_code'"></SinglePopup> -->
</template>

<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import EqIITable from './components/EqIITable.vue';
import eqiiresMapper from '@/service/EquipIIResMapping.js';
import SinglePopup from '@/components/popup/SinglePopup.vue';

// 검색조건 데이터 (v-model로 바인딩됨)
const search = ref({
  eqir_code: '',
  eq_name: '',
  inst_date: '',
  chk_date: '',
  mcode: '',
  chk_result: ''
});

// 팝업
const dialogVisible = ref(false);

// 주문상태 옵션 (예시 데이터)
const orderchk_resultusOptions = [
  { label: '활성', value: 'a1' },
  { label: '비활성', value: 'a2' }
];

// 조회 버튼 기능 (API 호출 자리)
const fetchOrders = () => {
  console.log('조회 실행:', search.value);
  // TODO: 실제 API 호출로 데이터 갱신
};

// 초기화 버튼 기능
const resetSearch = () => {
  search.value = {
    eqir_code: '',
    eq_name: '',
    eq_code: '',
    chk_date: '',
    mcode: '',
    chk_result: ''
  };
};

// 테이블에 보여줄 제품 데이터 (예시 데이터)
const products = ref([
  {
    eqir_code: 'EQIR0001',
    eq_name: '자동면발기A',
    eq_code: 'EQ001',
    chk_date: '2025-05-15',
    mcode: 'EMP0001',
    chk_result: '불합격'
  },
  {
    eqir_code: 'EQIR0002',
    eq_name: '자동면발기B',
    eq_code: 'EQ002',
    chk_date: '2025-05-15',
    mcode: 'EMP0001',
    chk_result: '합격'
  },
  {
    eqir_code: 'EQIR0003',
    eq_name: '자동면발기C',
    eq_code: 'EQ003',
    chk_date: '2025-05-15',
    mcode: 'EMP0001',
    chk_result: '합격'
  }
]);


</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>
