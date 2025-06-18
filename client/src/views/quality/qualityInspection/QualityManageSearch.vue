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

const emit = defineEmits(['updateList', 'updatePrdp', 'resetList', 'saveData', 'update:data', 'loadPrdrByQio']);
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
    // ✅ 방법 1: UTC로 처리
    return moment.utc(date).format('YYYY-MM-DD HH:mm:ss');
    
    // ✅ 방법 2: 날짜만 추출 (시간 무시)
    // const dateOnly = new Date(date);
    // return moment(dateOnly).format('YYYY-MM-DD') + ' 00:00:00';
};

const parseDate = (dateString) => {
    if (!dateString) return null;
    if (typeof dateString === 'string') {
        // ✅ 문자열에서 날짜 부분만 추출
        const dateOnly = dateString.split('T')[0]; // "2025-06-01"
        return moment(dateOnly).toDate();
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

// ✅ 무한루프 방지용 플래그
const isInternalUpdate = ref(false);

// ✅ watch 수정 - 스마트한 업데이트 감지
watch(() => props.data, (newData) => {
    if (newData) {
        console.log('Search - props.data 변경 감지:', newData.qio_code);
        console.log('Search - isInternalUpdate 상태:', isInternalUpdate.value);

        // 내부 업데이트이지만 실제로 다른 데이터면 업데이트
        const isDifferentData = !currentData.value ||
            currentData.value.qio_code !== newData.qio_code;

        if (!isInternalUpdate.value || isDifferentData) {
            console.log('Search - 데이터 업데이트 진행 (다른 데이터 또는 외부 업데이트)');

            currentData.value = {
                qio_code: newData.qio_code || '',
                qio_date: parseDate(newData.qio_date) || parseDate(newData.insp_date) || new Date(), // ✅ 기본값 설정
                insp_date: parseDate(newData.insp_date),
                prdr_code: newData.prdr_code || '',
                purchase_code: newData.purchase_code || '',
                emp_name: newData.emp_name || '정품질'
            };

            console.log('Search - currentData 업데이트 완료:', currentData.value.qio_code);
        } else {
            console.log('Search - 내부 업데이트 중이므로 스킵');
        }
    }
}, { immediate: true, deep: true });

// ✅ 업데이트 함수들도 플래그 사용
const updateInstDate = (newDate) => {
    isInternalUpdate.value = true;

    emit('update:data', {
        ...props.data,
        insp_date: formatDateForDB(newDate)
    });

    // 플래그 해제
    setTimeout(() => {
        isInternalUpdate.value = false;
    }, 50);
};

const updateQioDate = (newDate) => {
    isInternalUpdate.value = true;

    emit('update:data', {
        ...props.data,
        qio_date: formatDateForDB(newDate)
    });

    // 플래그 해제
    setTimeout(() => {
        isInternalUpdate.value = false;
    }, 50);
};

const updateEmp = (newEmp) => {
    isInternalUpdate.value = true;

    emit('update:data', {
        ...props.data,
        emp_name: newEmp
    });

    setTimeout(() => {
        isInternalUpdate.value = false;
    }, 50);
};

const deletePlan = async () => {
    if (!currentData.value.qio_code) {
        alert('삭제할 지시서가 없습니다.');
        return;
    }

    if (!confirm('정말로 이 지시서를 삭제하시겠습니까?')) {
        return;
    }

    try {
        const response = await axios.delete(`/api/qcr/qio/${currentData.value.qio_code}`);

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

    // ✅ 내부 업데이트 플래그 설정
    isInternalUpdate.value = true;

    // 부모에게 데이터 업데이트 알림
    emit('update:data', {
        ...props.data,
        qio_code: value.qio_code,
        qio_date: formatDateForDB(value.qio_date),
        insp_date: formatDateForDB(value.insp_date),
        prdr_code: value.prdr_code,
        purchase_code: value.purchase_code,
        emp_name: value.emp_name
    });

    // 팝업 닫기
    qioPopupVisibil.value = false;

    // 플래그 해제
    setTimeout(() => {
        isInternalUpdate.value = false;
    }, 100);
};

const openPopup = async () => {
    await loadPlansData();
    qioPopupVisibil.value = true;
};

const saveQio = async () => {
    emit('saveData');
};

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
                    <Button label="전체 초기화" severity="contrast" class="min-w-fit" v-on:click="emit('resetList')" />
                    <Button label="저장" severity="info" class="min-w-fit" v-on:click="saveQio" />
                    <Button label="검사지시 불러오기" severity="success" class="min-w-fit whitespace-nowrap"
                        @click="openPopup" />
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="품질검사지시 코드" :model-value="currentData.qio_code" :disabled="true"
                placeholder="저장 시 자동으로 생성됩니다." />
            <LabeledDatePicker label="지시일자" :model-value="currentData.qio_date" @update:model-value="updateQioDate" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledDatePicker label="검사예정일" :model-value="currentData.insp_date"
                @update:model-value="updateInstDate" />
            <LabeledInput label="지시자" :model-value="currentData.emp_name" @update:model-value="updateEmp"
                :disabled="true" />
        </div>
    </div>

    <!-- 팝업 컴포넌트 -->
    <QualitySinglePopup v-model:visible="qioPopupVisibil" :items="qios" @confirm="loadSelectedPlan"
        :selectedHeader="['qio_code', 'insp_date', 'prdr_code', 'purchase_code', 'emp_name']" :mapper="{
            qio_code: '품질검사지시 코드',
            insp_date: '지시일자',
            prdr_code: '공급업체 코드',
            purchase_code: '구매 코드',
            emp_name: '지시자'
        }" :dataKey="'qio_code'" :placeholder="'지시서 불러오기'">
    </QualitySinglePopup>
</template>