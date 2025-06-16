<script setup>
import { ref, watch, computed, onMounted, nextTick } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputNumber from 'primevue/inputnumber';
import axios from 'axios';
import MRPMapping from '@/service/MRPMapping';
import bomSubMapping from '@/service/BOMSubMapping';

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
    prdp: { // 생산 계획 코드
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
const popupMats = ref([]);

// BOM 불러오기 버튼
const loadBom = async () => {
    if (props.prdp == null || props.prdp == '') {
        alert('생산계획을 먼저 불러오세요.');
        return;
    }

    if (confirm('BOM을 불러오시겠습니까?')) {
        const result = await axios.get(`/api/mrp/sub-mat/${props.prdp}`);
        const subMatList = await result.data.data;
        const originData = [...props.subData];

        // console.log('subMatList', subMatList, 'originData', originData)

        // 기존 자재에 BOM 자재가 있다면, 값만 변경하고 없으면 추가
        const originLen = originData.length; // 원래 크기 넘어선 값은 추가된 값이니까.. 그 값 접근 막기 위함.
        subMatList.forEach(value => {
            let hasMat = false;

            for (let i = 0; i < originLen; i++) {
                if (value.mat_code === originData[i].mat_code) {
                    originData[i] = {...value};
                    hasMat = true;
                    break;
                }
            }

            // 없는 건 추가
            if (!hasMat) {
                originData.push({...value}); 
            }
        });

        // 1단계: 빈 배열로 설정 → 모든 InputNumber 컴포넌트 내의 데이터 제거
        emit('update:subData', []);
        await nextTick();

        // 2단계: 새 데이터로 설정 → InputNumber 컴포넌트들이 새로운 값으로 다시 생성
        emit('update:subData', originData);
    }

};

// 자재 추가 버튼
const openPopup = async () => {
    if (props.prdp == null || props.prdp == '') {
        alert('생산계획을 먼저 불러오세요.');
        return;
    }
    // console.log(props.prdp);
    await loadMatList();
    dialogVisible.value = true;
};

const loadMatList = async () => {
    if (props.prdp == null || props.prdp == '') {
        alert('생산계획을 먼저 불러오세요.');
        return;
    }

    // console.log('아제발좀');
    const response = await axios.get(`/api/mrp/matlist`);
    // console.log(`response!!!!!!!!!`, response);
    popupMats.value = await response.data.data;
};

const addMat = (values) => {
    const subDatas = [...props.subData];
    // console.log(values);
    subDatas.push(...values);
    props.subData = subDatas;
    // console.log(props.subData);
    emit('update:subData', subDatas);
}

const searchMat = async (value) => {
    const matName = value ?? '';
    const response = await axios.get(`/api/mrp/search-mat`, {
        params: {
            mat_name: matName,
        }
    });
    popupMats.value = await response.data.data;
    console.log(popupMats.value);
}

onMounted(() => {
    mapper.value = MRPMapping.mrpMapping;
})

// 타입 검증과 값 존재 검증을 해서 값이 있을 때 데이터 추가..
// 문제 있으면 바로 빈배열..
watch(
    () => props.subData,
    (newVal) => {
        if (props.columns.length > 0) return; // columns가 있을 경우 watch 종료하고 존재하는 컬럼 사용..

        if (Array.isArray(newVal) && newVal.length > 0) {
            itemsWAD.value = Object.keys(newVal[0]);
        }
        else {
            itemsWAD.value = [];
        }
    },
    { immediate: true }
);

// 컬럼이 바뀌면 해당 컬럼 목록으로 바꾸기..?
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
<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>
<template>
    <!-- 📋 검색 조회 테이블 영역 -->
    <div class="card mt-6">
        <!-- 테이블 상단 (타이틀 + 엑셀 다운로드 버튼) -->
        <div class="grid grid-cols-1 gap-4 mb-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">{{ title }}</div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button label="BOM 불러오기" severity="info" class="min-w-fit whitespace-nowrap" v-on:click="loadBom" />
                    <Button label="자재 추가" severity="success" class="min-w-fit whitespace-nowrap"
                        v-on:click="openPopup" />
                    <Button label="삭제" severity="danger" class="min-w-fit whitespace-nowrap" />
                </div>
            </div>
        </div>

        <!-- DataTable (PrimeVue) -->
        <DataTable v-model:selection="selectedWAD" :value="subData" :dataKey="dataKey" showGridlines scrollable
            scrollHeight="400px" tableStyle="min-width: 50rem">
            <Column selectionMode="multiple" headerStyle="width: 3rem" />

            <!-- <Column v-for="item in itemsWAD" :key="item" :field="item" :header="mapper[item] ?? item" /> -->
            <Column field="mat_name" header="제품유형">
              <template #body="slotProps">
                  {{ slotProps.data.mat_name }}
              </template>
            </Column>
            
            <Column field="req_qtt" header="필요수량" style="width: 230px">
                <template #body="slotProps">
                    <InputNumber v-model="slotProps.data.req_qtt" :min="0" showButtons Style="width: 100%" />
                </template>
            </Column>
            
            <Column field="unit" header="단위">
              <template #body="slotProps">
                  {{ slotProps.data.unit }}
              </template>
            </Column>

            <Column field="cur_qtt" header="현재재고">
              <template #body="slotProps">
                  {{ slotProps.data.cur_qtt }}
              </template>
            </Column>

            <Column field="stock_unit" header="단위">
              <template #body="slotProps">
                  {{ slotProps.data.stock_unit }}
              </template>
            </Column>
        </DataTable>
    </div>

    <MultiplePopup v-model:visible="dialogVisible" :items="popupMats"
        :selectedHeader="['mat_code', 'mat_name', 'mat_type', 'unit', 'note']"
        :mapper="{ 'mat_code': '자재코드', 'mat_name': '자재명', 'mat_type': '자재유형', 'unit': '단위', 'note': '비고' }" @confirm="addMat"
        :dataKey="'mat_code'" @search="searchMat"></MultiplePopup>
</template>