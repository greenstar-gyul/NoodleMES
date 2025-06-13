<script setup>
import { ref, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useOrderProductStore } from '@/stores/OrderProductStore';

import axios from 'axios';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import orderMapping from '@/service/OrderMapping';
import productMapping from '@/service/ProductMapping.js';

import LabeledInput from '@/components/registration-bar/LabeledInput.vue';
import LabeledTextarea from '@/components/registration-bar/LabeledTextarea.vue';
import LabeledSelect from '@/components/registration-bar/LabeledSelect.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';
import { Select } from 'primevue';

// 피니아
// const { productRows, selectedProducts, setProductRows, resetProductRows, setSelectedProducts } = useOrderProductStore();
const prodStore = useOrderProductStore();
// Store에서 프로퍼티를 추출하면서 반응성을 유지하려면 storeToRefs()를 사용해야 한다.
// storeToRefs()는 Pinia 스토어의 "상태!"를 반응형으로 변환해준다.
// 따라서, storeToRefs()를 사용하여 상태를 추출하는 것이 좋다.

// 상태는 반응형으로 가져오기
const { productRows, selectedProducts } = storeToRefs(prodStore);
// 함수는 그대로 가져오기
const { setProductRows, resetProductRows, setSelectedProducts } = prodStore;



/* ===== DATA ===== */
// 제품명 팝업
const productPopupVisible = ref(false);

//테이블 행
const currentProductRow = ref(null);

//제품리스트
const productList = ref([]);

// 규격 옵션 목록
// const specOptions = ref([]);

// 단위 옵션 목록 
// const unitOptions = ref([]);

/* ===== FUNCTIONS ===== */
// 제품명 팝업 열기
const openProductPopup = (row) => {
    currentProductRow.value = row;
    productPopupVisible.value = true;
};

// 팝업에서 제품 선택 시 현재 행에 값 반영
const handleProductConfirm = (selectedProduct) => {
    console.log('선택된 제품:', selectedProduct);
    if (currentProductRow.value) {
        // 선택된 제품 정보를 현재 선택된 행에 넣기
        currentProductRow.value.prod_name = selectedProduct.prod_name;
        currentProductRow.value.com_value = selectedProduct.com_value;
        currentProductRow.value.spec = selectedProduct.spec;
        currentProductRow.value.unit = selectedProduct.unit;
        currentProductRow.value.prod_code = selectedProduct.prod_code; // 서버 전송용

        // 현재 행의 나머지 필드 초기화
        currentProductRow.value.prod_amount = 0;
        currentProductRow.value.prod_price = 0;
        currentProductRow.value.delivery_date = '';
        currentProductRow.value.ord_priority = 0;
        currentProductRow.value.total_price = 0;
    }
};

// 행 추가
const addRow = () => {
    const newRow = {
        ord_d_code: `temp-${Date.now()}`,
        prod_name: '',
        com_value: '',
        spec: '',
        unit: '',
        prod_amount: 0,
        prod_price: 0,
        delivery_date: '',
        ord_priority: 0,
        total_price: 0
    };

    // 안전하게 배열인지 확인 후 할당
    if (!Array.isArray(productRows.value)) {
        productRows.value = [];
    }

    productRows.value = [...productRows.value, newRow];
};

// 선택 삭제
const deleteSelected = () => {
    // 선택된 제품이 없을 경우 함수를 종료
    if (!selectedProducts.value || selectedProducts.value.length === 0) {
        return;
    }

    // 선택되지 않은 행만 필터링 (key: ord_d_code)
    // productRows 배열에서 selectedProducts.value에 포함되지 않은 항목만 남김
    const selRows = productRows.value.filter(item => {
        return !selectedProducts.value.some(sel => sel.ord_d_code === item.ord_d_code);
    });

    // productRows 배열 초기화 (기존 행들 모두 제거)
    while (productRows.value.length > 0) {
        productRows.value.pop(); // 배열의 마지막 요소부터 하나씩 제거
    }

    // 선택되지 않은 행만 다시 push해서 화면에 반영
    productRows.value.push(...selRows); // 선택되지 않은 행들만 남겨서 다시 배열에 추가

    // 선택 해제
    setSelectedProducts([]);
};


//숫자형식(콤마)
const formatNumber = (value) => {
    if (!value) return '0';
    return new Intl.NumberFormat().format(value);
};

//총액 자동 계산
watch(productRows, (rows) => {
  rows.forEach(row => {
    row.total_price = (row.prod_amount || 0) * (row.prod_price || 0);
  });
}, { deep: true });

//제품 불러오기
onMounted(async () => {
  try {
    // 제품 목록
    const prodRes = await axios.get('/api/order/products'); // 제품 전체 목록 불러오기
    productList.value = prodRes.data.data; // 전체 제품 목록 저장

    // // 규격 옵션 (공통코드: 0O, 0X, 0Y)
    // const specRes = await axios.get('/api/order/spec');
    // specOptions.value = specRes.data.data;

    // // 단위 옵션 (공통코드: 0H)
    // const unitRes = await axios.get('/api/order/unit');
    // unitOptions.value = unitRes.data.data;


    } catch (err) {
        console.error('제품 리스트 불러오기 실패:', err);
    }
});
</script>
<template>
  <div class="space-y-4 mt-7">
    <div class="card flex flex-col gap-4">
        <!-- 헤더 -->
        <div class="flex justify-between">
            <div>
                <div class="font-semibold text-2xl">제품</div>
            </div>
            <div class="flex justify-end gap-2">
                <Button label="선택 삭제" icon="pi pi-trash" severity="danger" @click="deleteSelected" />
                <Button label="행 추가" icon="pi pi-plus" @click="addRow" />
            </div>
        </div>

        <!-- 제품 테이블 -->
        <DataTable v-model:selection="selectedProducts" :value="productRows" showGridlines scrollable scrollHeight="450px" dataKey="ord_d_code" class="w-full fixed-table">
            <Column selectionMode="multiple" headerStyle="width: 3rem" />

            <Column field="prod_name" header="제품명" style="width: 220px" bodyStyle="width: 220px">
                <template #body="slotProps">
                    <div class="flex gap-2">
                        <InputText v-model="slotProps.data.prod_name" style="width: 100%" readonly />
                        <Button icon="pi pi-search" style="width: 32px; min-width: 32px;" @click="() => openProductPopup(slotProps.data)" />
                    </div>
                </template>
            </Column>

            <Column field="com_value" header="유형" style="width: 120px" bodyStyle="width: 120px">
                <template #body="slotProps">
                    <InputText v-model="slotProps.data.com_value" style="width: 100%" readonly />
                </template>
            </Column>    
            
            <Column field="spec" header="규격" style="width: 130px" bodyStyle="width: 130px">
                <template #body="slotProps">
                    <InputText v-model="slotProps.data.spec" style="width: 100%" readonly />
                    <!-- <Select v-model="slotProps.data.spec" :options="specOptions" optionLabel="label" optionValue="value" placeholder="규격"  style="width: 100%"/> -->
                </template>
            </Column>

            <Column field="unit" header="단위" style="width: 100px" bodyStyle="width: 100px">
                <template #body="slotProps">
                    <InputText v-model="slotProps.data.unit" style="width: 100%" readonly />
                    <!-- <Select v-model="slotProps.data.unit" :options="unitOptions" optionLabel="label" optionValue="value" placeholder="단위"  style="width: 100%"/> -->
                </template>
            </Column>            

            <Column field="prod_amount" header="수량" style="width: 60px" bodyStyle="width: 100px">
                <template #body="slotProps">
                    <InputNumber v-model="slotProps.data.prod_amount" :min="0" showButtons  :inputStyle="{ width: '100%' }"/>
                </template>
            </Column>

            <Column field="prod_price" header="단가(원)" style="width: 100px" bodyStyle="width: 100px">
                <template #body="slotProps">
                    <InputNumber v-model="slotProps.data.prod_price" :inputStyle="{ width: '100%' }"/>
                </template>
            </Column>

            <Column field="delivery_date" header="납기일" style="width: 140px" bodyStyle="width: 140px">
                <template #body="slotProps">
                    <Calendar v-model="slotProps.data.delivery_date" dateFormat="yy-mm-dd" showIcon style="width: 100%"/>
                </template>
            </Column>

            <Column field="ord_priority" header="우선순위" style="width: 100px" bodyStyle="width: 100px">
                <template #body="slotProps">
                    <InputNumber v-model="slotProps.data.ord_priority" :min="0" showButtons :inputStyle="{ width: '100%' }"/>
                </template>
            </Column>

            <Column field="total_price" header="총액(원)" style="width: 100px" bodyStyle="width: 100px">
                <template #body="slotProps">
                    <InputText :value="formatNumber(slotProps.data.prod_amount * slotProps.data.prod_price)" readonly style="width: 100%"/>
                </template>
            </Column>
        </DataTable>
    </div>
  </div>

  <!-- ===== 제품명 팝업 ===== -->
  <SinglePopup
      v-model:visible="productPopupVisible"
      :selectedHeader = "['prod_name', 'prod_code','com_value', 'note']"
      :items="productList"
      @confirm="handleProductConfirm"
      :mapper="productMapping"
      :dataKey="'prod_code'"
  />
</template>