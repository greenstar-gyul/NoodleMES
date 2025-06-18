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
    prdr_code: '',
    po_name: '',
    prod_name: '',
    purchase_code: '',
    end_date: null,
    production_qtt: '0'
});

// ✅ 무한루프 방지용 플래그
const isInternalUpdate = ref(false);

// ✅ watch 수정 - 무한루프 방지
watch(() => props.data, (newData) => {
    if (newData) {
        console.log('MiddleTbl - props.data 변경 감지:', newData.prdr_code);
        console.log('MiddleTbl - isInternalUpdate 상태:', isInternalUpdate.value);

        // 내부 업데이트이지만 실제로 다른 데이터면 업데이트
        const isDifferentData = !currentData.value ||
            currentData.value.prdr_code !== newData.prdr_code ||
            currentData.value.qio_code !== newData.qio_code;

        if (!isInternalUpdate.value || isDifferentData) {
            console.log('MiddleTbl - 데이터 업데이트 진행');

            currentData.value = {
                qio_code: newData.qio_code || '',
                prdr_code: newData.prdr_code || '',
                po_name: newData.po_name || '',
                prod_name: newData.prod_name || '',
                purchase_code: newData.purchase_code || '',
                end_date: newData.end_date ? parseDate(newData.end_date) : null,
                production_qtt: String(newData.production_qtt || 0)
            };

            console.log('MiddleTbl - currentData 업데이트 완료:', currentData.value.prdr_code);
        } else {
            console.log('MiddleTbl - 내부 업데이트 중이므로 스킵');
        }
    }
}, { immediate: true, deep: true });

// ✅ 업데이트 함수들에 플래그 적용
const updatePrdrCode = (newCode) => {
    isInternalUpdate.value = true;

    emit('update:data', {
        ...props.data,
        prdr_code: newCode
    });

    setTimeout(() => {
        isInternalUpdate.value = false;
    }, 50);
};

const updatePoName = (newName) => {
    isInternalUpdate.value = true;

    emit('update:data', {
        ...props.data,
        po_name: newName
    });

    setTimeout(() => {
        isInternalUpdate.value = false;
    }, 50);
};

const updatePurchaseCode = (newCode) => {
    isInternalUpdate.value = true;

    emit('update:data', {
        ...props.data,
        purchase_code: newCode
    });

    setTimeout(() => {
        isInternalUpdate.value = false;
    }, 50);
};

const updateEndDate = (newDate) => {
    isInternalUpdate.value = true;

    emit('update:data', {
        ...props.data,
        end_date: formatDateForDB(newDate)
    });

    setTimeout(() => {
        isInternalUpdate.value = false;
    }, 50);
};

const updateProdName = (newName) => {
    isInternalUpdate.value = true;

    emit('update:data', {
        ...props.data,
        prod_name: newName
    });

    setTimeout(() => {
        isInternalUpdate.value = false;
    }, 50);
};

const updateProductionQtt = (newQtt) => {
    isInternalUpdate.value = true;

    emit('update:data', {
        ...props.data,
        production_qtt: String(newQtt)
    });

    setTimeout(() => {
        isInternalUpdate.value = false;
    }, 50);
};

const loadPrdpPopupInfo = ref([]);

const loadPlansData = async () => {
    try {
        const response = await axios.get(`/api/prdr/all`);

        if (response.data && Array.isArray(response.data)) {
            loadPrdpPopupInfo.value = response.data.map(item => ({
                qio_code: item.qio_code,
                prdr_code: item.prdr_code,
                po_name: item.po_name,
                prod_name: item.prod_name,
                purchase_code: item.purchase_code,
                end_date: item.end_date,
                production_qtt: item.production_qtt || 0,
            }));
        }
    } catch (error) {
        console.error('실적 간편 조회 실패:', error);
        loadPrdpPopupInfo.value = [];
    }
};

const loadSelectedPlan = async (selectedItem) => {
    console.log('선택된 생산실적:', selectedItem);

    if (!selectedItem || !selectedItem.prdr_code) {
        alert('생산실적을 선택해주세요.');
        return;
    }

    // ✅ 내부 업데이트 플래그 설정
    isInternalUpdate.value = true;

    // 선택한 데이터로 부모 컴포넌트에 업데이트 요청
    emit('update:data', {
        ...props.data,
        qio_code: selectedItem.qio_code || '',
        prdr_code: selectedItem.prdr_code,
        po_name: selectedItem.po_name,
        prod_name: selectedItem.prod_name,
        purchase_code: selectedItem.purchase_code,
        end_date: selectedItem.end_date,
        production_qtt: selectedItem.production_qtt || 0
    });

    // 팝업 닫기
    prdrPopupVisible.value = false;

    // 플래그 해제
    setTimeout(() => {
        isInternalUpdate.value = false;
    }, 100);

    console.log('생산실적 정보가 성공적으로 로드되었습니다!');
};

const openPopup = async () => {
    await loadPlansData();
    prdrPopupVisible.value = true;
};

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
            <LabeledInput label="생산실적 코드" :model-value="currentData.prdr_code" @update:model-value="updatePrdrCode"
                :disabled="true" />
            <LabeledInput label="공정명" :model-value="currentData.po_name" @update:model-value="updatePoName"
                :disabled="true" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="발주서코드" :model-value="currentData.purchase_code"
                @update:model-value="updatePurchaseCode" :disabled="true" />
            <LabeledInput label="제품명" :model-value="currentData.prod_name" @update:model-value="updateProdName"
                :disabled="true" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledDatePicker label="완료일자" :model-value="currentData.end_date" @update:model-value="updateEndDate"
                :disabled="true" />
            <LabeledInput label="생산수량" :model-value="currentData.production_qtt"
                @update:model-value="updateProductionQtt" :disabled="true" />
        </div>
    </div>

    <!-- 팝업 컴포넌트 -->
    <QualitySinglePopup v-model:visible="prdrPopupVisible" :items="loadPrdpPopupInfo" @confirm="loadSelectedPlan"
        :selectedHeader="['prdr_code', 'po_name', 'prod_name', 'purchase_code', 'end_date', 'production_qtt']" :mapper="{
            prdr_code: '생산계획 코드',
            po_name: '공정명',
            prod_name: '제품명',
            purchase_code: '발주서 코드',
            end_date: '완료일자',
            production_qtt: '생산량'
        }" :dataKey="'qio_code'" :placeholder="'생산실적 불러오기'">
    </QualitySinglePopup>
</template>