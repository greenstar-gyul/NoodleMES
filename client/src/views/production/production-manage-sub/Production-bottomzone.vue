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
    console.log('✅ [Bottomzone] resetAll 실행됨');
    productRows.value = [];
    selectedProducts.value = []; // ✅ 추가
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
      spec: '',
      priority: 0,
      line_code: ''
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
      currentProductRow.value.com_value = selectedProduct.com_value;
      currentProductRow.value.unit = selectedProduct.unit;
      currentProductRow.value.spec = selectedProduct.spec; 
      // 필요시 priority 등도 수정 가능
    } else if (tempNewRow.value) {
      // 새 행 추가 시
      productRows.value.push({
        prod_code: selectedProduct.prod_code,
        prod_name: selectedProduct.prod_name,
        com_value: selectedProduct.com_value,
        planned_qtt: 0,
        unit: selectedProduct.unit,
        spec: selectedProduct.spec,
        priority: 0,
        line_code: '',
        emp_code: 'EMP-10001' 
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

  // 라인 팝업 열기
 const openlinePopup = async (row) => {
  currentLineRow.value = row;

  const prodTypeKey = row.com_value;                    // 제품 유형: j1, j2, j3
  const lineTypeCode = productTypeMap[prodTypeKey];     // → s1, s2로 매핑
  const prodCode = row.prod_code;                       // ✅ 제품코드 추출

  if (!lineTypeCode || !prodCode) {
    alert(`유효하지 않은 제품 정보입니다: type=${lineTypeCode}, code=${prodCode}`);
    return;
  }

  try {
    const response = await axios.get('/api/prdp/line', {
      params: {
        type: lineTypeCode,    // ex: s1
        prodCode: prodCode     // ex: P001
      }
    });

    lines.value = response.data;
    linePopupVisible.value = true;
  } catch (error) {
    console.error('❌ 라인 조회 실패:', error);
    alert('라인 정보를 불러오는 데 실패했습니다.');
  }
};


  // 🔍 제품명 팝업 열릴 때 데이터 조회
 watch(productPopupVisible, async (visible) => {
  if (visible) {
    try {
      const response = await axios.get('/api/prdp/product');

      // disabled 플래그 추가하여 products 세팅
      products.value = response.data.map(item => ({
        prod_code: item.prod_code,
        prod_name: item.prod_name,
        com_value: item.com_value,
        unit: item.unit,
        spec: item.spec
      }));

    } catch (error) {
      console.error('제품 목록 조회 실패:', error);
    }
  } else {
    products.value = [];
  }
});

  // 📡 생산계획 상세 데이터를 로드하는 함수
  const loadPlanDetails = async () => {
    try {
      // ✅ 기존 데이터 초기화
      productRows.value = [];

      const response = await axios.get(`/api/prdp/detail/one?prdp_code=${props.prdp}`);

      const detailData = response.data;

      // 실제 화면에 뿌릴 데이터 적용
      detailData.forEach(detail => {
        productRows.value.push(detail);
      });

    } catch (err) {
      console.error('❌ 상세 데이터 조회 실패:', err);
    }
  };

  // 제품유형 코드 → 라인유형 코드 매핑 (로직용)
  const productTypeMap = {
    'j1': 's1',
    'j2': 's2',
    'j3': 's2',
    '봉지라면': 's1',
    '컵라면(대)': 's2',
    '컵라면(소)': 's2'
  };

  // 라인유형 코드 → 사람 읽기용 이름 매핑 (표시용)
  const productTypeNameMap = {
    's1': '봉지라면',
    's2': '컵라면(대)',
    's4': '컵라면(소)',
    's3': '제품전용'
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
      <DataTable v-model:selection="selectedProducts" :value="productRows" scrollable scrollHeight="320px" showGridlines
          dataKey="prod_code">
          <Column selectionMode="multiple" headerStyle="width: 3rem" />

          <!-- 제품코드 (234px) -->
          <Column field="prod_code" header="제품코드" style="width: 230px">
              <template #body="slotProps">
                  <div class="flex gap-2">
                      <InputText v-model="slotProps.data.prod_code" readonly style="width: 180px" />
                      <Button icon="pi pi-search" @click="openProductPopup(slotProps.data)" />
                  </div>
              </template>
          </Column>

          <!-- 제품명 (197px) -->
          <Column field="prod_name" header="제품명" style="width: 195px">
              <template #body="slotProps">
                  <InputText v-model="slotProps.data.prod_name" readonly style="width: 100%" />
              </template>
          </Column>
          <!-- 제품유형 -->
          <Column field="com_value" header="제품유형" style="width: 150px">
            <template #body="slotProps">
              <InputText
                :value="productTypeNameMap[productTypeMap[slotProps.data.com_value] || slotProps.data.com_value] || slotProps.data.com_value"
                readonly
                style="width: 100%"
              />
            </template>
          </Column>

         

          <!-- 단위 (160px) -->
          <Column field="unit" header="단위" style="width: 159px">
              <template #body="slotProps">
                  <InputText v-model="slotProps.data.unit" disabled style="width: 100%" />
              </template>
          </Column>

          <!-- 규격 (160px) -->
          <Column field="spec" header="규격" style="width: 159px">
              <template #body="slotProps">
                  <InputText v-model="slotProps.data.spec" disabled style="width: 100%" />
              </template>
          </Column>
          
          <Column field="planned_qtt" header="목표수량" style="width: 230px">
              <template #body="slotProps">
                  <InputNumber v-model="slotProps.data.planned_qtt" :min="0" showButtons inputStyle="width: 100%" />
              </template>
          </Column>

          <Column field="priority" header="우선순위" style="width: 100px">
              <template #body="slotProps">
                  <InputNumber v-model="slotProps.data.priority" :min="0" showButtons inputStyle="width: 100px" />
              </template>
          </Column>

          <!-- 생산라인 (237px) -->
          <Column field="line_code" header="생산라인" style="width: 235px">
              <template #body="slotProps">
                  <div class="flex gap-2">
                      <InputText v-model="slotProps.data.line_code" readonly style="width: 180px" />
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