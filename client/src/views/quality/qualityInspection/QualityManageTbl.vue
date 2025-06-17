<script setup>
import { ref, watch, computed, onMounted, nextTick } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputNumber from 'primevue/inputnumber';
import axios from 'axios';
import eqiiresMapping from '@/service/EquipIIResMapping';
import bomSubMapping from '@/service/BOMSubMapping';
import MultiplePopup from '@/views/equipment/components/MultiplePopup.vue'; // 경로는 실제 경로로 수정

const props = defineProps({
    dataKey: {
        type: String,
        default: 'id'
    },
    title: {
        type: String,
        default: ''
    },
    columns: {
        type: Array,
        default: [],
    },  
    subData: {
        type: Array,
        default: [],
    },
    eqii: { // 생산 계획 코드
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:subData']);

// DataTable 선택된 행 (선택 모드)
const selectedWAD = ref([]);
const itemsWAD = ref([]);
const dialogVisible = ref(false);
const mapper = ref({});
const popupEqirs = ref([]);

// 🌟 품질 점검 결과 불러오기
const loadEqir = async () => {
    console.log('props.eqii', props.eqii);
    if (props.eqii == null || props.eqii == '') {
        alert('검사계획을 먼저 불러오세요.');
        return;
    }

    if (confirm('qio 데이터를 새로 불러오시겠습니까?')) {
        console.log('qio 불러오기 시작');
        const result = await axios.get(`/api/eq/eqirall/${props.eqii}`);
        
        console.log('🚀 qio API 원본:', result.data);
        
        const qioList = result.data; // 배열이 바로 오는 것 같으니까
        console.log('🎯 qioList:', qioList);
        
        if (qioList && qioList.length > 0) {
            console.log('🔍 첫 번째 qio 아이템:', qioList[0]);
            console.log('🔍 inspection_item:', qioList[0].inspection_item);
        }

        // 1단계: 빈 배열로 초기화
        emit('update:subData', []);
        await nextTick();

        // 2단계: 새 데이터로 설정
        emit('update:subData', qioList);
    }
};

// 🌟 품질기준항목 불러오기 팝업
const openPopup = async () => {
    if (props.eqii == null || props.eqii == '') {
        alert('생산계획을 먼저 불러오세요.');
        return;
    }
    await loadEqirList();
    dialogVisible.value = true;
};

const loadEqirList = async () => {
    if (props.eqii == null || props.eqii == '') {
        alert('생산계획을 먼저 불러오세요.');
        return;
    }

    const response = await axios.get(`/api/eq/eqitype`);
    
    // 🔍 응답 구조 확인
    console.log('🚀 품질기준항목 API 원본:', response.data);
    
    popupEqirs.value = response.data.data || response.data;
    
    console.log('📦 popupEqirs에 할당된 데이터:', popupEqirs.value);
};

// 🌟 이 함수 이름이 문제였어! (chkEqiType → addEqiType으로 변경)
const addEqiType = (values) => {
    const subDatas = [...props.subData];
    console.log('선택된 품질기준항목:', values);
    subDatas.push(...values);
    emit('update:subData', subDatas);
    dialogVisible.value = false; // 팝업 닫기 추가
}

// 🌟 선택된 행 삭제 기능 추가
const deleteSelected = () => {
    if (selectedWAD.value.length === 0) {
        alert('삭제할 항목을 선택해주세요.');
        return;
    }
    
    if (confirm('선택한 항목을 삭제하시겠습니까?')) {
        const remainingData = props.subData.filter(item => 
            !selectedWAD.value.some(selected => selected.inspection_item === item.inspection_item)
        );
        emit('update:subData', remainingData);
        selectedWAD.value = []; // 선택 초기화
    }
}

onMounted(() => {
    mapper.value = eqiiresMapping.eqiiresMapping;
})

// 기존 watch 코드들...
watch(
    () => props.subData,
    (newVal) => {
        if (props.columns.length > 0) return;

        if (Array.isArray(newVal) && newVal.length > 0) {
            itemsWAD.value = Object.keys(newVal[0]);
        }
        else {
            itemsWAD.value = [];
        }
    },
    { immediate: true }
);

watch(
    () => props.columns,
    (newVal) => {
        if (newVal.length > 0) {
            itemsWAD.value = newVal;
        }
        else if (Array.isArray(props.subData) && props.subData.length > 0) {
            itemsWAD.value = Object.keys(props.subData[0]);
        }
        else {
            itemsWAD.value = [];
        }
    },
    { immediate: true }
);
</script>

<template>
    <!-- 검색 조회 테이블 영역 -->
    <div class="card mt-6">
        <!-- 테이블 상단 (타이틀 + 버튼들) -->
        <div class="grid grid-cols-1 gap-4 mb-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">{{ title }}</div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button label="품질 점검 결과 불러오기" severity="info" class="min-w-fit whitespace-nowrap"
                        @click="loadEqir" />
                    <Button label="품질기준항목 추가" severity="success" class="min-w-fit whitespace-nowrap"
                        @click="openPopup" />
                    <Button label="삭제" severity="danger" class="min-w-fit whitespace-nowrap" 
                        @click="deleteSelected" />
                </div>
            </div>
        </div>

        <!-- DataTable (PrimeVue) -->
        <DataTable 
            v-model:selection="selectedWAD" 
            :value="subData" 
            dataKey="inspection_item"
            showGridlines 
            scrollable
            scrollHeight="400px" 
            tableStyle="min-width: 50rem">
            
            <Column selectionMode="multiple" headerStyle="width: 3rem" />

            <Column field="inspection_item" header="검사항목">
                <template #body="slotProps">
                    {{ slotProps.data.inspection_item }}
                </template>
            </Column>

            <Column field="range_top" header="기준(상한)" style="width: 200px">
                <template #body="slotProps">
                    {{ slotProps.data.range_top }}
                </template>
            </Column>

            <Column field="range_bot" header="기준(하한)">
                <template #body="slotProps">
                    {{ slotProps.data.range_bot }}
                </template>
            </Column>

            <Column field="unit" header="단위">
                <template #body="slotProps">
                    {{ slotProps.data.unit }}
                </template>
            </Column>

        </DataTable>
    </div>
    <MultiplePopup 
        v-model:visible="dialogVisible" 
        :items="popupEqirs" 
        @confirm="addEqiType"
        :selectedHeader="['inspection_item', 'range_top', 'range_bot', 'unit']"
        :mapper="{ 
            inspection_item: '검사항목', 
            range_top: '기준(상한)', 
            range_bot: '기준(하한)', 
            unit: '단위', 
        }"
        :dataKey="'inspection_item'">
    </MultiplePopup>
</template>