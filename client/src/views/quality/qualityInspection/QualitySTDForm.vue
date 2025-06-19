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
                    <Button v-if="isEditMode" label="취소" severity="secondary" class="min-w-fit whitespace-nowrap" outlined @click="cancelEdit" />
                    <Button v-if="isEditMode" label="수정" severity="info" class="min-w-fit whitespace-nowrap" @click="updateEquipment" />
                    <Button v-if="!isEditMode" label="등록" severity="success" class="min-w-fit whitespace-nowrap" @click="registerQCR" />
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">품질기준코드</label>
                <InputText v-model="STDform.qcr_code" type="text" placeholder="자동 생성" class="w-full" disabled />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">검사항목</label>
                <InputText v-model="STDform.inspection_item" type="text" placeholder="검사항목 입력" class="w-full" />
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
import axios from 'axios';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import LabeledDatePicker from '../../../components/common/LabeledDatePicker.vue';

const props = defineProps({
    selectedData: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['data-updated']);

const STDform = ref({
    qcr_code: '',
    inspection_item: '',
    range_top: '',
    range_bot: '',
    com_value: null,
    unit: null,
    note: '',
    check_method: '',
    regdate_from: null,
    regdate_to: null,
});

const isEditMode = computed(() => !!props.selectedData);

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
    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return null;
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    } catch {
        return null;
    }
};

const resetForm = async () => {
    STDform.value = {
        qcr_code: '',
        inspection_item: '',
        range_top: '',
        range_bot: '',
        com_value: null,
        unit: null,
        note: '',
        check_method: '',
        regdate_from: null,
        regdate_to: null,
    };
    await nextTick();
};

watch(() => props.selectedData, (data) => {
    if (data) {
        STDform.value = {
            qcr_code: data.qcr_code || '',
            inspection_item: data.inspection_item || '',
            range_top: data.range_top || '',
            range_bot: data.range_bot || '',
            com_value: data.com_value || null,
            unit: data.unit || null,
            note: data.note || '',
            check_method: data.check_method || '',
            regdate_from: data.regdate_from ? new Date(data.regdate_from) : null,
            regdate_to: data.regdate_to ? new Date(data.regdate_to) : null,
        };
    } else {
        resetForm();
    }
}, { immediate: true });

const registerQCR = async () => {
    // 등록 로직 (생략 가능)
    emit('data-updated');
};

const updateEquipment = async () => {
    // 수정 로직 (생략 가능)
    emit('data-updated');
};

const cancelEdit = () => {
    resetForm();
    emit('data-updated');
};
</script>

<style scoped>
</style>