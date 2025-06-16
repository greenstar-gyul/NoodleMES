<script setup>
import { ref, watch, onMounted } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import axios from 'axios';
import eqiiresMapping from '@/service/EquipIIResMapping';
import EqiiSinglePopup from './EqiiSinglePopup.vue';

const props = defineProps({
    dataKey: { type: String, default: 'id' },
    title: { type: String, default: '' },
    columns: { type: Array, default: [] },
    subData: { type: Array, default: [] },
    eqii: { type: String, default: '' }
});

const emit = defineEmits(['update:subData']);

const selectedWAD = ref([]);
const itemsWAD = ref([]);
const dialogVisible = ref(false);
const dialogVisible2 = ref(false);
const popupEqits = ref([]);
const popupEq = ref([]);
const mapper = ref({});
const selectedRowData = ref(null);
const selectedRowIndex = ref(-1);

const openItemCodePopup = async (rowData) => {
    await loadEqirList();
    selectedRowData.value = rowData;
    selectedRowIndex.value = props.subData.findIndex(item => item === rowData);
    dialogVisible.value = true;
};

const openEquipmentPopup = async (rowData) => {
    selectedRowData.value = rowData;
    selectedRowIndex.value = props.subData.findIndex(item => item === rowData);
    
    const currentEqType = rowData.eq_type;
    
    if (!currentEqType) {
        alert('먼저 점검항목을 선택해서 설비유형을 정해주세요.');
        return;
    }
    
    await loadEqList();
    const filteredEq = popupEq.value.filter(eq => eq.eq_type === currentEqType);
    
    if (filteredEq.length === 0) {
        alert(`${currentEqType} 유형의 설비가 없습니다.`);
        return;
    }
    
    popupEq.value = filteredEq;
    dialogVisible2.value = true;
};

const loadEqir = async () => {
    if (!props.eqii) {
        alert('지시서를 먼저 불러오세요.');
        return;
    }
    if (!confirm('설비 점검 결과를 새로 불러올까요?')) return;
    
    try {
        const { data } = await axios.get(`/api/eq/eqirall/${props.eqii}`);
        emit('update:subData', data);
        selectedWAD.value = [];
    } catch (err) {
        console.error(err);
        alert('데이터 불러오기에 실패했습니다.');
    }
};
    
const loadEqList = async () => {
    const { data } = await axios.get(`/api/eq/all`);
    popupEq.value = data.data || data;
};
    
const loadEqirList = async () => {
    const { data } = await axios.get(`/api/eq/eqitype`);
    popupEqits.value = data.data || data;
};

const addEqiType = (selectedItem) => {
    const updatedData = [...props.subData];
    updatedData[selectedRowIndex.value] = {
        ...updatedData[selectedRowIndex.value],
        chk_type_code: selectedItem.chk_type_code,
        chk_text: selectedItem.chk_text,
        eq_type: selectedItem.eq_type,
        eq_name: '설비 선택',
        eq_code: ''
    };
    
    emit('update:subData', updatedData);
    dialogVisible.value = false;
};

const addEq = (selectedItem) => {
    const updatedData = [...props.subData];
    updatedData[selectedRowIndex.value] = {
        ...updatedData[selectedRowIndex.value],
        eq_name: selectedItem.eq_name,
        eq_type: selectedItem.eq_type,
    };

    emit('update:subData', updatedData);
    dialogVisible.value = false;
};

const addNewRow = () => {
    const newRow = {
        eqir_code: '',
        chk_type_code: '',
        chk_text: '항목 선택',
        eq_code: '',
        eq_name: '설비 선택',
        eq_type: '',
        chk_start_date: new Date,
        chk_end_date: new Date,
        chk_detail: '',
        chk_result: '',
        eqi_stat: '',
        note: '',
        eqii_code: props.eqii
    };

    emit('update:subData', [...props.subData, newRow]);
};

const deleteSelected = () => {
    if (!selectedWAD.value.length) {
        alert('삭제할 항목을 선택하세요.');
        return;
    }
    if (confirm('선택한 항목을 삭제하시겠습니까?')) {
        const remaining = props.subData.filter(
            item => !selectedWAD.value.some(sel => sel.eqir_code === item.eqir_code)
        );
        emit('update:subData', remaining);
        selectedWAD.value = [];
    }
};

onMounted(() => {
    mapper.value = eqiiresMapping.eqiiresMapping;
});

watch(
    () => props.subData,
    (newVal) => {
        if (props.columns.length > 0) return;
        itemsWAD.value = Array.isArray(newVal) && newVal.length ? Object.keys(newVal[0]) : [];
    },
    { immediate: true }
);

watch(
    () => props.columns,
    (newVal) => {
        itemsWAD.value = newVal.length ? newVal :
            (props.subData.length ? Object.keys(props.subData[0]) : []);
    },
    { immediate: true }
);
</script>

<template>
    <div class="card mt-6">
        <div class="grid grid-cols-1 gap-4 mb-4">
            <div class="flex justify-between">
                <div class="font-semibold text-2xl">{{ title }}</div>
                <div class="flex items-center gap-2">
                    <Button label="설비 점검 결과 불러오기" severity="info" @click="loadEqir" />
                    <Button label="항목 추가" severity="success" @click="addNewRow" />
                    <Button label="삭제" severity="danger" @click="deleteSelected" />
                </div>
            </div>
        </div>

        <DataTable v-model:selection="selectedWAD" :value="subData" dataKey="eqir_code" showGridlines scrollable
            scrollHeight="400px" tableStyle="min-width: 50rem">

            <Column selectionMode="multiple" headerStyle="width: 3rem" />

            <Column field="chk_text" header="항목명">
                <template #body="{ data }">
                    <span @click="openItemCodePopup(data)" class="cursor-pointer text-blue-600 hover:underline">
                        {{ data.chk_text }}
                    </span>
                </template>
            </Column>
            <Column field="eq_name" header="설비명">
                <template #body="{ data }">
                    <span @click="openEquipmentPopup(data)" class="cursor-pointer text-blue-600 hover:underline">
                        {{ data.eq_name }}
                    </span>
                </template>
            </Column>
            <Column field="eq_type" header="설비유형" />

            <Column field="chk_start_date" header="점검시작일시">
                <template #body="{ data }">
                    <LabeledDateTimePicker :model-value="new Date(data.chk_start_date)"
                        @update:model-value="data.chk_start_date = $event.toISOString()" class="w-full" />
                </template>
            </Column>

            <Column field="chk_end_date" header="점검종료일시">
                <template #body="{ data }">
                    <LabeledDateTimePicker :model-value="new Date(data.chk_end_date)"
                        @update:model-value="data.chk_end_date = $event.toISOString()" class="w-full" />
                </template>
            </Column>

            <Column field="chk_detail" header="점검내용">
                <template #body="{ data }">
                    <input v-model="data.chk_detail" class="w-full p-1 border-0" />
                </template>
            </Column>

            <Column field="chk_result" header="점검결과">
                <template #body="{ data }">
                    <input v-model="data.chk_result" class="w-full p-1 border-0" />
                </template>
            </Column>

            <Column field="eqi_stat" header="상태">
                <template #body="{ data }">
                    <select v-model="data.eqi_stat" class="w-full p-1 border-0">
                        <option value="">선택하세요</option>
                        <option value="점검중">점검중</option>
                        <option value="점검완료">점검완료</option>
                    </select>
                </template>
            </Column>

            <Column field="note" header="비고">
                <template #body="{ data }">
                    <input v-model="data.note" class="w-full p-1 border-0" />
                </template>
            </Column>
        </DataTable>
    </div>

    <EqiiSinglePopup v-model:visible="dialogVisible" :items="popupEqits" selectionMode="single" @confirm="addEqiType"
        :selectedHeader="['chk_text', 'eq_type', 'chk_mth']" :mapper="{
            chk_text: '점검항목명',
            eq_type: '설비유형',
            chk_mth: '점검방법',
        }" :dataKey="'chk_text'">
    </EqiiSinglePopup>

    <EqiiSinglePopup v-model:visible="dialogVisible2" :items="popupEq" selectionMode="single" @confirm="addEq"
        :selectedHeader="['eq_name', 'eq_type']" :mapper="{
            eq_name: '설비명',
            eq_type: '설비유형'
        }" :dataKey="'eq_code'">
    </EqiiSinglePopup>
</template>