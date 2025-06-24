<script setup>
import { ref, watch } from 'vue';
import Button from 'primevue/button';
import LabeledInput from '../../../components/registration-bar/LabeledInput.vue';
import axios from 'axios';
import QualitySinglePopup from './QualitySinglePopup.vue';
import LabeledDatePicker from '../../../components/registration-bar/LabeledDatePicker.vue';
import moment from 'moment';

const emit = defineEmits(['updateList', 'updatePrdp', 'resetList', 'saveData', 'update:data', 'loadPrdrByQio', 'loadQirByQio']);
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
    
    let dateObj;
    if (typeof date === 'string') {
        dateObj = new Date(date);
    } else if (date instanceof Date) {
        dateObj = date;
    } else {
        return null;
    }
    
    if (isNaN(dateObj.getTime())) {
        console.warn('잘못된 날짜 형식:', date);
        return null;
    }
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};

const parseDate = (dateString) => {
    if (!dateString) return null;
    if (typeof dateString === 'string') {
        // 문자열에서 날짜 부분만 추출
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
    mpr_code: '',
    emp_name: '정품질'
});

// 무한루프 방지용 플래그
const isInternalUpdate = ref(false);

// watch 수정 - 스마트한 업데이트 감지
watch(() => props.data, (newData, oldData) => {
    if (newData) {
        console.log('Search - props.data 변경 감지:', newData.qio_code);
        
        // 실제로 데이터가 바뀌었는지 체크
        const hasChanged = !oldData || 
            oldData.qio_code !== newData.qio_code ||
            oldData.qio_date !== newData.qio_date ||
            oldData.insp_date !== newData.insp_date ||
            oldData.emp_name !== newData.emp_name;

        if (hasChanged) {
            console.log('Search - 실제 데이터 변경 확인, 업데이트 진행');
            
            currentData.value = {
                qio_code: newData.qio_code || '',
                qio_date: parseDate(newData.qio_date) || new Date(),
                insp_date: parseDate(newData.insp_date),
                prdr_code: newData.prdr_code || '',
                mpr_d_code: newData.mpr_code || '',
                emp_name: newData.emp_name || '정품질'
            };
            
            console.log('Search - currentData 업데이트 완료!');
        } else {
            console.log('Search - 동일한 데이터이므로 스킵');
        }
    }
}, { immediate: true, deep: true });

// 업데이트 함수들도 플래그 사용
const updateInstDate = (newDate) => {
    console.log('검사예정일 업데이트:', newDate);
    emit('update:data', {
        ...props.data,
        insp_date: formatDateForDB(newDate)
    });
};

const updateQioDate = (newDate) => {
    console.log('지시일자 업데이트:', newDate);
    emit('update:data', {
        ...props.data,
        qio_date: formatDateForDB(newDate)
    });
};

const updateEmp = (newEmp) => {
    console.log('지시자 업데이트:', newEmp);
    emit('update:data', {
        ...props.data,
        emp_name: newEmp
    });
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
        const response = await axios.delete(`/api/qlt/qio/${currentData.value.qio_code}`);

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
        const response = await axios.get(`/api/qlt/qio`);
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

    // 내부 업데이트 플래그 설정
    isInternalUpdate.value = true;

    // 부모에게 데이터 업데이트 알림
    emit('update:data', {
        ...props.data,
        qio_code: value.qio_code,
        qio_date: formatDateForDB(value.qio_date),
        insp_date: formatDateForDB(value.insp_date),
        prdr_code: value.prdr_code,
        mpr_d_code: value.mpr_code,
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
    qioPopupVisibil.value = true;
    await loadPlansData();
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
        :selectedHeader="['qio_code', 'insp_date', 'prdr_code', 'mpr_d_code', 'emp_name']" :mapper="{
            qio_code: '품질검사지시 코드',
            insp_date: '지시일자',
            prdr_code: '생산실적 코드',
            mpr_d_code: '구매 코드',
            emp_name: '지시자'
        }" :dataKey="'qio_code'" :placeholder="'지시서 불러오기'">
    </QualitySinglePopup>
</template>