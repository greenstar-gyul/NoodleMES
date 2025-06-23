<template>
    <!-- 🔍 검색바 영역 -->
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <!-- 검색 조건 영역 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <!-- 설비코드 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">점검항목코드</label>
                <InputText v-model="search.chk_type_code" class="flex-1" placeholder="점검항목코드 입력" />
            </div>

            <!-- 설비명 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">설비유형</label>
                <Dropdown v-model="search.eq_type" :options="eqTypeOptions" optionLabel="label" optionValue="value"
                    placeholder="전체" class="flex-1" />
            </div>

            <!-- 제조사 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">점검항목명</label>
                <InputText v-model="search.chk_text" class="flex-1" placeholder="점검항목명 입력" />
            </div>

            <!-- 상태 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">점검방법</label>
                <InputText v-model="search.chk_mth" class="flex-1" placeholder="점검방법 입력" />
            </div>
        </div>
        <!-- 조회/초기화 버튼 영역 -->
        <div class="flex justify-center gap-3 mt-4">
            <Button label="초기화" severity="contrast" @click="resetSearch" />
            <Button label="조회" severity="info" @click="fetchEquipment" />
        </div>
    </div>

    <!-- 📋 검색 조회 테이블 영역 -->
    <div class="flex flex-col lg:flex-row gap-6 mt-6">
        <!-- 좌측: 검색결과 구성 (50%) -->
        <div class="space-y-6" style="width: 55%">
            <!-- 검색결과 테이블 -->
            <EqSpecWDETable style="margin-bottom:0px; height:100%" ref="ectTableRef" :data="ects" :dataKey="'chk_type_code'"
                :columns="tableColumns" :mapper="eqstMapper" title="설비점검항목 목록" @selection-change="onSelectionChange"
                @delete="handleDelete" />
        </div>

        <!-- 우측: 점검항목 등록 영역 (45%) -->
                <EqSpecInputForm ref="inputFormRef" :selectedData="selectedEqichkT" @data-updated="onDataUpdated" />

    </div>

    <!-- <MultiplePopup v-model:visible="dialogVisible" :items="submats" @confirm="handleConfirm" :mapper="bomSubMapper" :dataKey="'mat_code'"></MultiplePopup> -->
    <!-- <SinglePopup v-model:visible="dialogVisible" :items="clients" @confirm="handleConfirm" :mapper="clientMapper" -->
        <!-- :dataKey="'client_code'"></SinglePopup> -->
</template>

<script setup>
import { ref, onMounted } from 'vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import axios from 'axios';
import EqSpecInputForm from './components/EqSpecInputForm.vue';
import EqSpecWDETable from './components/EqSpecWDETable.vue';
import eqstMapper from '@/service/EquipSpecTypeMapping.js';

const ectTableRef = ref(null);

// 검색조건 데이터 (v-model로 바인딩됨)
const search = ref({
    chk_type_code: '',
    eq_type: '',
    chk_text: '',
    chk_mth: ''
});

const ects = ref([]);
const tableColumns = ['chk_type_code', 'eq_type', 'chk_text', 'range_top', 'range_bot', 'unit', 'chk_mth', 'jdg_mth'];

const selectedEqichkT = ref(null);

const eqTypeOptions = [
    { label: '배합기', value: 'MIX' },
    { label: '숙성기', value: 'REM' },
    { label: '압연기', value: 'ROP' },
    { label: '절단기', value: 'CUT' },
    { label: '성형기', value: 'SHM' },
    { label: '증숙기', value: 'STM' },
    { label: '튀김기', value: 'FRY' },
    { label: '건조기', value: 'DRY' },
    { label: '냉각기', value: 'COO' },
    { label: '스프계량기', value: 'SDP' },
    { label: '충전기', value: 'FIL' },
    { label: '포장기', value: 'PCK' },
    { label: '인쇄기', value: 'INK' },
    { label: '중량 선별기', value: 'WEI' },
    { label: '박스포장기', value: 'CTN' },
    { label: '출하설비', value: 'CVY' }
];

// 선택된 ㅎ
const onSelectionChange = (selectedItems) => {
    console.log('선택 변경:', selectedItems);

    if (selectedItems.length === 1) {
        selectedEqichkT.value = selectedItems[0];
        console.log('수정 모드:', selectedItems[0]);
    } else {
        selectedEqichkT.value = null;
        console.log('등록 모드');
    }
};

// 조회 버튼 기능 (API 호출 자리)
const fetchEquipment = async () => {
    try {
        const response = await axios.get('/api/eqichk/search', {
            params: search.value
        });
        if (response.data && response.data.success) {
            ects.value = response.data.data || [];
        } else if (Array.isArray(response.data)) {
            // 서버가 배열 형태로 직접 반환하는 경우
            ects.value = response.data;
        } else {
            console.error('검색 실패:', response.data);
            ects.value = [];
        }
    } catch (error) {
        console.error('검색 API 호출 실패:', error);
        ects.value = [];
    }
};

const loadAll = async () => {
    try {

        const response = await axios.get('/api/eqichk/all');

        if (response.data && response.data.success) {
            ects.value = response.data.data || [];
        } else if (Array.isArray(response.data)) {
            // 서버가 배열 형태로 직접 반환하는 경우
            ects.value = response.data;
        } else {
            ects.value = [];
        }
    } catch (error) {
        console.error('전체 데이터 로드 실패:', error);
        ects.value = [];
    }
};
const inputFormRef = ref(null);
// 초기화 버튼 기능
const resetSearch = async () => {
    // 1. 검색 조건 초기화
    search.value = {
        chk_type_code: '',
        eq_type: '',
        chk_text: '',
        chk_mth: ''
    };

    // 2. 테이블 선택 해제
    if (ectTableRef.value) {
        ectTableRef.value.clearSelection();
    }

    // 3. InputForm에 직접 초기화 신호 보내기!
    if (inputFormRef.value) {
        inputFormRef.value.resetForm();
    }

    // 4. selectedData도 null로 설정
    selectedEqichkT.value = null;
    
    // 5. 전체 데이터 다시 로드
    await loadAll();
};

const handleDelete = async (selectedItems) => {
    const confirmDelete = confirm(`정말로 ${selectedItems.length}개의 점검항목을 삭제하시겠습니까?`);
    if (!confirmDelete) return;
    
    try {
        const codes = selectedItems.map(item => item.chk_type_code);
        
        const response = await axios.delete('/api/eqichk/multiple/delete', {
            data: { codes }
        });
        
        if (response.data && response.data.success) {
            alert(`${selectedItems.length}개의 점검항목이 모두 삭제되었습니다.`);
            await loadAll(); // 목록 새로고침
        }
    } catch (error) {
        alert('삭제 중 오류가 발생했습니다.');
    }
};

onMounted(async () => {
    await loadAll();
})

const onRowSelect = (rowData) => {
    selectedEqichkT.value = rowData;
};

const onDataUpdated = async () => {
    await loadAll();
    if (ectTableRef.value) {
        ectTableRef.value.clearSelection();
    }
    selectedEqichkT.value = null;
}

</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>
