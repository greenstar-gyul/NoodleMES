<script setup>
  // Vue 기본 기능 import
  import { ref, watch } from 'vue';
  import Button from 'primevue/button';
  import SinglePopup from '@/components/popup/SinglePopup.vue';
  import productMapping from '@/service/ProductMapping.js';
  import lineMapping from '@/service/LineMapping.js';
  import axios from 'axios';

  // 부모 컴포넌트에서 사용할 수 있도록 메서드 노출
  defineExpose({ resetAll });

  // 🔄 테이블 내용 초기화 함수 (부모에서 접근 가능)
  function resetAll() {
    productRows.value = [];
  }

  // 부모로부터 전달받은 props 정의 (생산계획 코드)
  const props = defineProps({
    prdp: {
      type: String,
      default: '',
    }
  });

  // 📡 생산계획 상세 데이터를 로드하는 함수 (axios GET 요청)
  const loadPlanDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/prdp_d_tbl?prdp_code=${props.prdp}`);
      const detailData = response.data;

      console.log('✅ 조회된 상세 데이터:', detailData);

      // 조회된 데이터를 productRows 배열에 추가
      detailData.forEach(detail => {
        productRows.value.push(detail);
      });

    } catch (err) {
      console.error('상세 데이터 조회 실패:', err);
    }
  };

  // 👀 props.prdp가 변경될 때마다 데이터 재조회
  watch(
    () => props.prdp,
    (newPrdp) => {
      console.log(`변경감지: ${newPrdp}`);
      console.log(`변경 후 계획: ${props.prdp}`);
      loadPlanDetails();
      return newPrdp;
    }
  );

  // ✅ 테이블에 표시할 제품 목록 (행 데이터)
  const productRows = ref([]);

  // ✅ 선택된 제품 행 목록 (체크박스 선택용)
  const selectedProducts = ref([]);

  // ✅ 팝업 열림 여부 상태
  const productPopupVisible = ref(false);  // 제품 팝업
  const linePopupVisible = ref(false);     // 라인 팝업

  // ✅ 현재 팝업이 영향을 주는 행 정보
  const currentProductRow = ref(null);     // 제품 팝업 대상 행
  const currentLineRow = ref(null);        // 라인 팝업 대상 행
  // 🗂️ 제품 목록 (팝업용 예시 데이터)
  const productList = ref([
    { prod_code: 'EQ001', prod_name: '김치', prod_type: '식품', priority: 1 },
    { prod_code: 'EQ002', prod_name: '된장', prod_type: '식품', priority: 2 },
    { prod_code: 'EQ003', prod_name: '고추장', prod_type: '식품', priority: 3 }
  ]);
  // 🏭 라인 목록 (팝업용 예시 데이터)
  const lineList = ref([
    { line_code: 'LINE001', line_name: '라인A', is_used: '사용가능' },
    { line_code: 'LINE002', line_name: '라인B', is_used: '사용가능' },
    { line_code: 'LINE003', line_name: '라인C', is_used: '사용불가' },
    { line_code: 'LINE004', line_name: '라인D', is_used: '사용가능' },
  ]);
  // ✅ 제품 팝업에서 항목 선택 후 현재 행에 데이터 반영
  const handleProductConfirm = (selectedProduct) => {
    if (currentProductRow.value && selectedProduct) {
      currentProductRow.value.prod_name = selectedProduct.prod_name;
      currentProductRow.value.prod_type = selectedProduct.prod_type;
      currentProductRow.value.priority = selectedProduct.priority;
    }
    productPopupVisible.value = false;
  };
  // ✅ 라인 팝업에서 항목 선택 후 현재 행에 데이터 반영
  const handleLineConfirm = (selectedLine) => {
    if (currentLineRow.value && selectedLine) {
      currentLineRow.value.line_code = selectedLine.line_code;
    }
    linePopupVisible.value = false;
  };
  // ➕ 행 추가: 빈 제품 행을 테이블에 추가
  const newRow = () => {
    productRows.value.push({
      prod_name: '',
      planned_qtt: 0,
      unit: '',
      priority: 0,
      line_code: '',
    });
  };
  // 🗑️ 선택된 행 삭제
  const deleteSelected = () => {
    productRows.value = productRows.value.filter(row => !selectedProducts.value.includes(row));
    selectedProducts.value = [];
  };
  // 🔍 제품 팝업 열기 (클릭한 행을 currentProductRow에 설정)
  const openProductPopup = (row) => {
    currentProductRow.value = row;
    productPopupVisible.value = true;
  };
  // 🔍 라인 팝업 열기 (클릭한 행을 currentLineRow에 설정)
  const openlinePopup = (row) => {
    currentLineRow.value = row;
    linePopupVisible.value = true;
  };
</script>

<template>
  <div class="space-y-4 mt-7">
    <div class="card flex flex-col gap-4">
      <div class="flex justify-between">
        <div class="font-semibold text-2xl">제품</div>
        <div class="flex justify-end gap-2">
          <Button label="선택 삭제" icon="pi pi-trash" severity="danger" @click="deleteSelected" />
          <Button label="행 추가" icon="pi pi-plus" @click="newRow" />
        </div>
      </div>
      <DataTable v-model:selection="selectedProducts" :value="productRows" scrollable scrollHeight="250px" showGridlines dataKey="id">
        <Column selectionMode="multiple" headerStyle="width: 3rem" />

        <Column field="prod_name" header="제품명">
          <template #body="slotProps">
            <div class="flex gap-2">
              <InputText v-model="slotProps.data.prod_name" readonly />
              <Button icon="pi pi-search" @click="() => openProductPopup(slotProps.data)" />
            </div>
          </template>
        </Column>

        <Column field="planned_qtt" header="목표수량">
          <template #body="slotProps">
            <InputNumber v-model="slotProps.data.planned_qtt" :min="0" showButtons />
          </template>
        </Column>

        <Column field="unit" header="단위">
          <template #body="slotProps">
            <InputText v-model="slotProps.data.unit" />
          </template>
        </Column>

        <Column field="priority" header="우선순위">
          <template #body="slotProps">
            <InputNumber v-model="slotProps.data.priority" :min="0" showButtons />
          </template>
        </Column>

        <Column field="line_code" header="생산라인">
          <template #body="slotProps">
            <div class="flex gap-2">
              <InputText v-model="slotProps.data.line_code" readonly />
              <Button icon="pi pi-search" @click="() => openlinePopup(slotProps.data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <!-- 팝업 영역 -->
    <!-- 제품 검색팝업 -->
   <SinglePopup v-model:visible="productPopupVisible" :items="productList" @confirm="handleProductConfirm"
      :dataKey="'prod_code'" :mapper="productMapping" placeholder="제품코드 또는 제품명 또는 제품유형 검색" />
    <!-- 라인 검색팝업  -->
  <SinglePopup v-model:visible="linePopupVisible" :items="lineList" @confirm="handleLineConfirm" :dataKey="'line_code'"
      :mapper="lineMapping" placeholder="라인코드 또는 라인명 검색" />
</template>