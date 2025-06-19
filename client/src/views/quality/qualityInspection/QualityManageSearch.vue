<script setup>
import { ref, watch } from 'vue';
import Button from 'primevue/button';
import LabeledTextarea from '../../../components/registration-bar/LabeledTextarea.vue';
import LabeledInput from '../../../components/registration-bar/LabeledInput.vue';
import axios from 'axios';
import EquipIIMapping from '../../../service/EquipIIMapping';
import QualitySinglePopup from './QualitySinglePopup.vue';
import LabeledDatePicker from '../../../components/registration-bar/LabeledDatePicker.vue';
import LabeledSelect from '../../../components/registration-bar/LabeledSelect.vue';
import moment from 'moment';

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
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
};


const parseDate = (dateString) => {
    if (!dateString) return null;
    if (typeof dateString === 'string') {
        return new Date(dateString);
    }
    return dateString;
};

const currentData = ref({
    qio_code: '',
    qio_date: null,
    insp_date: null,
    prdr_code: '',
    purchase_code: '',
    emp_name: '정품질'
});

watch(() => props.data, (newData) => {
    if (newData) {
        currentData.value = {
            qio_code: newData.qio_code || '',
            qio_date: parseDate(newData.qio_date),
            insp_date: parseDate(newData.insp_date),
            prdr_code: newData.prdr_code || '',
            purchase_code: newData.purchase_code || '',
            emp_name: newData.emp_name || '정품질'
        };
    }
    console.log('props.data 변경 감지:', currentData.value);
}, { immediate: true, deep: true });

const updateInstDate = (newDate) => {
    emit('update:data', {
        ...props.data,
        inst_date: formatDateForDB(newDate)
    });
};

const updateEmp = (newEmp) => {
    emit('update:data', {
        ...props.data,
        note: newEmp
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
            emit('resetList');
        } else {
            alert('삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('삭제 중 오류:', error);
        alert('삭제 중 오류가 발생했습니다.');
    }
};

const loadPlansData = async () => {
    try {
        const response = await axios.get(`/api/qcr/qio`);
        console.log('Plans data loaded:', response.data);

        qios.value = response.data.map(item => ({
            ...item,
            insp_date: item.insp_date,
        }));

    } catch (err) {
        console.error('데이터 로딩 에러:', err);
    }
};

const loadSelectedPlan = async (value) => {
    console.log('선택된 지시서:', value);
    if (!value || !value.qio_code) {
        alert('지시서를 선택해주세요.');
        return;
    }

    emit('update:data', {
        qio_code: value.qio_code,
        qio_date: parseDate(value.qio_date),
        insp_date: parseDate(value.insp_date),
        prdr_code: value.prdr_code,
        purchase_code: value.purchase_code,
        emp_name: value.emp_name
    });

    qioPopupVisibil.value = false;
};

const openPopup = async () => {
    await loadPlansData();
    qioPopupVisibil.value = true;
}

const saveMRP = async () => {
    emit('saveData');
}

const qioPopupVisibil = ref(false);
const qios = ref([]);
</script>

<template>
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <div class="grid grid-cols-1 gap-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl"><b>품질 검사 지시서 정보</b></div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button label="삭제" severity="danger" class="min-w-fit" @click="deletePlan" />
                    <Button label="초기화" severity="contrast" class="min-w-fit" v-on:click="emit('resetList')" />
                    <Button label="저장" severity="info" class="min-w-fit" v-on:click="saveMRP" />
                    <Button label="검사지시 불러오기" severity="success" class="min-w-fit whitespace-nowrap"
                        @click="openPopup" />
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="품질검사지시 코드" :model-value="currentData.qio_code" :disabled="true"
                placeholder="저장 시 자동으로 생성됩니다." />
            <LabeledDatePicker label="지시일자" :model-value="currentData.qio_date" @update:model-value="updateInstDate" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledDatePicker label="검사예정일" :model-value="currentData.insp_date" @update:model-value="updateInstDate" />
            <LabeledInput label="지시자" :model-value="currentData.emp_name" @update:model-value="updateEmp" :disabled="true" />
        </div>
    </div>

    <!-- 팝업 컴포넌트 -->
    <QualitySinglePopup v-model:visible="qioPopupVisibil" :items="qios" @confirm="loadSelectedPlan"
    :selectedHeader="['qio_code', 'insp_date', 'prdr_code', 'purchase_code', 'emp_name']"
        :mapper="{
            qio_code: '품질검사지시 코드',
            insp_date: '지시일자',
            prdr_code: '공급업체 코드',
            purchase_code: '구매 코드',
            emp_name: '지시자'
        }" :dataKey="'qio_code'" :placeholder="'지시서 불러오기'">
    </QualitySinglePopup>
</template>