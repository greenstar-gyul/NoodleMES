<template>
    <!-- Search-bar에 있는 컴포넌트 활용하기. 참고자료) 기준정보-BOM -->
    <!-- 🔍 검색바 영역 -->
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <!-- 검색 조건 영역 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <!-- 주문번호 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">품질기준코드</label>
                <InputText v-model="search.qcr_code" class="flex-1" />
            </div>

            <!-- 주문명 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">공정코드</label>
                <InputText v-model="search.po_code" class="flex-1" />
            </div>

            <!-- 검사항목명 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">검사항목</label>
                <InputText v-model="search.inspection_item" class="flex-1" />
            </div>

            <!-- 판정방식 / 라디오버튼 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">판정방식</label>
                <Dropdown v-model="search.check_method" :options="orderStatusOptions" optionLabel="label" optionValue="value" placeholder="" class="flex-1" />
            </div>
        </div>

        <!-- 조회/초기화 버튼 영역 -->
        <div class="flex justify-center gap-3 mt-4">
            <Button label="초기화" severity="contrast" @click="resetSearch" />
            <Button label="조회" severity="info" @click="fetchOrders" />
        </div>
    </div>

    📋 검색 조회 테이블 영역
    <div class="flex flex-col lg:flex-row gap-6 mt-6">
        <!-- 좌측: 검색결과 + 하위자재 구성 (50%) -->
        <div class="space-y-6" style="width: 65%">
            <!-- title 속성 추가해서 제목 추가 -->
            <!-- 검색결과 테이블 -->

            <TableWDE :data="qualitys" :dataKey="'qcr_code'" :mapper="QualityMapping"/>


            <!-- 하위자재 구성 테이블
            <TableWAD :data="mats" :dataKey="'mat_code'" :mapper="bomSubMapper" @open-popup="openPopup()"></TableWAD> -->
        </div>

        <!-- 우측: 품질 등록 영역 (45%) -->
        <QualityInputForm />
    </div>

    <!-- <MultiplePopup v-model:visible="dialogVisible" :items="submats" @confirm="handleConfirm" :mapper="bomSubMapper" :dataKey="'mat_code'"></MultiplePopup> -->
    <SinglePopup v-model:visible="dialogVisible" :items="submats" @confirm="handleConfirm" :mapper="bomSubMapper" :dataKey="'mat_code'"></SinglePopup>
</template>

<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import QualityInputForm from '@/views/quality/QualityInputForm.vue';
import TableWDE from '@/components/form/TableWithDelExcel.vue';
import QualityMapping from '@/service/QualityMapping';
import MultiplePopup from '@/components/popup/MultiplePopup.vue';
import SinglePopup from '@/components/popup/SinglePopup.vue';


// 검색조건 데이터 (v-model로 바인딩됨)
const search = ref({
    qcr_code: '',
    po_code: '',
    inspection_item: null,
    check_method: ''
});

// 팝업창 Open/Close 변수
const dialogVisible = ref(false);

// 변수 이름 명확히 하면 좋을듯..
// 주문상태 옵션 (예시 데이터)
const orderStatusOptions = [
    { label: '수동', value: 'a1' },
    { label: '자동', value: 'a2' }
];

// 조회 버튼 기능 (API 호출 자리)
const fetchOrders = () => {
    console.log('조회 실행:', search.value);
    // TODO: 실제 API 호출로 데이터 갱신
};

// 초기화 버튼 기능
const resetSearch = () => {
    search.value = {
        qcr_code: '',
        prod_name: '',
        inspection_item: null,
        check_method: ''
    };
};

// 테이블에 보여줄 목록 데이터 (예시 데이터)
const qualitys = ref([
    {
        qcr_code: '품질기준코드',
        po_code: '공정코드',
        inspection_item: '검사항목',
        check_method: '수동'
    },
    {
        qcr_code: '품질기준코드',
        po_code: '공정코드',
        inspection_item: '검사항목',
        check_method: '수동'
    },
    {
        qcr_code: '품질기준코드',
        po_code: '공정코드',
        inspection_item: '검사항목',
        check_method: '수동'
    },
        {
        qcr_code: '품질기준코드',
        po_code: '공정코드',
        inspection_item: '검사항목',
        check_method: '수동'
    },
        {
        qcr_code: '품질기준코드',
        po_code: '공정코드',
        inspection_item: '검사항목',
        check_method: '수동'
    },
        {
        qcr_code: '품질기준코드',
        po_code: '공정코드',
        inspection_item: '검사항목',
        check_method: '수동'
    },
        {
        qcr_code: '품질기준코드',
        po_code: '공정코드',
        inspection_item: '검사항목',
        check_method: '수동'
    },
        {
        qcr_code: '품질기준코드',
        po_code: '공정코드',
        inspection_item: '검사항목',
        check_method: '수동'
    },
]);


const openPopup = () => {
    dialogVisible.value = true;
}

</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>
