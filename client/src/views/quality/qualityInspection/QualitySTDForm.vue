<template>
    <div class="card space-y-6 p-6" style="width: 45%">
        <!-- 상단 버튼 및 타이틀 -->
        <div class="grid grid-cols-1 gap-4 mb-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">
                        {{ isEditMode ? '수정' : '등록' }}
                    </div>
                    <div v-if="isEditMode" class="text-sm text-blue-600 mt-1">
                        선택된 행: {{ eqForm.qcr_code }}
                    </div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button v-if="isEditMode" label="취소" severity="secondary" class="min-w-fit whitespace-nowrap" outlined @click="cancelEdit" />
                    <Button v-if="isEditMode" label="수정" severity="info" class="min-w-fit whitespace-nowrap" @click="updateEquipment" />
                    <Button v-if="!isEditMode" label="등록" severity="success" class="min-w-fit whitespace-nowrap" @click="registerQCR" />
                </div>
            </div>
        </div>

        <!-- 입력 항목들 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">품질기준코드</label>
                <InputText v-model="eqForm.qcr_code" type="text" placeholder="자동 생성" class="w-full" disabled />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">검사항목</label>
                <InputText v-model="eqForm.inspection_item" type="text" placeholder="검사항목 입력" class="w-full" />
            </div>

            <div>
                <label class="font-semibold text-xl block mb-2">기준(상한)</label>
                <InputText v-model="eqForm.range_top" type="text" placeholder="상한 기준치" class="w-full" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">기준(하한)</label>
                <InputText v-model="eqForm.range_bot" type="text" placeholder="하한 기준치" class="w-full" />
            </div>

            <div>
                <label class="font-semibold text-xl block mb-2">품목유형</label>
                <Dropdown v-model="eqForm.com_value" :options="valueOptions" optionLabel="label" optionValue="value" class="w-full" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">단위</label>
                <Dropdown v-model="eqForm.unit" :options="TypeOptions" optionLabel="label" optionValue="value" placeholder="단위 선택" class="w-full" />
            </div>

            <div>
                <LabeledDatePicker :key="`regdate_from_${isEditMode}_${eqForm.qcr_code}`" v-model="eqForm.regdate_from"
                    label="등록일자" placeholder="날짜 선택" :disabled="false" />
            </div>
            <div class="flex items-center space-x-2">
                <Checkbox v-model="isUnused" binary variant="filled" inputId="usage-checkbox" />
                <label for="usage-checkbox" class="text-lg">
                    {{ isUnused ? '수동' : '자동' }}
                </label>
            </div>

            <div class="md:col-span-2">
                <label class="font-semibold text-xl block mb-2">비고</label>
                <InputText v-model="eqForm.note" type="text" placeholder="비고 입력" class="w-full" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, defineProps, defineEmits, nextTick } from 'vue';
import axios from 'axios';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import LabeledDatePicker from '../../../components/common/LabeledDatePicker.vue';

const props = defineProps({
    selectedData: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['data-updated']);

const eqForm = ref({
    qcr_code: '',
    inspection_item: '',
    range_top: '',
    range_bot: '',
    com_value: null,
    unit: null,
    note: '',
    regdate_from: null,
    regdate_to: null,
    is_used: 'f2'
});

const isEditMode = computed(() => !!props.selectedData);

const isUnused = computed({
    get: () => eqForm.value.is_used === 'f1',
    set: val => eqForm.value.is_used = val ? 'f1' : 'f2'
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

const formatDateForDB = (date) => {
    if (!date) return null;
    if (date instanceof Date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    return null;
};

const resetForm = async () => {
    eqForm.value = {
        qcr_code: '',
        inspection_item: '',
        range_top: '',
        range_bot: '',
        com_value: null,
        unit: null,
        note: '',
        regdate_from: null,
        regdate_to: null,
        is_used: 'f2'
    };
    await nextTick();
};

watch(() => props.selectedData, (data) => {
    if (data) {
        eqForm.value = {
            qcr_code: data.qcr_code || '',
            inspection_item: data.inspection_item || '',
            range_top: data.range_top || '',
            range_bot: data.range_bot || '',
            com_value: data.com_value || null,
            unit: data.unit || null,
            note: data.note || '',
            regdate_from: data.regdate_from ? new Date(data.regdate_from) : null,
            regdate_to: data.regdate_to ? new Date(data.regdate_to) : null,
            is_used: data.is_used || 'f2'
        };
    } else {
        resetForm();
    }
}, { immediate: true });

const registerQCR = async () => {
try {
    if (!eqForm.value.inspection_item || !eqForm.value.range_top || !eqForm.value.range_bot) {
        alert('검사항목과 기준(상/하한)은 필수 입력입니다.');
        return;
    }

    const today = new Date();

    const submitData = {
        inspection_item: eqForm.value.inspection_item,
        range_top: eqForm.value.range_top,
        range_bot: eqForm.value.range_bot,
        com_value: eqForm.value.com_value ?? '',
        unit: eqForm.value.unit ?? '',
        note: eqForm.value.note?.trim() || '',
        regdate_from: formatDateForDB(eqForm.value.regdate_from) || formatDateForDB(today),
        regdate_to: formatDateForDB(eqForm.value.regdate_to) || formatDateForDB(today),
        is_used: eqForm.value.is_used || 'f2'
    };

    console.log('등록 요청 데이터:', submitData); // 디버깅용 로그

    const response = await axios.post('/api/qcr/register', submitData);

    console.log('등록 응답:', response.data); // 응답 로그 추가

    if (response.data.success) {
        alert(`✅ 등록 성공! 생성된 코드: ${response.data.qcr_codes.join(', ')}`);
        await resetForm();
        emit('data-updated');
    } else {
        alert('❌ 등록 실패: ' + (response.data.message || '서버 응답 없음'));
    }
} catch (err) {
    console.error('❗ 등록 중 오류 발생:', err);
    alert('🚨 등록 중 오류: ' + (err.response?.data?.message || err.message || '네트워크 오류'));
}
};
const updateEquipment = async () => {
    try {
        if (!eqForm.value.inspection_item) {
            alert('검사항목은 필수 입력입니다.');
            return;
        }

        const submitData = {
            ...eqForm.value,
            regdate_from: formatDateForDB(eqForm.value.regdate_from) || formatDateForDB(new Date()),
            regdate_to: formatDateForDB(eqForm.value.regdate_to) || formatDateForDB(new Date())
        };

        const response = await axios.put(`/api/eq/${eqForm.value.qcr_code}`, submitData);

        if (response.data.success) {
            alert('수정이 완료되었습니다.');
            await resetForm();
            emit('data-updated');
        } else {
            alert('수정 실패: ' + response.data.message);
        }
    } catch (err) {
        console.error(err);
        alert('수정 중 오류 발생');
    }
};

const cancelEdit = () => {
    resetForm();
    emit('data-updated');
};
</script>

<style scoped>
/* 커스텀 스타일은 필요 시 작성 */
</style>
