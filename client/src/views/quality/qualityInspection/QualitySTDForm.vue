<template>
    <div class="card space-y-6 p-6" style="width: 45%">
        <div class="grid grid-cols-1 gap-4 mb-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">
                        {{ isEditMode ? '수정' : '등록' }}
                    </div>
                    <div v-if="isEditMode" class="text-sm text-blue-600 mt-1">
                        선택된 행: {{ STDform.qcr_code }}
                    </div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button v-if="isEditMode" label="취소" severity="secondary" class="min-w-fit whitespace-nowrap"
                        outlined @click="cancelEdit" />
                    <Button v-if="isEditMode" label="수정" severity="info" class="min-w-fit whitespace-nowrap"
                        @click="updateEquipment" />
                    <Button v-if="!isEditMode" label="등록" severity="success" class="min-w-fit whitespace-nowrap"
                        @click="registerQCR" />
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">품질기준코드</label>
                <InputText v-model="STDform.qcr_code" type="text"
                    placeholder="자동 생성" class="w-full" disabled />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">검사항목</label>
                <InputText v-model="STDform.inspection_item" type="text"
                    placeholder="검사항목 입력" class="w-full" />
            </div>


            <div>
                <label class="font-semibold text-xl block mb-2">기준(상한)</label>
                <InputText v-model="STDform.range_top" type="text" placeholder="상한 기준치" class="w-full" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">기준(하한)</label>
                <InputText v-model="STDform.range_bot" type="text" placeholder="하한 기준치" class="w-full" />
            </div>

            <div>
                <label class="font-semibold text-xl block mb-2">품목유형</label>
                <Dropdown v-model="STDform.com_value" :options="valueOptions" optionLabel="label" optionValue="value" class="w-full" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">단위</label>
                <Dropdown v-model="STDform.unit" :options="TypeOptions" optionLabel="label" optionValue="value" placeholder="단위 선택" class="w-full" />
            </div>

            <div>
                <label class="font-semibold text-xl block mb-2">검사방법</label>
                <InputText v-model="STDform.check_method" type="text" placeholder="검사 방법 입력" class="w-full" />
            </div>
            <div>
                <LabeledDatePicker :key="`regdate_from_${isEditMode}_${STDform.qcr_code}`" v-model="STDform.regdate_from"
                    label="등록일자" placeholder="날짜 선택" :disabled="false" />
            </div>

            <div class="md:col-span-2">
                <label class="font-semibold text-xl block mb-2">비고</label>
                <InputText v-model="STDform.note" type="text" placeholder="비고 입력" class="w-full" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, defineProps, defineEmits, nextTick } from 'vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import LabeledDatePicker from '../../../components/common/LabeledDatePicker.vue';
import axios from 'axios';

// Props 정의 (부모에서 선택된 데이터 받기)
const props = defineProps({
    selectedData: {
        type: Object,
        default: null
    }
});

// Emits 정의 (부모에게 이벤트 전달)
const emit = defineEmits(['data-updated']);

// 품질폼 입력데이터
const STDform = ref({
  qcr_code: '',
  inspection_item: '',
  range_top: '',
  range_bot: '',
  unit: null,
  note: '',
  check_method: '',
  regdate: null,
  com_value: null,
});

// 수정모드여부 계산
const isEditMode = computed(() => {
    return props.selectedData !== null && props.selectedData !== undefined;
});


const valueOptions = [
    { label: '완제품', value: 'i1' },
    { label: '반제품', value: 'i2' },
    { label: '원자재', value: 'i4' }
];

const TypeOptions = [
    { label: 'EA', value: 'EA' },
    { label: 'KG', value: 'KG' },
    { label: 'T', value: 'T' },
    { label: 'L', value: 'L' },
    { label: 'BOX', value: 'BOX' },
    { label: 'g', value: 'g' },
    { label: 'mm', value: 'mm' },
    { label: '%', value: '%' },
    { label: 'cm', value: 'cm' },
    { label: 'N', value: 'N' }
];


// 폼 초기화 함수
const resetForm = async () => {
    STDform = ref({
        qcr_code: '',
        inspection_item: '',
        range_top: '',
        range_bot: '',
        unit: null,
        note: '',
        check_method: '',
        regdate: null,
        com_value: null,
});
    await nextTick();
};

// 선택된 데이터 변경 감지 (테이블에서 행 선택 시)
watch(
    () => props.selectedData,
    (newdata) => {
        if (newdata) {
        // 선택된 데이터를 폼에 채우기
        STDform.value = {
        qcr_code: data.qcr_code || '',
        inspection_item: data.inspection_item || '',
        range_top: data.range_top || '',
        range_bot: data.range_bot || '',
        unit: data.unit || null,
        note: data.note || '',
        check_method: data.check_method || '',
        regdate: data.regdate ? new Date(data.regdate) : null,
        com_value: data.com_value || null,
        };
    } else {
        // 선택 해제 시 폼 초기화
        resetForm();
    }
}, { immediate: true });


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

// 품질 검사기준 등록함수
const registerQCR = async () => {
    try {
        console.log('품질 등록:', STDform.value);

        // 필수 필드 검증
        if (!STDform.value.qcr_code || !STDform.value.qcr_code) {
            alert('품목기준코드는 필수입니다.');
            return;
        }

        const submitData = {
            ...STDform.value,
            qcr_code: STDform.value.qcr_code || '',
            inspection_item: STDform.value.inspection_item || '',
            range_top: STDform.value.range_top ? parseFloat(STDform.value.range_top) : null,
            range_bot: STDform.value.range_bot ? parseFloat(STDform.value.range_bot) : null,
            unit: STDform.value.unit || null,
            note: STDform.value.note || '',
            check_method: STDform.value.check_method || '',
            regdate: formatDateForDB(STDform.value.regdate) || formatDateForDB(new Date()),
            com_value: STDform.value.com_value ? parseFloat(STDform.value.com_value) : null,
        };


        const response = await axios.post('/api/qlt', submitData);

        if (response.data.success) {
            console.log('품질검사 등록 완료');
            alert('성공적으로 등록되었습니다.');
            await resetForm();
            emit('data-updated'); // 부모에게 데이터 업데이트 알림
        } else {
            console.error('등록 실패:', response.data.error);
            alert('등록에 실패했습니다.');
        }
    } catch (error) {
        console.error('등록 실패:', error);
        alert('등록 중 오류가 발생했습니다.');
    }
};

// 수정함수
const updateEquipment = async () => {
    try {
        console.log('품질기준 수정:', STDform.value);

        // 필수 필드 검증
        if (!STDform.value.qcr_code) {
            alert('품질기준코드는 필수입니다.');
            return;
        }

        const submitData = {
            ...STDform.value,
            qcr_code: STDform.value.qcr_code || '',
            inspection_item: STDform.value.inspection_item || '',
            range_top: STDform.value.range_top ? parseFloat(STDform.value.range_top) : null,
            range_bot: STDform.value.range_bot ? parseFloat(STDform.value.range_bot) : null,
            unit: STDform.value.unit || null,
            note: STDform.value.note || '',
            check_method: STDform.value.check_method || '',
            regdate: formatDateForDB(STDform.value.regdate) || formatDateForDB(new Date()),
            com_value: STDform.value.com_value ? parseFloat(STDform.value.com_value) : null,
        };



        const response = await axios.put(`/api/qlt/${STDform.value.eq_code}`, submitData);

        if (response.data.success) {
            console.log('수정 완료');
            alert('성공적으로 수정되었습니다.');
            await resetForm();
            emit('data-updated'); // 부모에게 데이터 업데이트 알림
        } else {
            console.error('수정 실패:', response.data.error);
            alert('수정에 실패했습니다.');
        }
    } catch (error) {
        console.error('수정 실패:', error);
        alert('수정 중 오류가 발생했습니다.');
    }
};

const cancelEdit = () => {
    resetForm();
    emit('data-updated');
};
</script>

<style scoped>
</style>