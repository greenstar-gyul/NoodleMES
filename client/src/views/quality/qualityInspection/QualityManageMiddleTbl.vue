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
    prdr_code: '',
    po_name: '',
    purchase_code: '',
    prod_name: '',
    production_qtt: 0
});

watch(() => props.data, (newData) => {
    if (newData) {
        currentData.value = {
            prdr_code: newData.prdr_code || '',
            po_code: newData.po_code || '',
            purchase_code: newData.purchase_code || '',
            prod_code: newData.prod_code || '',
            production_qtt: newData.production_qtt || 0
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

const loadPlansData = async () => {
    try {
        const response = await axios.get(`/api/prdr/all`);
        if (response.data && response.data.data) {
            loadPrdpPopupInfo.value = response.data.data.map(item => ({
                prdp_code: item.prdp_code,
                prod_name: item.prod_name,
                end_date: item.end_date ? new Date(item.end_date) : null,
                prodcution_qtt: item.prodcution_qtt || 0
            }));
        }
    } catch (error) {
        console.error('실적 간편 조회 실패:', error);
    }
};

const loadSelectedPlan = async (value) => {
    console.log('선택된 지시서:', value);
    if (!value || !value.qio_code) {
        alert('지시서를 선택해주세요.');
        return;
    }

    emit('update:data', {
        ...props.data
    });

    prdrPopupVisible.value = false;
};

const loadPrdpPopupInfo = ref({
    prdp_code: '',
    prod_name: '',
    end_date: null,
    prodcution_qtt: 0,  
});

const openPopup = async () => {
    await loadPlansData();
    prdrPopupVisible.value = true;
}

const prdrPopupVisible = ref(false);
const qios = ref([]);
</script>

<template>
    <div class="mt-6 p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <div class="grid grid-cols-1 gap-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl"><b>생산 실적 정보</b></div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button label="초기화" severity="contrast" class="min-w-fit" v-on:click="emit('resetList')" />
                    <Button label="생산실적 불러오기" severity="success" class="min-w-fit whitespace-nowrap"
                        @click="openPopup" />
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="생산실적 코드" :model-value="currentData.prdr_code" :disabled="true"
                placeholder="저장 시 자동으로 생성됩니다." />
            <LabeledInput label="공정명" :model-value="currentData.po_name" :disabled="true"
                placeholder="저장 시 자동으로 생성됩니다." />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="발주서코드" :model-value="currentData.purchase_code" @update:model-value="updateEmp"
                :disabled="true" />
            <LabeledInput label="제품명" :model-value="currentData.prod_name" :disabled="true"
                placeholder="저장 시 자동으로 생성됩니다." />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="생산수량" :model-value="currentData.production_qtt" @update:model-value="updateEmp"
                :disabled="true" />
        </div>
    </div>
    <!-- 팝업 컴포넌트 -->
    <QualitySinglePopup v-model:visible="prdrPopupVisible" :items="qios" @confirm="loadSelectedPlan"
        :selectedHeader="['prdr_code', 'prod_name', 'end_date', 'production_qtt']" :mapper="{
            prdr_code: '생산계획 코드',
            prod_name: '제품명',
            end_date: '완료일자',
            production_qtt: '생산량'
        }" :dataKey="'prdr_code'" :placeholder="'생산실적 불러오기'">
    </QualitySinglePopup>
</template>