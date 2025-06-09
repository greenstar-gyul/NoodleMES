<script setup>
/* ===== IMPORT ===== */
import { ref } from 'vue';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import orderMapping from '@/service/OrderMapping';
import productMapping from '@/service/ProductMapping.js';
import orders from '@/service/OrderService';
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

/* ===== DATA ===== */
// 주문 팝업
const orderPopupVisible = ref(false);

// 제품명 팝업
const productPopupVisible = ref(false);
const currentProductRow = ref(null);

// 주문 데이터
const ordersRef = ref(orders);

// 제품 리스트 (예시 데이터)
const productList = ref([
    { id: 1, prod_code: 'MES00123', prod_name: '신라면', prod_type: '봉지라면'},
    { id: 2, prod_code: 'MES00124', prod_name: '진라면', prod_type: '컵라면(소)'},
    { id: 3, prod_code: 'MES00125', prod_name: '너구리', prod_type: '봉지라면'},
    { id: 4, prod_code: 'MES00126', prod_name: '스낵면', prod_type: '컵라면(대)'},
]);

// 기본정보 폼 데이터
const ord_code = ref('');
const ord_name = ref('');
const ord_date = ref('');
const note = ref('');
const selectedClient = ref(null);
const selectedManager = ref(null);

// 거래처 옵션 예시
const clientOptions = ref([
    { label: '㈜한빛식품', value: 'clientA' },
    { label: '㈜맛좋은라면', value: 'clientB' },
    { label: '㈜오픈푸드', value: 'clientC' }
]);

// 거래처 담당자 옵션 예시
const managerOptions = ref([
    { label: '김철수', value: 'manager1' },
    { label: '이영희', value: 'manager2' },
    { label: '박민수', value: 'manager3' }
]);

// 규격 옵션 예시
const specOptions = ref([
    { label: '-', value: '-' },
    { label: '40', value: '40' },
    { label: '20', value: '20' },
    { label: '16', value: '16' },
    { label: '12', value: '12' },
    { label: '8', value: '8' },
    { label: '6', value: '6' },
]);

// 단위 옵션 예시
const unitOptions = ref([
    { label: '개', value: 'ea' },
    { label: 'Box', value: 'box' },
]);

// 제품 테이블 rows
const productRows = ref([]);

// 선택된 행
const selectedProducts = ref([]);

/* ===== FUNCTIONS ===== */
//초기화
const handleReset = () => {
    // 주문 기본정보 초기화
    ord_code.value = '';
    ord_name.value = '';
    ord_date.value = '';
    note.value = '';
    selectedClient.value = null;
    selectedManager.value = null;

    // 제품 목록 초기화
    productRows.value = [];
    selectedProducts.value = [];

    console.log('초기화 완료 (주문 + 제품 목록)');
};

//삭제
const handleDelete = async () => {
    if (!ord_code.value) {
        alert('주문코드가 없습니다. 삭제할 주문을 먼저 선택하세요!');
        return;
    }

    const confirmed = confirm('정말로 이 주문을 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
        // 여기서 실제 API 요청 보내기 (예시)
        // await axios.delete(`/api/orders/${ord_code.value}`);

        console.log(`주문 삭제 요청 완료: 주문코드=${ord_code.value}`);

        // 삭제 성공 시 화면 초기화
        handleReset();

        alert('주문이 삭제되었습니다.');
    } catch (error) {
        console.error('주문 삭제 실패:', error);
        alert('주문 삭제 중 오류가 발생했습니다.');
    }
};

//저장
const handleSave = () => {
    const saveData = {
        ord_code: ord_code.value,
        ord_name: ord_name.value,
        ord_date: ord_date.value,
        client_name: selectedClient.value,
        manager: selectedManager.value,
        note: note.value,
        products: productRows.value.map(row => ({
            prod_name: row.prod_name,
            prod_type: row.prod_type,
            prod_qtt: row.prod_qtt,
            prod_price: row.prod_price,
            delivery_date: row.delivery_date,
            priority: row.priority,
            total_price: row.prod_qtt * row.prod_price
        }))
    };

    console.log('저장할 데이터:', saveData);

    // 여기서 실제 서버로 저장 요청 보내면 됨 (ex. axios.post('/api/orders', saveData))
};


// 주문정보 팝업 Confirm 핸들러
const handleConfirm = (selectedOrder) => {
    console.log('선택된 주문:', selectedOrder);

    ord_code.value = selectedOrder.ord_code;
    ord_name.value = selectedOrder.ord_name;
    ord_date.value = selectedOrder.ord_date;

    // 거래처 처리
    const clientOption = clientOptions.value.find(option => option.label === selectedOrder.client_name);
    if (!clientOption && selectedOrder.client_name) {
        clientOptions.value.push({
            label: selectedOrder.client_name,
            value: selectedOrder.client_name
        });
    }
    selectedClient.value = selectedOrder.client_name;

    // 거래처 담당자 처리
    if (selectedOrder.manager) {
        const managerOption = managerOptions.value.find(option => option.label === selectedOrder.manager);
        if (!managerOption) {
            managerOptions.value.push({
                label: selectedOrder.manager,
                value: selectedOrder.manager
            });
        }
        selectedManager.value = selectedOrder.manager;
    } else {
        selectedManager.value = null;
    }

    note.value = selectedOrder.note || '';
};

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
    productRows.value.push({
        id: Date.now() + productRows.value.length,
        prod_name: '',
        prod_type: '',
        prod_qtt: 0,
        prod_price: 0,
        delivery_date: '',
        priority: '',
        total_price: 0
    });
};

// 선택 삭제
const deleteSelected = () => {
    productRows.value = productRows.value.filter(row => !selectedProducts.value.includes(row));
    selectedProducts.value = [];
};

//숫자형식
const formatNumber = (value) => {
    if (!value) return '0';
    return new Intl.NumberFormat().format(value);
};
</script>

<template>
    <!-- ===== 기본정보 영역 ===== -->
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <!-- 헤더 영역 -->
        <div class="grid grid-cols-1 gap-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">기본정보</div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button label="삭제" severity="danger" class="min-w-fit" @click="handleDelete" />
                    <Button label="초기화" severity="contrast" class="min-w-fit" @click="handleReset" />
                    <Button label="저장" severity="info" class="min-w-fit" @click="handleSave" />
                    <Button
                        label="주문정보 불러오기"
                        severity="success"
                        class="min-w-fit whitespace-nowrap"
                        @click="orderPopupVisible = true"
                    />
                </div>
            </div>
        </div>

        <!-- 입력 폼 영역 1 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="주문코드" v-model="ord_code" placeholder="주문코드" :disabled="true" />
            <LabeledInput label="주문명" v-model="ord_name" />
        </div>

        <!-- 입력 폼 영역 2 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="주문일자" v-model="ord_date" :disabled="true"/>
            <LabeledSelect
                label="거래처"
                v-model="selectedClient"
                :options="clientOptions"
                placeholder="거래처를 선택해주세요"
            />
        </div>

        <!-- 입력 폼 영역 3 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledSelect
                label="거래처 담당자"
                v-model="selectedManager"
                :options="managerOptions"
                placeholder="거래처 담당자를 선택해주세요"
            />
            <LabeledTextarea
                label="비고"
                v-model="note"
                placeholder="특이사항 입력"
            />
        </div>
    </div>

    <!-- ===== 제품 영역 ===== -->
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
            <DataTable v-model:selection="selectedProducts" :value="productRows" showGridlines scrollable scrollHeight="400px" dataKey="id">
                <Column selectionMode="multiple" headerStyle="width: 3rem" />

                <Column field="prod_name" header="제품명">
                    <template #body="slotProps">
                        <div class="flex gap-2">
                            <InputText v-model="slotProps.data.prod_name" readonly />
                            <Button icon="pi pi-search" @click="() => openProductPopup(slotProps.data)" />
                        </div>
                    </template>
                </Column>

                <Column field="prod_type" header="유형">
                    <template #body="slotProps">
                        <InputText v-model="slotProps.data.prod_type" readonly />
                    </template>
                </Column>

                <Column field="spec" header="규격">
                    <template #body="slotProps">
                        <Select v-model="slotProps.data.spec" :options="specOptions" optionLabel="label" optionValue="value" placeholder="규격" />
                    </template>
                </Column>

                <Column field="unit" header="단위">
                    <template #body="slotProps">
                        <Select v-model="slotProps.data.unit" :options="unitOptions" optionLabel="label" optionValue="value" placeholder="단위" />
                    </template>
                </Column>

                <Column field="prod_qtt" header="수량">
                    <template #body="slotProps">
                        <InputNumber v-model="slotProps.data.prod_qtt" :min="0" showButtons />
                    </template>
                </Column>

                <Column field="prod_price" header="단가">
                    <template #body="slotProps">
                        <InputNumber v-model="slotProps.data.prod_price" />
                    </template>
                </Column>

                <Column field="delivery_date" header="납기일">
                    <template #body="slotProps">
                        <Calendar v-model="slotProps.data.delivery_date" dateFormat="yy-mm-dd" showIcon />
                    </template>
                </Column>

                <Column field="priority" header="우선순위">
                    <template #body="slotProps">
                        <InputNumber v-model="slotProps.data.priority" :min="0" showButtons/>
                    </template>
                </Column>

                <Column field="total_price" header="총액">
                    <template #body="slotProps">
                        <InputText :value="formatNumber(slotProps.data.prod_qtt * slotProps.data.prod_price)" readonly />
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>

    <!-- ===== 주문정보 팝업 ===== -->
    <SinglePopup
        v-model:visible="orderPopupVisible"
        :items="ordersRef"
        @confirm="handleConfirm"
        :mapper="orderMapping"
        :dataKey="'ord_code'"
    />

    <!-- ===== 제품명 팝업 ===== -->
    <SinglePopup
        v-model:visible="productPopupVisible"
        :items="productList"
        @confirm="handleProductConfirm"
        :mapper="productMapping"
    />
</template>
