<script setup>
import { ref, watch } from 'vue';
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

// 🔥 computed 제거하고 일반 ref로 변경!
const currentData = ref({
    eqii_code: '',
    inst_date: null,
    chk_exp_date: null,
    stat: '',
    note: '',
    inst_emp_name: 'EMP-10001'
});

// 🔥 props 변화 감지해서 currentData 업데이트 (한 번만!)
watch(() => props.data, (newData) => {
    if (newData) {
        currentData.value = {
            eqii_code: newData.eqii_code || '',
            inst_date: parseDate(newData.inst_date),
            chk_exp_date: parseDate(newData.chk_exp_date),
            stat: newData.stat || '',
            note: newData.note || '',
            inst_emp_name: newData.inst_emp_name || 'EMP-10001'
        };
    }
}, { immediate: true, deep: true });

// 🎯 개별 업데이트 함수들
const updateInstDate = (newDate) => {
    emit('update:data', {
        ...props.data,
        inst_date: formatDateForDB(newDate)
    });
};

const updateChkExpDate = (newDate) => {
    emit('update:data', {
        ...props.data,
        chk_exp_date: formatDateForDB(newDate)
    });
};

const updateStat = (newStat) => {
    emit('update:data', {
        ...props.data,
        stat: newStat
    });
};

const updateNote = (newNote) => {
    emit('update:data', {
        ...props.data,
        note: newNote
    });
};

const deletePlan = async () => {
    if (!currentData.value.eqii_code) {
        alert('삭제할 지시서가 없습니다.');
        return;
    }
    
    if (!confirm('정말로 이 지시서를 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        const response = await axios.delete(`/api/eq/eqii/${currentData.value.eqii_code}`);
        
        if (response.data.success) {
            alert('삭제에 성공했습니다.');
            emit('resetList'); // 데이터 초기화
        } else {
            alert('삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('삭제 중 오류:', error);
        alert('삭제 중 오류가 발생했습니다.');
    }
};

const statusOptions = [
    { label: '점검중', value: 'u1' },
    { label: '점검완료', value: 'u2' },
    { label: '지시전달', value: 'u3' }
];

const loadPlansData = async () => {
    try {
        const response = await axios.get(`/api/eq/eqiiall`);
        console.log('Plans data loaded:', response.data);
        eqiis.value = response.data;
    }
    catch (err) {
        console.error('데이터 로딩 에러:', err);
    }
}

// 팝업에서 선택 - 한 번만 emit!
const loadSelectedPlan = async (value) => {
    console.log('선택된 지시서:', value);
    if (!value || !value.eqii_code) {
        alert('지시서를 선택해주세요.');
        return;
    }

    // 한 번에 모든 데이터 업데이트
    emit('update:data', {
        eqii_code: value.eqii_code,
        inst_date: formatDateForDB(parseDate(value.inst_date)),
        chk_exp_date: formatDateForDB(parseDate(value.chk_exp_date)),
        stat: value.stat || '',
        note: value.note || '',
        inst_emp_name: value.inst_emp_name || 'EMP-10001',
        inst_emp_code: value.inst_emp_code
    });

    eqiiPopupVisibil.value = false;
}

const openPopup = async () => {
    await loadPlansData();
    eqiiPopupVisibil.value = true;
}

const saveMRP = async () => {
    emit('saveData');
}

const eqiiPopupVisibil = ref(false);
const eqiis = ref([]);
</script>

<template>
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <div class="grid grid-cols-1 gap-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl"><b>설비 점검 지시서 정보</b></div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button label="삭제" severity="danger" class="min-w-fit" @click="deletePlan" />
                    <Button label="초기화" severity="contrast" class="min-w-fit" v-on:click="emit('resetList')" />
                    <Button label="저장" severity="info" class="min-w-fit" v-on:click="saveMRP" />
                    <Button label="지시서 불러오기" severity="success" class="min-w-fit whitespace-nowrap"
                        @click="openPopup" />
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="점검지시서 코드" :model-value="currentData.eqii_code" :disabled="true"
                placeholder="저장 시 자동으로 생성됩니다." />
            <LabeledDatePicker label="지시일자" :model-value="currentData.inst_date" @update:model-value="updateInstDate" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledDatePicker label="점검예정일" :model-value="currentData.chk_exp_date"
                @update:model-value="updateChkExpDate" />
            <LabeledSelect label="상태" :model-value="currentData.stat" @update:model-value="updateStat"
                :options="statusOptions" placeholder="상태를 선택하세요" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="지시자" :model-value="currentData.inst_emp_name" :disabled="true" />
            <LabeledTextarea label="비고" :model-value="currentData.note" @update:model-value="updateNote" />
        </div>
    </div>

    <!-- 팝업 컴포넌트 -->
    <EqiiSinglePopup v-model:visible="eqiiPopupVisibil" :items="eqiis" @confirm="loadSelectedPlan"
        :mapper="EquipIIMapping" :dataKey="'eqii_code'" :placeholder="'지시서 불러오기'">
    </EqiiSinglePopup>
</template>