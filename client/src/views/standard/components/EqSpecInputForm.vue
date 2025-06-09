<template>
    <!-- 우측: 제품 등록 영역 (45%) -->
    <div class="card space-y-6 p-6" style="width: 45%">
        <!-- 버튼 영역역 -->
        <div class="grid grid-cols-1 gap-4 mb-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">검사정보</div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button label="수정" severity="info" class="min-w-fit whitespace-nowrap" outlined />
                    <Button label="등록" severity="success" class="min-w-fit whitespace-nowrap" outlined />
                </div>
            </div>
        </div>
        <!-- 설비코드 / 설비명 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">점검항목코드</label>
                <InputText type="text" placeholder="제품코드" :disabled="true" class="w-full" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">설비유형</label>
                <InputText type="text" class="w-full" />
            </div>
        </div>

        <!-- 모델명 / 제조사 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">항목명</label>
                <InputText type="text" class="w-full" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">점검방법</label>
                <InputText type="text" class="w-full" />
            </div>
        </div>

        <!-- 용량 / 도입일자 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">기준값</label>
                <InputText type="text" class="w-full" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">단위</label>
                <InputText type="text" class="w-full" />
            </div>
        </div>

        <!-- 제조일자 / 점검주기 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">점검주기</label>
                <div class="flex items-center gap-2">
                    <InputText 
                        type="number" 
                        class="w-full" 
                        v-model="checkCycle"
                        placeholder="30"
                        min="1"
                    />
                    <span class="text-gray-700 font-medium">일</span>
                </div>
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">필수점검여부</label>
                <div class="flex items-center gap-6">
    <div class="flex items-center gap-2">
        <RadioButton 
            v-model="requiredCheck" 
            inputId="required_yes" 
            name="requiredCheck" 
            value="yes" 
        />
        <label for="required_yes">필수</label>
    </div>
    <div class="flex items-center gap-2">
        <RadioButton 
            v-model="requiredCheck" 
            inputId="required_no" 
            name="requiredCheck" 
            value="no" 
        />
        <label for="required_no">선택</label>
    </div>
</div>
            </div>
        </div>

        <!-- 인계일자 / 설비유형 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">설비유형</label>
                <Dropdown v-model="search.eq_opt" :options="eqOptions" optionLabel="label" optionValue="value" placeholder="" class="w-full" />
            </div>
            <div>
                <LabeledDatePicker v-model="regdate" label="등록일자" placeholder="날짜를 선택" :disabled="false" />
            </div>
        </div>

        <!-- 비고 -->
        <div>
            <label class="font-semibold text-xl block mb-2">비고</label>
            <Textarea placeholder="특이사항 입력" :autoResize="true" rows="4" class="w-full" />
        </div>
    </div>
    <SinglePopup v-model:visible="dialogVisible" :items="clients" @confirm="handleConfirm" :mapper="clientMapper" :dataKey="'client_code'"></SinglePopup>
</template>

<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import RadioButton from 'primevue/radiobutton';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import SearchText from '@/components/search-bar/SearchText.vue';
import LabeledDatePicker from '@/components/common/LabeledDatePicker.vue';

// 검색조건 데이터 (v-model로 바인딩됨)
const search = ref({
    prod_code: '',
    prod_name: '',
    regdate_from: null,
    regdate_to: null,
    is_used: ''
});

const openPopup = () => {
    dialogVisible.value = true;
}

// 팝업
const dialogVisible = ref(false);

const requiredCheck = ref('yes');

// 상태 옵션 (예시 데이터)
const chkOptions = [
    { label: 'Y', value: 'a1' },
    { label: 'N', value: 'a2' }
];

const eqOptions = [
    { label: '반죽기', value: 'b1' },
    { label: '배합기', value: 'b2' }
];

// 조회 버튼 기능 (API 호출 자리)
const fetchOrders = () => {
    console.log('조회 실행:', search.value);
    // TODO: 실제 API 호출로 데이터 갱신
};

// 초기화 버튼 기능
const resetSearch = () => {
    search.value = {
        prod_code: '',
        prod_name: '',
        regdate_from: null,
        regdate_to: null,
        is_used: ''
    };
};

// 테이블에 보여줄 제품 데이터 (예시 데이터)
const products = ref([
    {
        prod_code: 'WH001',
        prod_name: '신라면',
        edate: '150일',
        regdate: '2025.06.06',
        is_used: '활성'
    },
    {
        prod_code: 'WH002',
        prod_name: '짜파게티',
        edate: '150일',
        regdate: '2025.06.07',
        is_used: '활성'
    },
    {
        prod_code: 'WH001',
        prod_name: '진진라면',
        edate: '150일',
        regdate: '2025.06.01',
        is_used: '비활성'
    }
]);

const mats = ref([
    {
        mat_code: 'RM001',
        mat_name: '밀가루',
        mat_type: '원자재',
        req_qtt: 'EA',
        unit: '100g',
        loss_rate: '0.5%'
    },
    {
        mat_code: 'RM002',
        mat_name: '스프',
        mat_type: '원자재',
        req_qtt: 'EA',
        unit: '20g',
        loss_rate: '0.5%'
    },
    {
        mat_code: 'RM003',
        mat_name: '비닐포장지',
        mat_type: '부자재',
        req_qtt: 'EA',
        unit: '100mm',
        loss_rate: '-'
    }
]);

// DataTable 선택된 행 (선택 모드)
const selectedProducts = ref();
</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>
