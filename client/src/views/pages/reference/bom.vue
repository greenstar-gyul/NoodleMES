<template>
    <!-- 🔍 검색바 영역 -->
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <!-- 검색 조건 영역 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <!-- 주문번호 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">제품코드</label>
                <InputText v-model="search.prod_code" class="flex-1" />
            </div>

            <!-- 주문명 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">제품명</label>
                <InputText v-model="search.prod_name" class="flex-1" />
            </div>

            <!-- 납기일 (범위) -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">등록일자</label>
                <div class="flex items-center flex-1 gap-2">
                    <Calendar v-model="search.regdate_from" class="flex-1" dateFormat="yy-mm-dd" />
                    <span>~</span>
                    <Calendar v-model="search.regdate_to" class="flex-1" dateFormat="yy-mm-dd" />
                </div>
            </div>

            <!-- 상태 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">사용여부</label>
                <Dropdown v-model="search.is_used1" :options="orderStatusOptions" optionLabel="label" optionValue="value" placeholder="" class="flex-1" />
            </div>
        </div>

        <!-- 조회/초기화 버튼 영역 -->
        <div class="flex justify-center gap-3 mt-4">
            <Button label="초기화" severity="contrast" @click="resetSearch" />
            <Button label="조회" severity="info" @click="fetchOrders" />
        </div>
    </div>

    <!-- 📋 검색 조회 테이블 영역 -->
    <div class="flex flex-col lg:flex-row gap-6 mt-6">
        <!-- 좌측: 검색결과 + 하위자재 구성 (50%) -->
        <div class="space-y-6" style="width: 55%">
            <!-- 검색결과 테이블 -->
            <div class="card">
                <div class="grid grid-cols-1 gap-4 mb-4">
                    <div class="flex justify-between">
                        <div>
                            <div class="font-semibold text-2xl">검색결과</div>
                        </div>
                        <div class="flex items-center gap-2 flex-nowrap">
                            <Button label="삭제" severity="danger" class="min-w-fit whitespace-nowrap" />
                            <Button label="엑셀 다운로드" severity="success" class="min-w-fit whitespace-nowrap" outlined />
                        </div>
                    </div>
                </div>
                <DataTable v-model:selection="selectedProducts" :value="products" dataKey="id" tableStyle="min-width: 50rem" showGridlines scrollable scrollHeight="400px">
                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                    <Column field="prod_code" header="제품코드"></Column>
                    <Column field="prod_name" header="제품명"></Column>
                    <Column field="edate" header="유통기한"></Column>
                    <Column field="regdate" header="등록일자"></Column>
                    <Column field="is_used" header="상태"></Column>
                </DataTable>
            </div>

            <!-- 하위자재 구성 테이블 -->
            <div class="card">
                <div class="grid grid-cols-1 gap-4 mb-4">
                    <div class="flex justify-between">
                        <div>
                            <div class="font-semibold text-2xl">하위자재 구성 영역</div>
                        </div>
                        <div class="flex items-center gap-2 flex-nowrap">
                            <Button label="하위 자재 추가" severity="success" class="min-w-fit whitespace-nowrap" />
                            <Button label="삭제" severity="danger" class="min-w-fit whitespace-nowrap" />
                        </div>
                    </div>
                </div>
                <DataTable v-model:selection="selectedProducts" :value="mats" dataKey="id" tableStyle="min-width: 50rem" showGridlines scrollable scrollHeight="400px">
                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                    <Column field="mat_code" header="자재코드"></Column>
                    <Column field="mat_name" header="자재명"></Column>
                    <Column field="mat_type" header="자재유형"></Column>
                    <Column field="req_qtt" header="소요수량"></Column>
                    <Column field="unit" header="단위"></Column>
                    <Column field="loss_rate" header="로스율"></Column>
                </DataTable>
            </div>
        </div>

        <!-- 우측: 제품 등록 영역 (45%) -->
        <div class="card space-y-6 p-6" style="width: 45%">
            <!-- 버튼 영역역 -->
            <div class="grid grid-cols-1 gap-4 mb-4">
                <div class="flex justify-between">
                    <div>
                        <div class="font-semibold text-2xl">기준정보</div>
                    </div>
                    <div class="flex items-center gap-2 flex-nowrap">
                        <Button label="수정" severity="info" class="min-w-fit whitespace-nowrap" outlined />
                        <Button label="등록" severity="success" class="min-w-fit whitespace-nowrap" outlined />
                    </div>
                </div>
            </div>
            <!-- 제품코드 / 제품명 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="font-semibold text-xl block mb-2">제품코드</label>
                    <InputText type="text" placeholder="제품코드" :disabled="true" class="w-full" />
                </div>
                <div>
                    <label class="font-semibold text-xl block mb-2">제품명</label>
                    <InputText type="text" class="w-full" />
                </div>
            </div>

            <!-- 규격 / 사용여부 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="font-semibold text-xl block mb-2">규격</label>
                    <InputText type="text" class="w-full" />
                </div>
                <div>
                    <label class="font-semibold text-xl block mb-2">사용여부</label>
                    <Dropdown v-model="search.is_used" :options="orderStatusOptions" optionLabel="label" optionValue="value" placeholder="" class="w-full" />
                </div>
            </div>

            <!-- 유통기한 / 등록일자 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="font-semibold text-xl block mb-2">유통기한</label>
                    <InputText type="text" class="w-full" />
                </div>
                <div>
                    <label class="font-semibold text-xl block mb-2">등록일자</label>
                    <InputText type="text" placeholder="자동으로 입력" :disabled="true" class="w-full" />
                </div>
            </div>

            <!-- 비고 -->
            <div>
                <label class="font-semibold text-xl block mb-2">비고</label>
                <Textarea placeholder="특이사항 입력" :autoResize="true" rows="5" class="w-full" />
            </div>
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
