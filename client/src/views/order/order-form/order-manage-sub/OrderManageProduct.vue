<script setup>
import { ref, watch, onMounted } from 'vue';
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

const props = defineProps({
  productRows: { type: Array, required: true },
  selectedProducts: { type: Array, required: true }
});

/* ===== DATA ===== */
// 제품명 팝업
const productPopupVisible = ref(false);

//테이블 행
const currentProductRow = ref(null);

// 선택된 행
const selectedProducts = ref([]);

//제품리스트
const productList = ref([]);

/* ===== FUNCTIONS ===== */
// 제품명 팝업 열기
const openProductPopup = (row) => {
    currentProductRow.value = row;
    productPopupVisible.value = true;
};

// 제품명 팝업 Confirm 핸들러
const handleProductConfirm = (selectedProduct) => {
    console.log('선택된 제품:', selectedProduct);

    if (currentProductRow.value) {
        currentProductRow.value.prod_name = selectedProduct.prod_name;
        currentProductRow.value.prod_type = selectedProduct.prod_type;
        currentProductRow.value.priority = selectedProduct.priority;
    }
};

// 행 추가
const addRow = () => {
    const rows = props.productRows || [];
    const newRow = {
        id: Date.now() + rows.length,
        prod_name: '',
        prod_type: '',
        spec: '',
        unit: '',
        prod_qtt: 0,
        prod_price: 0,
        delivery_date: '',
        priority: 0,
        total_price: 0
    };

    props.productRows.push(newRow);
};


// 선택 삭제
const deleteSelected = () => {
    // 선택된 제품이 없을 경우 함수를 종료
    if (selectedProducts.length == 0) {
        return;
    }
        
    // 1. 선택되지 않은 행만 필터링
    // props.productRows 배열에서 selectedProducts.value에 포함되지 않은 항목만 남김
    const selRows = props.productRows.filter((item) => {
        return !(selectedProducts.value.findIndex((selProd) => item.id === selProd.id) > -1);
    });
    
    // 2. props.productRows 배열 초기화 (기존 행들 모두 제거)
    while (props.productRows.length > 0) {
        props.productRows.pop(); // 배열의 마지막 요소부터 하나씩 제거
    }

    // 3. 선택되지 않은 행만 다시 push해서 화면에 반영
    props.productRows.push(...selRows); // 선택되지 않은 행들만 남겨서 다시 배열에 추가
};


//숫자형식
const formatNumber = (value) => {
    if (!value) return '0';
    return new Intl.NumberFormat().format(value);
};

//총액 자동 계산
watch(props.productRows, (rows) => {
  rows.forEach(row => {
    row.total_price = (row.prod_qtt || 0) * (row.prod_price || 0);
  });
}, { deep: true });

//제품 불러오기
onMounted(async () => {
  try {
    const res = await fetch('/api/order/prod_tbl');
    const data = await res.json();
    productList.value = data;
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
        <DataTable v-model:selection="selectedProducts" :value="props.productRows" showGridlines scrollable scrollHeight="450px" dataKey="id" class="w-full fixed-table">
            <Column selectionMode="multiple" headerStyle="width: 3rem" />

            <Column field="prod_name" header="제품명" style="width: 220px" bodyStyle="width: 220px">
                <template #body="slotProps">
                    <div class="flex gap-2">
                        <InputText v-model="slotProps.data.prod_name" style="width: 100%" readonly />
                        <Button icon="pi pi-search" style="width: 32px; min-width: 32px;" @click="() => openProductPopup(slotProps.data)" />
                    </div>
                </template>
            </Column>

            <Column field="prod_type" header="유형" style="width: 120px" bodyStyle="width: 120px">
                <template #body="slotProps">
                    <InputText v-model="slotProps.data.prod_type" style="width: 100%" readonly />
                </template>
            </Column>

            <Column field="spec" header="규격" style="width: 130px" bodyStyle="width: 130px">
                <template #body="slotProps">
                    <Select v-model="slotProps.data.spec" :options="specOptions" optionLabel="label" optionValue="value" placeholder="규격"  style="width: 100%"/>
                </template>
            </Column>

            <Column field="unit" header="단위" style="width: 100px" bodyStyle="width: 100px">
                <template #body="slotProps">
                    <Select v-model="slotProps.data.unit" :options="unitOptions" optionLabel="label" optionValue="value" placeholder="단위"  style="width: 100%"/>
                </template>
            </Column>

            <Column field="prod_qtt" header="수량" style="width: 60px" bodyStyle="width: 100px">
                <template #body="slotProps">
                    <InputNumber v-model="slotProps.data.prod_qtt" :min="0" showButtons  inputStyle="width: 100%"/>
                </template>
            </Column>

            <Column field="prod_price" header="단가" style="width: 100px" bodyStyle="width: 100px">
                <template #body="slotProps">
                    <InputNumber v-model="slotProps.data.prod_price" inputStyle="width: 100%"/>
                </template>
            </Column>

            <Column field="delivery_date" header="납기일" style="width: 140px" bodyStyle="width: 140px">
                <template #body="slotProps">
                    <Calendar v-model="slotProps.data.delivery_date" dateFormat="yy-mm-dd" showIcon style="width: 100%"/>
                </template>
            </Column>

            <Column field="priority" header="우선순위" style="width: 100px" bodyStyle="width: 100px">
                <template #body="slotProps">
                    <InputNumber v-model="slotProps.data.priority" :min="0" showButtons inputStyle="width: 100%"/>
                </template>
            </Column>

            <Column field="total_price" header="총액" style="width: 100px" bodyStyle="width: 100px">
                <template #body="slotProps">
                    <InputText :value="formatNumber(slotProps.data.prod_qtt * slotProps.data.prod_price)" readonly style="width: 100%"/>
                </template>
            </Column>
        </DataTable>
    </div>
  </div>

  <!-- ===== 제품명 팝업 ===== -->
  <SinglePopup
      v-model:visible="productPopupVisible"
      :items="productList"
      @confirm="handleProductConfirm"
      :mapper="productMapping"
  />
</template>