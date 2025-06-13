<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
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

    if (confirm('자재 목록이 초기화되는데.....\n계속 할거임?')) {
        const result = await axios.get(`/api/mrp/sub-mat/${props.prdp}`);
        emit('update:subData', result.data);
    }

};

// 자재 추가 버튼
const openPopup = async () => {
    if (props.prdp == null || props.prdp == '') {
        alert('생산계획을 먼저 불러오세요.');
        return;
    }
    // console.log(props.prdp);
    dialogVisible.value = true;
};

const popupMatsConfirm = async (values) => {
    // console.log(values);
    // values.forEach(element => {
    //     // console.log(element['mat_code']);
    //     matList.value.push(element['mat_code']);
    //     selMatList.value.push(mats.value.find(item => {
    //         if (element['mat_code'] == item.mat_code) {
    //             // console.log(item);
    //             return true;
    //         }
    //     }));

    //     // mats.value.push(element);
    // });

    // console.log(selMatList.value);

    // const result = await axios.get()
    // popupMats.value = 
};

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
                    <Button label="BOM 불러오기" severity="info" class="min-w-fit whitespace-nowrap"
                        v-on:click="loadBom" />
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

            <Column v-for="item in itemsWAD" :key="item" :field="item" :header="mapper[item] ?? item" />
        </DataTable>
    </div>

    <MultiplePopup v-model:visible="dialogVisible" :items="popupMats" :mapper="{}" @confirm="popupMatsConfirm" :dataKey="'mat_code'"></MultiplePopup>
</template>