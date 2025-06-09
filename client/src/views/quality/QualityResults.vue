<script setup>
/* ===== IMPORT ===== */
import { ref } from 'vue';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import QualityMapping from '../../service/QualityMapping';
import orders from '@/service/OrderService';
import LabeledInput from '@/components/registration-bar/LabeledInput.vue';
import LabeledReadonlyInput from '@/components/registration-bar/LabeledReadonlyInput.vue';
import LabeledTextarea from '@/components/registration-bar/LabeledTextarea.vue';
import LabeledSelect from '@/components/registration-bar/LabeledSelect.vue';
import EditableTable from '@/components/form/EditableTable.vue';

/* ===== DATA ===== */
// 팝업
const dialogVisible = ref(false);
const ordersRef = ref(orders);

// 기본정보 폼 데이터
const ord_code = ref('');
const ord_name = ref('');
const ord_date = ref('');
const note = ref('');
const selectedInsp = ref(null);
const selectedManager = ref(null);

// 🚀 수정 불가 상태 변수
const isReadonly = ref(false);

// 거래처 옵션 예시
const InspOptions = ref([
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

/* ===== FUNCTIONS ===== */
// 팝업 Confirm 핸들러
const handleConfirm = (selectedOrder) => {
    console.log('선택된 주문:', selectedOrder);

    ord_code.value = selectedOrder.ord_code;
    ord_name.value = selectedOrder.ord_name;
    ord_date.value = selectedOrder.ord_date;

    // 거래처 처리
    const clientOption = InspOptions.value.find(option => option.label === selectedOrder.client);
    if (!clientOption && selectedOrder.client) {
        InspOptions.value.push({
            label: selectedOrder.client,
            value: selectedOrder.client
        });
    }
    selectedInsp.value = selectedOrder.client;

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

    // 🚀 기본정보 수정 불가 처리
    isReadonly.value = true;
};

// EditableTable 업데이트 핸들러
const handleUpdate = (updatedData) => {
    console.log('EditableTable 업데이트:', updatedData);
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
                    <Button label="삭제" severity="danger" class="min-w-fit" />
                    <Button label="초기화" severity="contrast" class="min-w-fit" />
                    <Button label="저장" severity="info" class="min-w-fit" />
                    <Button
                        label="검사지시서 불러오기"
                        severity="success"
                        class="min-w-fit whitespace-nowrap"
                        @click="dialogVisible = true"
                    />
                </div>
            </div>
        </div>

        <!-- 입력 폼 영역 1 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="지시코드" v-model="qio_code" :readonly="isReadonly" />    
            <LabeledInput label="제품명" :value="prod_code" placeholder="제품명" :disabled="true" />
        </div>

        <!-- 입력 폼 영역 2 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledReadonlyInput label="공정명" :value="po_code" />
            <LabeledSelect
                label="지시자"
                v-model="selectedInsp"
                :options="InspOptions"
                placeholder="지시자를 선택해주세요"
                :disabled="isReadonly"
            />
        </div>
    </div>

    <!-- 제품
    <div>
        <EditableTable
            :fields="['prod_name', 'prod_option', 'prod_amount', 'prod_price', 'delivery_date', 'ord_priority', 'total_price']"
            :mapper="{
                prod_name: '제품명',
                prod_option: '유형',
                prod_amount: '수량',
                prod_price: '단가',
                delivery_date: '납기일',
                ord_priority: '우선순위',
                total_price: '총액'
            }"
            dataKey="id"
            @update="handleUpdate"
            title="제품"
        />
    </div> -->

    <!-- ===== 팝업 영역 ===== -->
    <SinglePopup
        v-model:visible="dialogVisible"
        :items="ordersRef"
        @confirm="handleConfirm"
        :mapper="orderMapping"
    />
</template>
