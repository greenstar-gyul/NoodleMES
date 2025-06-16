<script setup>
import { ref, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useOrderProductStore } from '@/stores/OrderProductStore';

import axios from 'axios';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import productMapping from '@/service/ProductMapping.js';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';

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

// 출고정보를 불러왔는지 여부
const isReleaseLoaded = ref(false);

//제품리스트
const productList = ref([]);

/* ===== FUNCTIONS ===== */
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

// 출고요청수량 변화에 따라 남은수량 계산
watch(productRows, (rows) => {
  rows.forEach(row => {
    const ordered = Number(row.prod_amount) || 0;
    let requested = Number(row.out_req_d_amount) || 0;

    // 초과 방지
    if (requested > ordered) {
      row.out_req_d_amount = ordered;
      requested = ordered;
    }

    row.remain_amount = ordered - requested;
  });
}, { deep: true });


//제품 불러오기
onMounted(async () => {
  try {
    // 제품 목록
    const prodRes = await axios.get('/api/order/products'); // 제품 전체 목록 불러오기
    productList.value = prodRes.data.data; // 전체 제품 목록 저장

    } catch (err) {
        console.error('제품 리스트 불러오기 실패:', err);
    }
});
</script>
<template>
  <div class="space-y-4 mt-7">
    <div class="card flex flex-col gap-4">
        <!-- 헤더 -->
        <div>
            <div class="font-semibold text-2xl">제품</div>
        </div>

        <!-- 제품 테이블 -->
        <DataTable v-model:selection="selectedProducts" :value="productRows" showGridlines scrollable scrollHeight="450px" dataKey="ord_d_code" class="w-full fixed-table">

            <Column field="prod_name" header="제품명" style="width: 220px" bodyStyle="width: 220px">
                <template #body="slotProps">
                    <InputText v-model="slotProps.data.prod_name" style="width: 100%" readonly />
                </template>
            </Column>

            <Column field="com_value" header="유형" style="width: 120px" bodyStyle="width: 120px">
                <template #body="slotProps">
                    <InputText v-model="slotProps.data.com_value" style="width: 100%" readonly />
                </template>
            </Column>    
            
            <Column field="spec" header="주문수량" style="width: 130px" bodyStyle="width: 130px">
                <template #body="slotProps">
                    <InputText v-model="slotProps.data.prod_amount" style="width: 100%" readonly />
                </template>
            </Column>

            <Column field="out_req_d_amount" header="출고수량" style="width: 130px" bodyStyle="width: 100px">
                <template #body="slotProps">
                    <template v-if="!isReleaseLoaded">
                        <InputNumber v-model="slotProps.data.out_req_d_amount" :min="0" :max="slotProps.data.prod_amount" showButtons :inputStyle="{ width: '100%' }"/>
                    </template>
                    <template v-else>
                        <InputText :value="formatNumber(slotProps.data.out_req_d_amount)" readonly style="width: 100%"/>
                    </template>
                </template>
            </Column>
            
            <Column field="remain_amount" header="남은수량" style="width: 130px" bodyStyle="width: 130px">
                <template #body="slotProps">
                    <InputText :value="formatNumber(slotProps.data.remain_amount)" readonly style="width: 100%" />
                </template>
            </Column>
            

            <Column field="delivery_date" header="납기일" style="width: 140px" bodyStyle="width: 140px">
                <template #body="slotProps">
                    <Calendar v-model="slotProps.data.delivery_date" dateFormat="yy-mm-dd" showIcon style="width: 100%"/>
                </template>
            </Column>            
        </DataTable>
    </div>
  </div>
</template>