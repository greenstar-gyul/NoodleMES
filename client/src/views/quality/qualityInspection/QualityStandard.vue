<template>
  <!-- 검색 바 -->
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
      <div class="flex items-center gap-3 w-full">
        <label class="font-semibold w-24">품질기준코드</label>
        <InputText v-model="search.qcr_code" class="flex-1" />
      </div>
      <div class="flex items-center gap-3 w-full">
        <label class="font-semibold w-24">공정코드</label>
        <InputText v-model="search.po_code" class="flex-1" />
      </div>
      <div class="flex items-center gap-3 w-full">
        <label class="font-semibold w-24">검사항목</label>
        <InputText v-model="search.inspection_item" class="flex-1" />
      </div>
      <div class="flex items-center gap-3 w-full">
        <label class="font-semibold w-24">판정방식</label>
        <Dropdown v-model="search.check_method" :options="orderStatusOptions" optionLabel="label" optionValue="value" class="flex-1" />
      </div>
    </div>
    <div class="flex justify-center gap-3 mt-4">
      <Button label="초기화" severity="contrast" @click="resetSearch" />
      <Button label="조회" severity="info" @click="fetchOrders" />
    </div>
  </div>

  <!-- 테이블 + 등록 폼 -->
  <div class="flex flex-col lg:flex-row gap-6 mt-6">
    <div class="space-y-6" style="width: 55%">
      <WDETable
        style="margin-bottom:0px; height : 100%"
        ref="eqTableRef"
        :data="qualitys"
        :dataKey="'qcr_code'"
        :columns="tableColumns"
        :mapper="QualityMapping"
        title="기준 목록"
        @selection-change="onSelectionChange"
        @delete="handleDelete"
      />
    </div>
    <QualitySTDForm :selectedData="selectedEquipment" @data-updated="onDataUpdated" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';  // axios로 API 호출
import WDETable from './WDETable.vue';
import QualitySTDForm from './QualitySTDForm.vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import QualityMapping from '@/service/QualityMapping';

// 검색조건 데이터 (v-model)
const search = ref({
  qcr_code: '',
  po_code: '',
  inspection_item: null,
  check_method: ''
});

// 주문상태 옵션
const orderStatusOptions = [
  { label: '수동', value: 'a1' },
  { label: '자동', value: 'a2' }
];

// 테이블 데이터
const qualitys = ref([]);

// 선택된 항목
const selectedEquipment = ref(null);

// API에서 목록 조회 함수
const fetchOrders = async () => {
  try {
    // 예시: search 조건을 쿼리 파라미터로 넘길 수도 있음
    const params = {
      qcr_code: search.value.qcr_code,
      po_code: search.value.po_code,
      inspection_item: search.value.inspection_item,
      check_method: search.value.check_method,
    };

    const res = await axios.get('/api/qcr/all', { params });
    qualitys.value = res.data || [];
  } catch (error) {
    console.error('목록 조회 실패:', error);
  }
};

// 초기화 버튼 기능
const resetSearch = () => {
  search.value = {
    qcr_code: '',
    po_code: '',
    inspection_item: null,
    check_method: ''
  };
  qualitys.value = [];
};

// 테이블 선택 시
const onSelectionChange = (selected) => {
  selectedEquipment.value = selected;
};

// 등록 폼에서 등록 성공하면 이 이벤트가 날아옴
const onDataUpdated = () => {
  fetchOrders();  // 등록 후 목록 다시 불러오기
};

// 페이지 로드 시 목록 자동 조회
onMounted(() => {
  fetchOrders();
});
</script>