<script setup>
import { ref, watch, onMounted } from 'vue';
import Dialog from 'primevue/dialog';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import axios from 'axios';
import SearchText from '../../../components/search-bar/SearchText.vue';

const props = defineProps({
  visible: Boolean,
});

const emit = defineEmits(['update:visible', 'confirm']);

// 내부 상태
const selectedWKO = ref(null);
const wkoList = ref([]);
const loading = ref(false);

// 검색 조건
const searchParams = ref({
  wko_code: '',
  prdp_code: '',
  prdp_name: '',
  prod_name: '',
  start_date_from: null,
  start_date_to: null
});

// 기본 날짜 범위 설정 (최근 1달) - 새로운 객체 생성
const setDefaultDateRange = () => {
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);
  
  // 새로운 Date 객체 생성해서 참조 문제 방지
  searchParams.value.start_date_from = new Date(oneMonthAgo.getTime());
  searchParams.value.start_date_to = new Date(today.getTime());
  
  console.log('기본 날짜 설정:', {
    from: searchParams.value.start_date_from,
    to: searchParams.value.start_date_to
  });
};

// 작업상태 옵션
const statOptions = ref([
  { label: '전체', value: '' },
  { label: '대기', value: '대기' },
  { label: '진행중', value: '진행중' },
  { label: '완료', value: '완료' },
  { label: '중단', value: '중단' }
]);

// 초기 데이터 로드 (최근 1달)
const loadInitialData = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`/api/wko/searchMonth`);
    wkoList.value = response.data.data || [];
  } catch (error) {
    console.error('작업지시서 목록 로딩 실패:', error);
    wkoList.value = [];
  } finally {
    loading.value = false;
  }
};

// 검색 실행
const searchWKO = async () => {
  loading.value = true;
  try {
    // 날짜 포맷팅 - 로컬 시간대 기준으로 YYYY-MM-DD 형식 변환
    const formatDate = (date) => {
      if (!date) return null;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const params = {
      wko_code: searchParams.value.wko_code || null,
      prdp_code: searchParams.value.prdp_code || null,
      prdp_name: searchParams.value.prdp_name || null,
      prod_name: searchParams.value.prod_name || null,
      start_date_from: formatDate(searchParams.value.start_date_from),
      start_date_to: formatDate(searchParams.value.start_date_to),
    };

    console.log('검색 파라미터:', params); // 디버깅용

    const response = await axios.get(`/api/wko/search`, { params });
    wkoList.value = response.data.data || [];
    
    console.log('조회 결과:', wkoList.value.length, '건'); // 디버깅용
  } catch (error) {
    console.error('작업지시서 검색 실패:', error);
    wkoList.value = [];
  } finally {
    loading.value = false;
  }
};

// 검색 조건 초기화
const resetSearch = () => {
  searchParams.value = {
    wko_code: '',
    prdp_code: '',
    prdp_name: '',
    prod_name: '',
    start_date_from: null,
    start_date_to: null
  };
  setDefaultDateRange(); // 기본 날짜 범위 재설정
  loadInitialData();
};

// 팝업이 열릴 때 초기 데이터 로드
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      selectedWKO.value = null;
      setDefaultDateRange(); // 팝업 열릴 때 기본 날짜 설정
      loadInitialData();
    }
  }
);

// 디버깅용 - 날짜 변경 감지
watch(
  () => [searchParams.value.start_date_from, searchParams.value.start_date_to],
  (newVal, oldVal) => {
    console.log('날짜 변경 감지:', {
      from: { old: oldVal[0], new: newVal[0] },
      to: { old: oldVal[1], new: newVal[1] }
    });
  },
  { deep: true }
);

// 버튼 핸들러
const cancel = () => {
  emit('update:visible', false);
};

const confirm = () => {
  if (selectedWKO.value) {
    emit('confirm', selectedWKO.value);
    emit('update:visible', false);
  }
};

// 행 더블클릭으로 선택
const onRowDoubleClick = (event) => {
  selectedWKO.value = event.data;
  confirm();
};

// 상태별 스타일 클래스
const getStatusClass = (stat) => {
  const statusMap = {
    '대기': 'bg-yellow-100 text-yellow-800',
    '진행중': 'bg-blue-100 text-blue-800', 
    '완료': 'bg-green-100 text-green-800',
    '중단': 'bg-red-100 text-red-800'
  };
  return `px-2 py-1 rounded text-xs ${statusMap[stat] || 'bg-gray-100 text-gray-800'}`;
};

</script>

<template>
  <Dialog 
    :visible="visible" 
    modal 
    header="📋 작업지시서 목록" 
    :style="{ width: '90vw', height: '80vh' }" 
    :closable="false">
    
    <!-- 검색 조건 영역 -->
    <div class="p-4 bg-gray-50 rounded mb-4">
      <h4 class="text-lg font-semibold mb-3">🔍 검색 조건</h4>
      
      <!-- 첫 번째 행 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <SearchText label="작업지시코드" v-model="searchParams.wko_code"></SearchText>
        <!-- <div>
          <label class="block text-sm font-medium mb-1">작업지시서코드</label>
          <InputText 
          v-model="searchParams.wko_code"
          placeholder="WKO-20241215-001"
          class="w-full" />
        </div> -->
        <SearchText label="생산계획코드" v-model="searchParams.prdp_code"></SearchText>
        <!-- <div>
          <label class="block text-sm font-medium mb-1">생산계획코드</label>
          <InputText 
          v-model="searchParams.prdp_code"
          placeholder="PRDP-20241215-001"
          class="w-full" />
        </div> -->
        <SearchText label="생산계획명" v-model="searchParams.prdp_name"></SearchText>
        <!-- <div>
          <label class="block text-sm font-medium mb-1">생산계획명</label>
          <InputText 
          v-model="searchParams.prdp_name"
          placeholder="생산계획명"
          class="w-full" />
        </div> -->
      </div>
      
      <!-- 두 번째 행 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <SearchText label="제품명" v-model="searchParams.prod_name"></SearchText>
        <!-- <div>
          <label class="block text-sm font-medium mb-1">제품명</label>
          <InputText 
            v-model="searchParams.prod_name"
            placeholder="제품명"
            class="w-full" />
        </div> -->
        <div class="col-span-2">
          <SearchDateBetween 
            label="작업시작일" 
            v-model:from="searchParams.start_date_from" 
            v-model:to="searchParams.start_date_to">
          </SearchDateBetween>
        </div>
      </div>
      <div class="flex justify-center gap-3 mt-4">
        <Button 
          label="검색" 
          severity="info" 
          @click="searchWKO"
          :loading="loading" />
        <Button 
          label="초기화" 
          severity="contrast" 
          @click="resetSearch" />
      </div>
      
      <!-- 날짜 범위 안내 -->
      <!-- <div class="text-xs text-gray-500 mb-2">
        💡 기본적으로 최근 1개월 범위로 설정됩니다. 
        <span v-if="searchParams.start_date_from && searchParams.start_date_to" class="font-medium text-blue-600">
          ({{ searchParams.start_date_from.toLocaleDateString() }} ~ {{ searchParams.start_date_to.toLocaleDateString() }})
        </span>
      </div> -->
    </div>

    <!-- 결과 요약 -->
    <div class="flex justify-between items-center mb-3">
      <span class="text-sm text-gray-600">
        총 {{ wkoList.length }}건의 작업지시서가 조회되었습니다.
      </span>
      <span class="text-xs text-gray-500">
        * 행을 더블클릭하면 바로 선택됩니다.
      </span>
    </div>

    <!-- 데이터 테이블 -->
    <DataTable
      :value="wkoList"
      v-model:selection="selectedWKO"
      selectionMode="single"
      dataKey="wko_code"
      showGridlines
      scrollable
      scrollHeight="400px"
      :loading="loading"
      @rowDblclick="onRowDoubleClick"
      emptyMessage="조회된 작업지시서가 없습니다.">
      
      <Column selectionMode="single" headerStyle="width: 3rem" />
      
      <Column field="wko_code" header="작업지시서코드" style="width: 140px">
        <template #body="slotProps">
          <span class="font-mono text-blue-600 font-medium">
            {{ slotProps.data.wko_code }}
          </span>
        </template>
      </Column>
      
      <Column field="prdp_code" header="생산계획코드" style="width: 140px">
        <template #body="slotProps">
          <span class="font-mono text-purple-600">
            {{ slotProps.data.prdp_code }}
          </span>
        </template>
      </Column>
      
      <Column field="prdp_name" header="생산계획명" style="min-width: 150px">
        <template #body="slotProps">
          <span class="font-medium">{{ slotProps.data.prdp_name }}</span>
        </template>
      </Column>
      
      <Column field="prod_name" header="제품명" style="min-width: 120px">
        <template #body="slotProps">
          {{ slotProps.data.prod_name }}
        </template>
      </Column>
      
      <Column field="prod_type" header="제품타입" style="width: 80px">
        <template #body="slotProps">
          <span class="text-sm px-2 py-1 bg-gray-100 rounded">
            {{ slotProps.data.prod_type }}
          </span>
        </template>
      </Column>
      
      <Column field="stat" header="작업상태" style="width: 80px">
        <template #body="slotProps">
          <span :class="getStatusClass(slotProps.data.stat)">
            {{ slotProps.data.stat }}
          </span>
        </template>
      </Column>
      
      <Column field="start_date" header="작업시작일" style="width: 100px">
        <template #body="slotProps">
          {{ slotProps.data.start_date }}
        </template>
      </Column>
      
      <Column field="note" header="비고" style="min-width: 100px">
        <template #body="slotProps">
          <span class="text-gray-600 text-sm">
            {{ slotProps.data.note }}
          </span>
        </template>
      </Column>
    </DataTable>

    <!-- 버튼 영역 -->
    <div class="flex justify-center gap-3 mt-4">
      <Button label="취소" severity="contrast" @click="cancel" />
      <Button 
        label="선택" 
        severity="success" 
        :disabled="!selectedWKO" 
        @click="confirm" />
    </div>
  </Dialog>
</template>

<style scoped>
:deep(.p-datatable-tbody > tr:hover) {
  background-color: #f8fafc;
  cursor: pointer;
}

:deep(.p-datatable-tbody > tr.p-highlight) {
  background-color: #dbeafe;
}
</style>