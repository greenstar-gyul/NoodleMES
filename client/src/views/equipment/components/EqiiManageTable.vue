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

// 🌟 설비 점검 결과 불러오기
const loadEqir = async () => {
    console.log('props.eqii', props.eqii);
    if (props.eqii == null || props.eqii == '') {
        alert('생산계획을 먼저 불러오세요.');
        return;
    }

    if (confirm('eqir 데이터를 새로 불러오시겠습니까?')) {
        console.log('eqir 불러오기 시작');
        const result = await axios.get(`/api/eq/eqirall/${props.eqii}`);
        
        console.log('🚀 eqir API 원본:', result.data);
        
        const eqirList = result.data; // 배열이 바로 오는 것 같으니까
        console.log('🎯 eqirList:', eqirList);
        
        if (eqirList && eqirList.length > 0) {
            console.log('🔍 첫 번째 eqir 아이템:', eqirList[0]);
            console.log('🔍 eqir_code:', eqirList[0].eqir_code);
        }

        // 1단계: 빈 배열로 초기화
        emit('update:subData', []);
        await nextTick();

        // 2단계: 새 데이터로 설정
        emit('update:subData', eqirList);
    }
};

// 🌟 설비기준항목 불러오기 팝업
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
    console.log('🚀 설비기준항목 API 원본:', response.data);
    
    popupEqirs.value = response.data.data || response.data;
    
    console.log('📦 popupEqirs에 할당된 데이터:', popupEqirs.value);
};

// 🌟 이 함수 이름이 문제였어! (chkEqiType → addEqiType으로 변경)
const addEqiType = (values) => {
    const subDatas = [...props.subData];
    console.log('선택된 설비기준항목:', values);
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
            !selectedWAD.value.some(selected => selected.eqir_code === item.eqir_code)
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
                    <Button label="설비 점검 결과 불러오기" severity="info" class="min-w-fit whitespace-nowrap"
                        @click="loadEqir" />
                    <Button label="설비기준항목 추가" severity="success" class="min-w-fit whitespace-nowrap"
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
            dataKey="eqir_code"
            showGridlines 
            scrollable
            scrollHeight="400px" 
            tableStyle="min-width: 50rem">
            
            <Column selectionMode="multiple" headerStyle="width: 3rem" />

            <Column field="eqir_code" header="항목코드">
                <template #body="slotProps">
                    {{ slotProps.data.eqir_code }}
                </template>
            </Column>

            <Column field="eq_name" header="설비명" style="width: 200px">
                <template #body="slotProps">
                    {{ slotProps.data.eq_name }}
                </template>
            </Column>

            <Column field="chk_start_date" header="점검시작일">
                <template #body="slotProps">
                    {{ slotProps.data.chk_start_date }}
                </template>
            </Column>

            <Column field="chk_end_date" header="점검종료일">
                <template #body="slotProps">
                    {{ slotProps.data.chk_end_date }}
                </template>
            </Column>

            <Column field="chk_detail" header="점검내용">
                <template #body="slotProps">
                    {{ slotProps.data.chk_detail }}
                </template>
            </Column>

            <Column field="note" header="비고">
                <template #body="slotProps">
                    {{ slotProps.data.note }}
                </template>
            </Column>

            <Column field="chk_result" header="점검결과">
                <template #body="slotProps">
                    {{ slotProps.data.chk_result }}
                </template>
            </Column>

            <Column field="eqi_stat" header="상태">
                <template #body="slotProps">
                    {{ slotProps.data.eqi_stat }}
                </template>
            </Column>
        </DataTable>
    </div>
    <MultiplePopup 
        v-model:visible="dialogVisible" 
        :items="popupEqirs" 
        @confirm="addEqiType"
        :selectedHeader="['eqir_code', 'eq_name', 'chk_start_date', 'chk_end_date', 'chk_detail', 'note', 'chk_result', 'eqi_stat']"
        :mapper="{ 
            eqir_code: '점검항목 코드', 
            eq_name: '설비명', 
            chk_start_date: '점검시작일', 
            chk_end_date: '점검종료일', 
            chk_detail: '점검내용', 
            note: '비고', 
            chk_result: '점검결과', 
            eqi_stat: '상태' 
        }"
        :dataKey="'eqir_code'">
    </MultiplePopup>
</template>