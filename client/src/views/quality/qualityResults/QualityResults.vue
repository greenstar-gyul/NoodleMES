<script setup>
/* ===== IMPORT ===== */
import { ref } from 'vue';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import QualityMapping from '../../../service/QualityMapping';
import qio from '../../../service/QualityInspectionOrder';
import qir from '../../../service/QualityResults';
import TableWithExcel from '../../../components/form/TableWithExcel.vue';
import TableWithDelExcel from '../../../components/form/TableWithDelExcel.vue';
import LabeledInput from '@/components/registration-bar/LabeledInput.vue';
import LabeledReadonlyInput from '@/components/registration-bar/LabeledReadonlyInput.vue';
import LabeledTextarea from '@/components/registration-bar/LabeledTextarea.vue';
import LabeledSelect from '@/components/registration-bar/LabeledSelect.vue';
import EqIITable from '../../equipment/components/EqIITable.vue';

/* ===== DATA ===== */
// 팝업
const  qioVisible = ref(false);
const  qirVisible = ref(false);
const ordersRef = ref(qio);
const resultsQir = ref(qir);

// 기본정보 폼 데이터
const qio_code = ref('');
const prod_code = ref('');
const po_code = ref('');
const selectedInsp = ref(null);
const selectedManager = ref(null);

// 🚀 수정 불가 상태 변수
const isReadonly = ref(false);

// 지시자 옵션 예시
const InspOptions = ref([
    { label: '김길동', value: 'Insp1' },
    { label: '이길동', value: 'Insp2' },
    { label: '박길동', value: 'Insp3' }
]);

// 공정명 옵션 예시
const PoOptions = ref([
    { label: '김철수', value: 'manager1' },
    { label: '이영희', value: 'manager2' },
    { label: '박민수', value: 'manager3' }
]);

/* ===== FUNCTIONS ===== */
// 팝업 Confirm 핸들러
const handleConfirm = (qio) => {
    console.log('선택된 주문:', qio);

    qio_code.value = qio.qio_code;
    prod_code.value = qio.prod_code;
    ord_date.value = qio.ord_date;

    // 거래처 처리
    const clientOption = InspOptions.value.find(option => option.label === qio.client);
    if (!clientOption && qio.client) {
        InspOptions.value.push({
            label: qio.client,
            value: qio.client
        });
    }
    selectedInsp.value = qio.client;

    // 거래처 담당자 처리
    if (qio.manager) {
        const managerOption = managerOptions.value.find(option => option.label === qio.manager);
        if (!managerOption) {
            managerOptions.value.push({
                label: qio.manager,
                value: qio.manager
            });
        }
        selectedManager.value = qio.manager;
    } else {
        selectedManager.value = null;
    }

    po_code.value = qio.po_code || '';

    // 🚀 기본정보 수정 불가 처리
    isReadonly.value = true;
};

// EditableTable 업데이트 핸들러
const handleUpdate = (updatedData) => {
    console.log('EditableTable 업데이트:', updatedData);
};

// 테이블에 보여줄 목록 데이터 (예시 데이터)
const qualitys = ref([
    {
        qcr_code: '품질기준코드1',
        po_code: '공정코드',
        inspection_item: '검사항목',
        check_method: '수동'
    },
    {
        qcr_code: '품질기준코드2',
        po_code: '공정코드',
        inspection_item: '검사항목',
        check_method: '수동'
    },
    {
        qcr_code: '품질기준코드3',
        po_code: '공정코드',
        inspection_item: '검사항목',
        check_method: '수동'
    },
        {
        qcr_code: '품질기준코드4',
        po_code: '공정코드',
        inspection_item: '검사항목',
        check_method: '수동'
    },
        {
        qcr_code: '품질기준코드5',
        po_code: '공정코드',
        inspection_item: '검사항목',
        check_method: '수동'
    },
        {
        qcr_code: '품질기준코드6',
        po_code: '공정코드',
        inspection_item: '검사항목',
        check_method: '수동'
    },
        {
        qcr_code: '품질기준코드7',
        po_code: '공정코드',
        inspection_item: '검사항목',
        check_method: '수동'
    },
        {
        qcr_code: '품질기준코드8',
        po_code: '공정코드',
        inspection_item: '검사항목',
        check_method: '수동'
    },
]);

</script>

<template>
    <!-- ===== 기본정보 영역 ===== -->
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <!-- 헤더 영역 -->
        <div class="grid grid-cols-1 gap-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">기본정보</div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button label="삭제" severity="danger" class="min-w-fit" />
                    <Button label="초기화" severity="contrast" class="min-w-fit" />
                    <Button label="저장" severity="info" class="min-w-fit" />
                    <Button
                        label="검사지시서 불러오기"
                        severity="success"
                        class="min-w-fit whitespace-nowrap"
                        @click=" qioVisible = true"
                    />
                </div>
            </div>
        </div>

        <!-- 입력 폼 영역 1 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="지시코드" v-model="qio_code" :readonly="isReadonly" />    
            <LabeledInput label="제품명" :value="prod_code" placeholder="제품명" :disabled="true" />
        </div>

        <!-- 입력 폼 영역 2 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 공정코드po_code -->
            <LabeledSelect
                label="공정명"
                v-model="selectedInsp"
                :options="PoOptions"
                placeholder="공정명을 선택해주세요"
                :disabled="isReadonly"
            />
        </div>
    </div>
<!-- ===== 결과정보 영역 ===== -->
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <!-- 헤더 영역 -->
        <div class="grid grid-cols-1 gap-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">결과정보</div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button
                        label="검사결과 불러오기"
                        severity="success"
                        class="min-w-fit whitespace-nowrap"
                        @click="qirVisible = true"
                    />
                </div>
            </div>
        </div>

        <!-- 입력 폼 영역 1 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="공정명" v-model="qio_code" :readonly="isReadonly" />    
            <LabeledInput label="검사자" :value="prod_code" placeholder="제품명" :disabled="true" />
        </div>

        <!-- 입력 폼 영역 2 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 공정코드po_code -->
            <LabeledSelect
                label="시작일시"
                v-model="selectedInsp"
                :options="InspOptions"
                placeholder="공정명을 선택해주세요"
                :disabled="isReadonly"
            />
            <LabeledSelect
                label="종료일시"
                v-model="selectedInsp"
                :options="InspOptions"
                placeholder="지시자를 선택해주세요"
                :disabled="isReadonly"
            />
        </div>
        <!-- 입력 폼 영역 3 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="불량수량" v-model="qio_code" :readonly="isReadonly" />    
            <LabeledInput label="비고" :value="prod_code" placeholder="제품명" :disabled="true" />
        </div>

    </div>
    <!-- 📋 검색 조회 테이블 영역 -->
  <div class="flex flex-col lg:flex-row gap-6 mt-6">
    <!-- 좌측: 검색결과 + 하위자재 구성 (50%) -->
    <div class="space-y-6" style="width: 100%">
      <!-- 검색결과 테이블 -->
      <EqIITable style="margin-bottom:0px; height:730px" :data="products" :dataKey="'eqii_code'" :mapper="QualityMapping" />
    </div>
  </div>

  
    <!-- ===== 팝업 영역 ===== -->
    <SinglePopup
        v-model:visible=" qioVisible"
        :items="ordersRef"
        @confirm="handleConfirm"
        :mapper="QualityMapping"
    />
    <SinglePopup
        v-model:visible=" qirVisible"
        :items="resultsQir"
        @confirm="handleConfirm"
        :mapper="QualityMapping"
    />
</template>
