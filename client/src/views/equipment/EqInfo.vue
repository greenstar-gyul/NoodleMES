<template>
    <!-- 🔍 검색바 영역 -->
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <!-- 검색 조건 영역 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <!-- 설비코드 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">설비코드</label>
                <InputText v-model="search.eq_code" class="flex-1" placeholder="설비코드 입력" />
            </div>

            <!-- 설비명 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">설비명</label>
                <InputText v-model="search.eq_name" class="flex-1" placeholder="설비명 입력" />
            </div>

            <!-- 제조사 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">제조사</label>
                <InputText v-model="search.eq_maker" class="flex-1" placeholder="제조사명 입력" />
            </div>

            <!-- 상태 -->
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">사용여부</label>
                <Dropdown v-model="search.is_used" :options="StatusOptions" optionLabel="label" optionValue="value"
                    placeholder="전체" class="flex-1" />
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
        <!-- 좌측: 검색결과 + 하위자재 구성 (50%) -->
        <div class="space-y-6" style="width: 55%">
            <!-- 검색결과 테이블 -->
            <EqWDETable style="margin-bottom:0px; height : 100%" ref="eqTableRef" :data="eqs" :dataKey="'eq_code'"
                :columns="tableColumns" :mapper="eqMapper" title="설비 목록" @selection-change="onSelectionChange"
                @delete="handleDelete" />
        </div>

        <!-- 우측: 설비 등록 영역 (45%) -->
        <EqInputForm :selectedData="selectedEquipment" @data-updated="onDataUpdated" />
    </div>

    <!-- <MultiplePopup v-model:visible="dialogVisible" :items="submats" @confirm="handleConfirm" :mapper="bomSubMapper" :dataKey="'mat_code'"></MultiplePopup> -->
    <!-- <SinglePopup v-model:visible="dialogVisible" :items="clients" @confirm="handleConfirm" :mapper="clientMapper"
        :dataKey="'client_code'"></SinglePopup> -->
</template>

<script setup>
import { ref, onMounted } from 'vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import EqInputForm from '@/views/equipment/components/EqInputForm.vue';
import EqWDETable from './components/EqWDETable.vue';
import eqMapper from '@/service/EquipmentMapping.js';
import axios from 'axios';

const eqTableRef = ref(null);

// 검색조건 데이터 (v-model로 바인딩됨)
const search = ref({
    eq_code: '',
    eq_name: '',
    eq_maker: '',
    is_used: ''
});

const openPopup = () => {
    dialogVisible.value = true;
}

const eqs = ref([]);
const tableColumns = ['eq_code', 'eq_name', 'eq_maker', 'is_used'];

// 팝업
const dialogVisible = ref(false);
const selectedEquipment = ref(null);

// 주문상태 옵션 (예시 데이터)
const StatusOptions = [
    { label: '아니요/미사용', value: 'f1' },
    { label: '예/사용', value: 'f2' },
    { label: '전체', value: '' }
];

// 선택된 ㅎ
const onSelectionChange = (selectedItems) => {
    console.log('선택 변경:', selectedItems);

    if (selectedItems.length === 1) {
        selectedEquipment.value = selectedItems[0];
        console.log('수정 모드:', selectedItems[0]);
    } else {
        selectedEquipment.value = null;
        console.log('등록 모드');
    }
};

// 조회 버튼 기능 (API 호출 자리)
const fetchEquipment = async () => {
    try {
        const response = await axios.get('/api/eq/search', {
            params: search.value
        });
        if (response.data && response.data.success) {
            eqs.value = response.data.data || [];
        } else if (Array.isArray(response.data)) {
            // 서버가 배열 형태로 직접 반환하는 경우
            eqs.value = response.data;
        } else {
            console.error('검색 실패:', response.data);
            eqs.value = [];
        }
    } catch (error) {
        console.error('검색 API 호출 실패:', error);
        eqs.value = [];
    }
};

const loadAll = async () => {
    try {

        const response = await axios.get('/api/eq/all');

        if (response.data && response.data.success) {
            eqs.value = response.data.data || [];
        } else if (Array.isArray(response.data)) {
            // 서버가 배열 형태로 직접 반환하는 경우
            eqs.value = response.data;
        } else {
            eqs.value = [];
        }
    } catch (error) {
        console.error('전체 데이터 로드 실패:', error);
        eqs.value = [];
    }
};

// 초기화 버튼 기능
const resetSearch = async (selectedItems) => {
    search.value = {
        eq_code: '',
        eq_name: '',
        eq_maker: '',
        is_used: ''
    };

    if (eqTableRef.value) {
        eqTableRef.value.clearSelection();
    }

    selectedEquipment.value = null;
    await loadAll();
};

const handleDelete = async (selectedItems) => {
    const confirmDelete = confirm(`정말로 ${selectedItems.length}개의 설비를 삭제하시겠습니까?`);
    if (!confirmDelete) return;
    
    try {
        const codes = selectedItems.map(item => item.eq_code);
        
        // 한 번의 API 호출로 끝! 🎉
        const response = await axios.delete('/api/eq/multiple/delete', {
            data: { codes }
        });
        
        if (response.data && response.data.success) {
            alert(`${selectedItems.length}개의 설비가 모두 삭제되었습니다.`);
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
    selectedEquipment.value = rowData;
};

const onDataUpdated = async () => {
    await loadAll();
    if (eqTableRef.value) {
        eqTableRef.value.clearSelection();
    }
    selectedEquipment.value = null;
}

</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>
