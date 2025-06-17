<script setup>
import { onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useMprStore } from '@/stores/mprStore';

import axios from 'axios';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import mprMapping from '@/service/MprMapping.js';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';
import TableList from '@/components/form/TableWithExcel.vue';

// pinia
const mprStore = useMprStore();

// 상태는 반응형으로 가져오기
const { mprRows, selectedMpr } = storeToRefs(mprStore);
// 순서대로 목록데이터 저장, 초기화, 선택목록 저장
const { setMprRows, resetMprRows, setSelectedMpr } = mprStore;


/* ===== DATA ===== */
// 자재 팝업
const matPopupVisible = ref(false);

// 테이블 행
const currentMatRow = ref(null);

// 전체 자재 리스트
const matList = ref([]);

// 자재 팝업 열기
const openMatPopup = (row) => {
    currentMatRow.value = row;
    matPopupVisible.value = true;
};

// 팝업에서 자재 선택 시 현재 행에 값 반영
const handleMatConfirm = (selectedMat) => {
    console.log('선택된 자재:', selectedMat);
    if (currentMatRow.value) {
        // 선택된 자재의 기본 정보를 알맞은 행에 기록
        currentMatRow.value.mat_code = selectedMat.mat_code; // 자재코드
        currentMatRow.value.mat_name = selectedMat.mat_name; // 자재명
        currentMatRow.value.unit = selectedMat.unit; // 단위
        currentMatRow.value.client_name = selectedMat.client_name; // 공급업체

        // 직접 입력해야하는 값 초기화
        currentMatRow.value.req_qtt = 0; // 요청수량
        currentMatRow.value.note = ''; // 비고
    }
};

// 행 추가
const addRow = () => {
    const newRow = {
        chk_id: `temp-${Date.now()}`,
        mat_code: '',
        mat_name: '',
        req_qtt: 0,
        unit: '',
        client_name: '',
        note: '',
    };

    // 안전하게 배열인지 확인 후 할당
    if (!Array.isArray(mprRows.value)) {
        mprRows.value = [];
    }

    mprRows.value = [...mprRows.value, newRow];
};

// 선택 삭제
const deleteSelected = () => {
    // 선택된 제품이 없을 경우 함수를 종료
    if (!selectedMpr.value || selectedMpr.value.length === 0) {
        return;
    }

    // 선택되지 않은 행만 필터링 (key: chk_id)
    // mprRows 배열에서 selectedMpr.value에 포함되지 않은 항목만 남김
    const selRows = mprRows.value.filter(item => {
        return !selectedMpr.value.some(sel => sel.chk_id === item.chk_id);
    });

    // mprRows 배열 초기화 (기존 행들 모두 제거)
    while (mprRows.value.length > 0) {
        mprRows.value.pop(); // 배열의 마지막 요소부터 하나씩 제거
    }

    // 선택되지 않은 행만 다시 push해서 화면에 반영
    mprRows.value.push(...selRows); // 선택되지 않은 행들만 남겨서 다시 배열에 추가

    // 선택 해제
    setSelectedMpr([]);
};

//전체 자재 목록 불러오기
onMounted(async () => {
  try {
    // 제품 목록
    const mprRes = await axios.get('/api/mpr/mat'); // 제품 전체 목록 불러오기
    matList.value = mprRes.data.data; // 전체 제품 목록 저장
    } catch (err) {
        console.error('요청자재 리스트 불러오기 실패:', err);
    }
});

</script>

<template>
  <div class="space-y-4 mt-7">
    <div class="card flex flex-col gap-4">
        <!-- 헤더 -->
        <div class="flex justify-between">
            <div>
                <div class="font-semibold text-2xl">요청자재</div>
            </div>
            <div class="flex justify-end gap-2">
                <Button label="선택 삭제" icon="pi pi-trash" severity="danger" @click="deleteSelected" />
                <Button label="행 추가" icon="pi pi-plus" @click="addRow" />
            </div>
        </div>

        <!-- 제품 테이블 -->
        <DataTable v-model:selection="selectedMpr" :value="mprRows" showGridlines scrollable scrollHeight="450px" dataKey="chk_id" class="w-full fixed-table">
            <Column selectionMode="multiple" headerStyle="width: 3rem" />

            <Column field="mat_code" header="자재코드" style="width: 150px" bodyStyle="width: 150px">
                <template #body="slotMats">
                    <div class="flex gap-2">
                        <InputText v-model="slotMats.data.mat_code" style="width: 100%" readonly />
                        <Button icon="pi pi-search" style="width: 32px; min-width: 32px;" @click="() => openMatPopup(slotMats.data)" />
                    </div>
                </template>
            </Column>

            <Column field="mat_name" header="자재명" style="width: 120px" bodyStyle="width: 120px">
                <template #body="slotMats">
                    <InputText v-model="slotMats.data.mat_name" style="width: 100%" readonly />
                </template>
            </Column>    
            
            <Column field="req_qtt" header="요청수량" style="width: 130px" bodyStyle="width: 130px">
                <template #body="slotMats">
                    <InputNumber v-model="slotMats.data.req_qtt"   :min="0" showButtons  :inputStyle="{ width: '100%' }" />
                    <!-- <Select v-model="slotMats.data.spec" :options="specOptions" optionLabel="label" optionValue="value" placeholder="규격"  style="width: 100%"/> -->
                </template>
            </Column>

            <Column field="unit" header="단위" style="width: 100px" bodyStyle="width: 100px">
                <template #body="slotMats">
                    <InputText v-model="slotMats.data.unit" style="width: 100%" readonly />
                    <!-- <Select v-model="slotMats.data.unit" :options="unitOptions" optionLabel="label" optionValue="value" placeholder="단위"  style="width: 100%"/> -->
                </template>
            </Column>            

            <Column field="client_name" header="공급업체" style="width: 60px" bodyStyle="width: 100px">
                <template #body="slotMats">
                    <InputText v-model="slotMats.data.client_name" style="width: 100%" readonly />
                </template>
            </Column>

            <Column field="note" header="비고" style="width: 150px" bodyStyle="width: 150px">
                <template #body="slotMats">
                    <InputText v-model="slotMats.data.note" :inputStyle="{ width: '100%' }"/>
                </template>
            </Column>
        </DataTable>
    </div>
  </div>

  <!-- ===== 자재 팝업 ===== -->
  <SinglePopup
      v-model:visible="matPopupVisible"
      :selectedHeader = "['mat_code', 'mat_name','save_inven', 'unit', 'client_name', 'material_type_code']"
      :items="matList"
      @confirm="handleMatConfirm"
      :mapper="mprMapping.MatMapper"
      :dataKey="'mat_code'"
  />
</template>