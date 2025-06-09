<template>
    <!-- 우측: 제품 등록 영역 (45%) -->
    <div class="card space-y-6 p-6" style="width: 45%">
        <!-- 버튼 영역역 -->
        <div class="grid grid-cols-1 gap-4 mb-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">품질기준정보</div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button label="수정" severity="info" class="min-w-fit whitespace-nowrap" outlined />
                    <Button label="등록" severity="success" class="min-w-fit whitespace-nowrap" outlined />
                </div>
            </div>
        </div>
        <!-- 품질기준코드 / 검사대상 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">품질기준코드</label>
                <InputText type="text" placeholder="제품코드" :disabled="true" class="w-full" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">검사대상</label>
                <InputText type="text" class="w-full" />
            </div>
            <SearchText v-model="search.ord_code" label="제품명" placeholder="제품명 입력하세요" />
        </div>

        <!-- 기준 / 검사항목 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">기준(상한)</label>
                <InputText type="text" class="w-full" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">검사항목</label>
                <Dropdown v-model="search.is_used" :options="orderStatusOptions" optionLabel="label" optionValue="value" placeholder="" class="w-full" />
            </div>
        </div>

        <!-- 유통기한 / 등록일자 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">단위</label>
                <InputText type="text" class="w-full" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">기준(하한)</label>
                <InputText type="text" class="w-full" />
            </div>
        </div>
        <!-- 유통기한 / 등록일자 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">등록일자</label>
                <InputText type="text" placeholder="자동으로 입력" :disabled="true" class="w-full" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">판정방식</label>
                <InputText type="text" class="w-full" />
            </div>
        </div>

        <!-- 비고 -->
        <div>
            <label class="font-semibold text-xl block mb-2">비고</label>
            <Textarea placeholder="특이사항 입력" :autoResize="true" rows="5" class="w-full" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import SearchText from '@/components/search-bar/SearchText.vue';

// 검색조건 데이터 (v-model로 바인딩됨)
const search = ref({
    prod_code: '',
    prod_name: '',
    regdate_from: null,
    regdate_to: null,
    is_used: ''
});

// 주문상태 옵션 (예시 데이터)
const orderStatusOptions = [
    { label: '활성', value: 'a1' },
    { label: '비활성', value: 'a2' }
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
