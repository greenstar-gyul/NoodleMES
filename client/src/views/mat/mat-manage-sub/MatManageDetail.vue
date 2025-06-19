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
const { mprRows, matRows, selectedMpr } = storeToRefs(mprStore);
// 순서대로 목록데이터 저장, 초기화, 선택목록 저장
const { setMprRows, resetMprRows, setSelectedMpr } = mprStore;


/* ===== DATA ===== */
// 자재 팝업
const matPopupVisible = ref(false);

// 테이블 행
// const currentMatRow = ref(null);

// 전체 자재 리스트
const matList = ref([]);

// 자재 팝업 열기
const openMatPopup = (row) => {
    matRows.value = row;
    matPopupVisible.value = true;
};

// 팝업에서 자재 선택 시 현재 행에 값 반영
const handleMatConfirm = (selectedMat) => {
    console.log('선택된 자재:', selectedMat);
    if (matRows.value) {
        // 선택된 자재의 기본 정보를 알맞은 행에 기록
        matRows.value.mat_code = selectedMat.mat_code; // 자재코드
        matRows.value.mat_name = selectedMat.mat_name; // 자재명
        matRows.value.unit = selectedMat.unit; // 단위
        matRows.value.client_name = selectedMat.client_name; // 공급업체 (화면출력용)
        matRows.value.mat_sup = selectedMat.sup; // 공급업체 (DB 저장용)

        console.log('sup값 확인');
        console.log(selectedMat.sup);
        // 직접 입력해야하는 값 초기화
        matRows.value.req_qtt = 0; // 요청수량
        matRows.value.note = ''; // 비고
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
        mat_sup:'', // DB저장용
        client_name: '', // 화면출력용
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
    // console.log('전체 자재 출력')
    // console.log(matList);
    } catch (err) {
        console.error('요청자재 리스트 불러오기 실패:', err);
    }
});

</script>

<template>
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-12">
        <div class="grid grid-cols-1 gap-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl"><b>조치 결과 정보</b></div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button label="삭제" severity="danger" class="min-w-fit" @click="deletePlan" />
                    <Button label="초기화" severity="contrast" class="min-w-fit" v-on:click="emit('resetList')" />
                    <Button label="저장" severity="info" class="min-w-fit" v-on:click="saveMRP" />
                    <Button label="조치결과 불러오기" severity="success" class="min-w-fit whitespace-nowrap"
                        @click="openPopup" />
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="자재입고 코드" :model-value="currentData.eq_ma_code" :disabled="true"
                placeholder="저장 시 자동으로 생성됩니다." />
            <LabeledInput label="검사지시코드(검색)" :model-value="currentData.eq_name" :disabled="true"
                @update:model-value="updateEqName" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledTextarea label="주문수량" :model-value="currentData.fail_date" @update:model-value="updateFailDate" />
            <LabeledTextarea label="입고수량" :model-value="currentData.fail_cause" @update:model-value="updateFailCause" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledTextarea label="단위" :model-value="currentData.act_detail" @update:model-value="updateActDetail" />
            <LabeledDateTimePicker label="입고일자" :model-value="currentData.act_result" @update:model-value="updateActResult"
                :options="statusOptions" placeholder="상태를 선택하세요" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledTextarea label="공급업체" :model-value="currentData.start_date"
                @update:model-value="updateStartDate" />
            <LabeledTextarea label="담당자(로그인)" :model-value="currentData.end_date"
                @update:model-value="updateEndDate" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledDatePicker label="LOT번호" :model-value="currentData.re_chk_exp_date"
                @update:model-value="updateReChkExpDate" />
            <LabeledDatePicker label="비고" :model-value="currentData.regdate" @update:model-value="updateRegDate" />
        </div>
    </div>

    <!-- 팝업 컴포넌트 -->
    <eqirmgsinglePopup v-model:visible="eqirmgPopupVisibil" :items="eqirmgs" @confirm="loadSelectedPlan"
        :selectedHeader="['eq_ma_code', 'eq_name', 'fail_date', 'act_detail', 'act_result']" :mapper="eqiiresmgMapping"
        :visibleFields="['eq_ma_code', 'eq_name', 'fail_date', 'act_detail', 'act_result']" :dataKey="'eq_ma_code'"
        :placeholder="'조치결과 불러오기'">
    </eqirmgsinglePopup>
    <EqirSinglePopup v-model:visible="eqirPopupVisibil" :items="eqirss" @confirm="loadSelectedEqirPlan"
        :selectedHeader="['eqir_code', 'eq_name', 'chk_start_date', 'chk_end_date', 'eqi_stat']"
        :mapper="{
            eqir_code: '점검결과 코드',
            eq_name: '설비명',
            chk_start_date: '점검 시작일시',
            chk_end_date: '점검 종료일시',
            eqi_stat: '상태'
        }"
        :visibleFields="['eqir_code', 'eq_name', 'chk_start_date', 'chk_end_date', 'eqi_stat']" :dataKey="'eqir_code'"
        :placeholder="'점검결과 선택'">
    </EqirSinglePopup>
</template>