<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import TableWDE from '@/components/form/TableWithDelExcel.vue';
import bomMapper from '@/service/BOMMapping.js';
import bomSubMapper from '@/service/BOMSubMapping.js';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import EditableTable from '@/components/form/EditableTable.vue';
import SearchText from '@/components/search-bar/SearchText.vue';
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue';
import SearchDropdown from '@/components/search-bar/SearchDropdown.vue';
import LabeledInput from '@/components/common/LabeledInput.vue';
import LabeledDropdown from '@/components/common/LabeledDropdown.vue';
import LabeledDatePicker from '@/components/common/LabeledDatePicker.vue';
import LabeledTextarea from '@/components/common/LabeledTextarea.vue';

// 검색조건 데이터 (v-model로 바인딩됨)
const search = ref({
    prod_code: '',
    prod_name: '',
    regdate_from: null,
    regdate_to: null,
    is_used: ''
});

// 팝업창 Open/Close 변수
const dialogVisible = ref(false);

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
        prod_code: 'WH003',
        prod_name: '진진라면',
        edate: '150일',
        regdate: '2025.06.01',
        is_used: '비활성'
    }
]);

const submats = ref([
    {
        mat_code: 'RM004',
        mat_name: '식용유',
        mat_type: '원자재',
        req_qtt: '50L',
        spec: '500ml',
        loss_rate: '0.5%'
    },
    {
        mat_code: 'RM005',
        mat_name: '컵용기',
        mat_type: '부자재',
        req_qtt: '1000EA',
        spec: '60g',
        loss_rate: '-'
    },
    {
        mat_code: 'RM006',
        mat_name: '포장박스',
        mat_type: '부자재',
        req_qtt: '200EA',
        spec: '450mm x 300mm x 300mm',
        loss_rate: '-'
    }
]);

</script>
<template>
    <!-- 🔍 검색바 영역 -->
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <!-- 검색 조건 영역 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <!-- 주문번호 -->
            <SearchText v-model="search.prod_code" label="제품코드">
            </SearchText>

            <!-- 주문명 -->
            <SearchText v-model="search.prod_name" label="제품명">
            </SearchText>

            <!-- 납기일 (범위) -->
            <SearchDateBetween label="등록일자" :from="search.regdate_from" :to="search.regdate_to" @update:from="search.regdate_from = $event" @update:to="search.regdate_to = $event">
            </SearchDateBetween>

            <!-- 상태 -->
            <SearchDropdown label="사용여부" v-model="search.is_used" :options="orderStatusOptions">
            </SearchDropdown>
        </div>

        <!-- 조회/초기화 버튼 영역 -->
        <div class="flex justify-center gap-3 mt-4">
            <Button label="초기화" severity="contrast" @click="resetSearch" />
            <Button label="조회" severity="info" @click="fetchOrders" />
        </div>
    </div>

    <!-- 📋 검색 조회 테이블 영역 -->
    <div class="flex flex-col lg:flex-row gap-6 mt-4">
        <!-- 좌측: 검색결과 + 하위자재 구성 (50%) -->
        <div class="space-y-4" style="width: 60%">
            <!-- 검색결과 테이블 -->
            <TableWDE :data="products" :dataKey="'prod_code'" :mapper="bomMapper" title="검색결과"/>

            <!-- 하위자재 구성 테이블 -->
            <EditableTable :fields="['mat_code', 'mat_name', 'mat_type','req_qtt','unit','loss_rate']" 
            :mapper="{ mat_code: '자재코드', mat_name: '자재명', mat_type: '자재유형', req_qtt: '소요수량',
            unit : '단위',loss_rate : '손실율' }" 
            dataKey="id"
             @update="handleUpdate" 
             title="생산계획상세" 
             scrollHeight="150px"/>
        </div>

        <!-- 우측: 제품 등록 영역 (45%) -->
            <div class="card space-y-4 p-6" style="width: 40%; height: 530px">
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
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LabeledInput v-model="prod_code" label="제품코드" placeholder="제품코드" :disabled="true" />
                    <LabeledInput v-model="prod_name" label="제품명" placeholder="제품명" />
                </div>
                <!-- 규격 / 사용여부 -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LabeledInput v-model="spec" label="규격" />
                    <LabeledDropdown v-model="search.is_used" label="사용여부" :options="orderStatusOptions" />
                </div>

                <!-- 유통기한 / 등록일자 -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LabeledInput v-model="edate" label="유통기한" />
                    <LabeledDatePicker v-model="regdate" label="등록일자" placeholder="자동으로 입력" :disabled="true" />
                </div>

                <!-- 비고 -->
                <LabeledTextarea v-model="note" label="비고" placeholder="특이사항 입력" :rows="7" :autoResize="true" />
            </div>
    </div>

    <!-- <MultiplePopup v-model:visible="dialogVisible" :items="submats" @confirm="handleConfirm" :mapper="bomSubMapper" :dataKey="'mat_code'"></MultiplePopup> -->
    <SinglePopup v-model:visible="dialogVisible" :items="submats" @confirm="handleConfirm" :mapper="bomSubMapper" :dataKey="'mat_code'"></SinglePopup>
</template>


<style scoped>

</style>
