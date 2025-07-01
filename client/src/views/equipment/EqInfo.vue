<template>
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">설비코드</label>
                <InputText v-model="search.eq_code" class="flex-1" placeholder="설비코드 입력" />
            </div>

            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">설비명</label>
                <InputText v-model="search.eq_name" class="flex-1" placeholder="설비명 입력" />
            </div>

            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">제조사</label>
                <InputText v-model="search.eq_maker" class="flex-1" placeholder="제조사명 입력" />
            </div>

            <div class="flex items-center gap-3 w-full">
                <label class="font-semibold w-24">사용여부</label>
                <div class="flex gap-4">
                    <div class="flex items-center">
                        <RadioButton v-model="search.is_used" inputId="all" value="" />
                        <label for="all" class="ml-2">전체</label>
                    </div>
                    <div class="flex items-center">
                        <RadioButton v-model="search.is_used" inputId="used" value="f2" />
                        <label for="used" class="ml-2">사용중</label>
                    </div>
                    <div class="flex items-center">
                        <RadioButton v-model="search.is_used" inputId="unused" value="f1" />
                        <label for="unused" class="ml-2">미사용</label>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex justify-center gap-3 mt-4">
            <Button label="초기화" severity="contrast" @click="resetSearch" />
            <Button label="조회" severity="info" @click="fetchEquipment" />
        </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-6 mt-6">
        <div class="space-y-6" style="width: 55%">
            <EqWDETable style="margin-bottom:0px; height : 100%" ref="eqTableRef" :data="eqs" :dataKey="'eq_code'"
                :columns="tableColumns" :mapper="eqMapper" title="설비 목록" @selection-change="onSelectionChange"
                @delete="handleDelete" />
        </div>

        <EqInputForm :selectedData="selectedEquipment" @data-updated="onDataUpdated" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import InputText from 'primevue/inputtext';
import RadioButton from 'primevue/radiobutton';
import Button from 'primevue/button';
import EqInputForm from '@/views/equipment/components/EqInputForm.vue';
import EqWDETable from './components/EqWDETable.vue';
import eqMapper from '@/service/EquipmentMapping.js';
import axios from 'axios';

const eqTableRef = ref(null);

const search = ref({
    eq_code: '',
    eq_name: '',
    eq_maker: '',
    is_used: ''
});

const eqs = ref([]);
const tableColumns = ['eq_code', 'eq_name', 'eq_maker', 'is_used'];

const selectedEquipment = ref(null);

const StatusOptions = [
    { label: '아니요/미사용', value: 'f1' },
    { label: '예/사용', value: 'f2' },
    { label: '전체', value: '' }
];

const onSelectionChange = (selectedItems) => {
    if (selectedItems.length === 1) {
        selectedEquipment.value = selectedItems[0];
    } else {
        selectedEquipment.value = null;
    }
};

const fetchEquipment = async () => {
    try {
        const response = await axios.get('/api/eq/search', {
            params: search.value
        });
        if (response.data && response.data.success) {
            eqs.value = response.data.data || [];
        } else if (Array.isArray(response.data)) {
            eqs.value = response.data;
        } else {
            eqs.value = [];
        }
    } catch (error) {
        eqs.value = [];
    }
};

const loadAll = async () => {
    try {

        const response = await axios.get('/api/eq/all');

        if (response.data && response.data.success) {
            eqs.value = response.data.data || [];
        } else if (Array.isArray(response.data)) {
            eqs.value = response.data;
        } else {
            eqs.value = [];
        }
    } catch (error) {
        eqs.value = [];
    }
};

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

        const checkResponse = await axios.post('/api/eq/check-line-usage', {
            codes: codes
        });

        if (!checkResponse.data.canDelete) {
            alert(checkResponse.data.message);
            return;
        }

        const deleteResponse = await axios.delete('/api/eq/multiple/delete', {
            data: { codes }
        });

        if (deleteResponse.data && deleteResponse.data.success) {
            alert(`${selectedItems.length}개의 설비가 모두 삭제되었습니다.`);
            eqTableRef.value.clearSelection();
            await loadAll();
        }
    } catch (error) {
        alert('삭제 중 오류가 발생했습니다.');
    }
};

onMounted(async () => {
    await loadAll();
})

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
