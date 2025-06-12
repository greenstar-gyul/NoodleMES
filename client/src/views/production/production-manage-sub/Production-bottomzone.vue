<script setup>
  // Vue 기본 기능 import
  import { ref, watch, defineExpose} from 'vue';
  import Button from 'primevue/button';
  import SinglePopup from '@/components/popup/SinglePopup.vue';
  import productMapping from '@/service/ProductMapping.js';
  import lineMapping from '@/service/LineMapping.js';
  import axios from 'axios';

  // 부모에서 호출할 메서드 노출
  defineExpose({
    resetAll,
    getDetails: () => productRows.value  // 하단에서 현재 상태 반환
  });
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
  
  // 라인 목록 
  const lines = ref([]);
  // 라인 목록 
  const products = ref([]);

  // ✅ 팝업 열림 여부 상태
  const productPopupVisible = ref(false);  // 제품 팝업
  const linePopupVisible = ref(false);     // 라인 팝업

  
  // ✅ 현재 팝업이 영향을 주는 행 정보
  const currentProductRow = ref(null);     // 제품 팝업 대상 행
  const currentLineRow = ref(null);        // 라인 팝업 대상 행
  const tempNewRow = ref(null); // 임시로 새 행 저장

  // ✅ 라인 팝업에서 항목 선택 후 현재 행에 데이터 반영
  const handleLineConfirm = (selectedLine) => {
    if (currentLineRow.value && selectedLine) {
      currentLineRow.value.line_code = selectedLine.line_code;
    }
    linePopupVisible.value = false;
  };


  const newRow = () => {
    const emptyRowExists = productRows.value.some(row => !row.prod_code);
    if (emptyRowExists) {
      alert('먼저 빈 제품코드를 선택해주세요.');
      return;
    }
    tempNewRow.value = {
      prod_code: '',
      prod_name: '',
      planned_qtt: 0,
      unit: '',
      priority: 0,
      line_code: '',
    };
    currentProductRow.value = null; // 수정 행 없으니 null로 세팅
    productPopupVisible.value = true;
  };

  

  const handleProductConfirm = (selectedProduct) => {
    if (!selectedProduct) {
      // 취소 처리
      tempNewRow.value = null;
      currentProductRow.value = null;
      productPopupVisible.value = false;
      return;
    }

    if (currentProductRow.value) {
      // 수정 시 해당 행 내용 변경
      currentProductRow.value.prod_code = selectedProduct.prod_code;
      currentProductRow.value.prod_name = selectedProduct.prod_name;
      currentProductRow.value.unit = selectedProduct.unit;
      // 필요시 priority 등도 수정 가능
    } else if (tempNewRow.value) {
      // 새 행 추가 시
      productRows.value.push({
        prod_code: selectedProduct.prod_code,
        prod_name: selectedProduct.prod_name,
        planned_qtt: 0,
        unit: selectedProduct.unit,
        priority: 0,
        line_code: '',
      });
      tempNewRow.value = null;
    }
    currentProductRow.value = null;
    productPopupVisible.value = false;
  };

  // 🗑️ 선택된 행 삭제
  const deleteSelected = () => {
    productRows.value = productRows.value.filter(row => !selectedProducts.value.includes(row));
    selectedProducts.value = [];
  };
  // 🔍 제품 팝업 열기 (클릭한 행을 currentProductRow에 설정)
  const openProductPopup = (row) => {
    tempNewRow.value = null;      // 새 행 추가 상태 초기화
    currentProductRow.value = row; // 수정 대상 행 지정
    productPopupVisible.value = true;
  };
  // 🔍 라인 팝업 열기 (클릭한 행을 currentLineRow에 설정)
  const openlinePopup = (row) => {
    currentLineRow.value = row;
    linePopupVisible.value = true;
  };

    // 🔍 라인 팝업이 열릴 때 데이터 조회
  watch(linePopupVisible, async (visible) => {
    if (visible) {
      try {
        const response = await axios.get('/api/prdp/line');
        lines.value = response.data.map(item => ({
          line_code: item.line_code,
          line_name: item.line_name,
          is_used: item.is_used
        }));
      } catch (error) {
        console.error('라인 목록 조회 실패:', error);
      }
    }
  });
  // 🔍 제품명 팝업 열릴 때 데이터 조회
 watch(productPopupVisible, async (visible) => {
  if (visible) {
    try {
      const response = await axios.get('/api/prdp/product');

      // 이미 선택된 제품 코드 목록 추출
      const selectedCodes = productRows.value.map(row => row.prod_code);

      // disabled 플래그 추가하여 products 세팅
      products.value = response.data.map(item => ({
        prod_code: item.prod_code,
        prod_name: item.prod_name,
        com_value: item.com_value,
        is_used: item.is_used,
        unit: item.unit,
        disabled: selectedCodes.includes(item.prod_code) // 이미 선택된 경우 선택 불가
      }));

    } catch (error) {
      console.error('제품 목록 조회 실패:', error);
    }
  } else {
    products.value = [];
  }
});

  // 📡 생산계획 상세 데이터를 로드하는 함수 (axios GET 요청
  const loadPlanDetails = async () => {
    try {
      console.log('프론트에서 보낼 prdp_code:', props.prdp);

      // ✅ 기존 데이터 초기화
      productRows.value = [];
      
      const response = await axios.get(`/api/prdp/detail/one?prdp_code=${props.prdp}`);
      console.log('✅ 조회된 상세 데이터:', response.data);

      const detailData = response.data;
      detailData.forEach(detail => {
        productRows.value.push(detail);
      });

    } catch (err) {
      console.error('상세 데이터 조회 실패:', err);
    }
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
      <DataTable v-model:selection="selectedProducts" :value="productRows" scrollable scrollHeight="320px" showGridlines dataKey="prod_code">
        <Column selectionMode="multiple" headerStyle="width: 3rem" />
        <Column field="prod_code" header="제품코드">
          <template #body="slotProps">
            <div class="flex gap-2">
              <InputText v-model="slotProps.data.prod_code" readonly />
              <Button icon="pi pi-search" @click="openProductPopup(slotProps.data)" />
            </div>
          </template>
        </Column>
        <Column field="prod_name" header="제품명">
          <template #body="slotProps">
            <div class="flex gap-2">
              <InputText v-model="slotProps.data.prod_name" readonly />
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
            <InputText v-model="slotProps.data.unit" placeholder="EA" :disabled="true"/>
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
              <Button icon="pi pi-search" @click="openlinePopup(slotProps.data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <!-- 팝업 영역 -->
    <!-- 제품 검색팝업 -->
   <SinglePopup v-model:visible="productPopupVisible" :items="products" @confirm="handleProductConfirm"
      :dataKey="'prod_code'" :mapper="productMapping" placeholder="제품코드 또는 제품명 또는 제품유형 검색" />
    <!-- 라인 검색팝업  -->
  <SinglePopup v-model:visible="linePopupVisible" :items="lines" @confirm="handleLineConfirm" :dataKey="'line_code'"
      :mapper="lineMapping" placeholder="라인코드 또는 라인명 검색" />
</template>