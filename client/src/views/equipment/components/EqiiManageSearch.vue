<script setup>
import { onMounted, ref, watch } from 'vue';
import Button from 'primevue/button';
import LabeledTextarea from '../../../components/registration-bar/LabeledTextarea.vue';
import LabeledInput from '../../../components/registration-bar/LabeledInput.vue';
import axios from 'axios';
import EquipIIMapping from '../../../service/EquipIIMapping';
import EqiiSinglePopup from '@/views/equipment/components/EqiiSinglePopup.vue';
import LabeledDatePicker from '../../../components/registration-bar/LabeledDatePicker.vue';
import LabeledDropdown from '../../../components/common/LabeledDropdown.vue';
import LabeledSelect from '../../../components/registration-bar/LabeledSelect.vue';

const emit = defineEmits(['updateList', 'updatePrdp', 'resetList', 'saveData', 'update:data']);
const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    dataKey: {
        type: String,
        default: 'id'
    }
});

onMounted(() => {
    
})

const formatDateForDB = (date) => {
    if (!date) return null;
    if (date instanceof Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    return null;
};

const parseDate = (dateString) => {
    if (!dateString) return null;
    if (typeof dateString === 'string') {
        return new Date(dateString);
    }
    return dateString;
};

const getDataForServer = () => {
    return {
        ...currentData.value,
        inst_date: formatDateForDB(currentData.value.inst_date),
        chk_exp_date: formatDateForDB(currentData.value.chk_exp_date)
    };
};

// 현재 표시할 데이터를 관리하는 ref
const currentData = ref({
    eqii_code: '',
    inst_date: '',
    chk_exp_date: '',
    stat: '',
    note: '',
    inst_emp_code: ''
});

// props.data 변화 감지해서 currentData 업데이트
watch(() => props.data, (newVal) => {
    if (newVal) {
        currentData.value = {
            ...newVal,
            inst_date: parseDate(newVal.inst_date),
            chk_exp_date: parseDate(newVal.chk_exp_date)
        };
        console.log('currentData updated:', currentData.value);
    } else {
        currentData.value = {
            eqii_code: '',
            inst_date: null,
            chk_exp_date: null,
            stat: '',
            note: '',
            inst_emp_code: ''
        };
    }
}, { immediate: true, deep: true });

/**
 * 생산 계획 불러오기 팝업 데이터 불러오기
 */
const loadPlansData = async () => {
    try {
        const response = await axios.get(`/api/eq/eqiiall`);
        console.log('Plans data loaded:', response.data);
        eqiis.value = response.data;
    }
    catch(err) {
        console.error('데이터 로딩 에러:', err);
    }
}

const statusOptions = [
    { label: '점검중', value: 'u1' },
    { label: '점검완료', value: 'u2' },
    { label: '지시전달', value: 'u3' }
];

/**
 * 생산 계획 불러오기
 * @param value 선택한 생산 계획
 */
const loadSelectedPlan = async (value) => {
    console.log('선택된 계획:', value);
    if (!value || !value.eqii_code) {
        alert('생산계획을 선택해주세요.');
        return;
    }

    // 선택된 데이터로 업데이트
    const updatedData = {
        eqii_code: value.eqii_code || '',
        inst_date: parseDate(value.inst_date) || new Date(),
        chk_exp_date: parseDate(value.chk_exp_date) || new Date(),
        stat: value.stat || '',
        note: value.note || '',
        inst_emp_code: value.inst_emp_code || 'EMP-10001'
    };

    // 로컬 데이터 업데이트
    currentData.value = updatedData;
    
    // 부모 컴포넌트에 데이터 전달
    emit('update:data', getDataForServer());
    
    // 팝업 닫기
    eqiiPopupVisibil.value = false;
}

const openPopup = async () => {
    await loadPlansData();
    eqiiPopupVisibil.value = true;
}

const saveMRP = async () => {
    if (!currentData.value.eqii_code) {
        alert('생산계획을 먼저 불러오세요.');
        return;
    }
    // 서버 형식으로 변환해서 emit
    emit('saveData', getDataForServer());
}

const eqiiPopupVisibil = ref(false);
const eqiis = ref([]);

</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>

<template>
    <!-- 🔍 검색바 영역 -->
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <div class="grid grid-cols-1 gap-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl"><b>설비 점검 지시서 정보</b></div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button label="삭제" severity="danger" class="min-w-fit" />
                    <Button label="초기화" severity="contrast" class="min-w-fit" v-on:click="emit('resetList')" />
                    <Button label="저장" severity="info" class="min-w-fit" v-on:click="saveMRP"/>
                    <Button label="지시서 불러오기" severity="success" class="min-w-fit whitespace-nowrap"
                        @click="openPopup" />
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="점검지시서 코드" :model-value="currentData.eqii_code" :disabled="true" placeholder="저장 시 자동으로 생성됩니다." />
            <LabeledDatePicker label="지시일자" :model-value="currentData.inst_date" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledDatePicker label="점검예정일" :model-value="currentData.chk_exp_date" />
            <LabeledSelect label="상태" v-model="currentData.stat" :options="statusOptions" placeholder="상태를 선택하세요" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="지시자" v-model="currentData.inst_emp_code" :disabled="true" />
            <LabeledTextarea label="비고" :model-value="currentData.note" />
        </div>
    </div>

    <!-- 팝업 컴포넌트 -->
    <EqiiSinglePopup 
        v-model:visible="eqiiPopupVisibil" 
        :items="eqiis" 
        @confirm="loadSelectedPlan" 
        :mapper="EquipIIMapping"
        :dataKey="'eqii_code'" 
        :placeholder="'생산계획 불러오기'">
    </EqiiSinglePopup>
</template>