<template>
    <!-- 우측: 모델 등록/수정 영역 (45%) -->
    <div class="card space-y-6 p-6" style="width: 45%">
        <!-- 버튼 영역 -->
        <div class="grid grid-cols-1 gap-4 mb-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">
                        {{ isEditMode ? '수정' : '등록' }}
                    </div>
                    <div v-if="isEditMode" class="text-sm text-blue-600 mt-1">
                        선택된 행: {{ eqForm.prod_code }}
                    </div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button v-if="isEditMode" label="취소" severity="secondary" class="min-w-fit whitespace-nowrap"
                        outlined @click="cancelEdit" />
                    <Button v-if="isEditMode" label="수정" severity="info" class="min-w-fit whitespace-nowrap"
                        @click="updateEquipment" />
                    <Button v-if="!isEditMode" label="등록" severity="success" class="min-w-fit whitespace-nowrap"
                        @click="saveEquipment" />
                </div>
            </div>
        </div>

        <!-- 설비코드 / 모델명 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">품질기준코드</label>
                <InputText v-model="eqForm.prod_code" type="text" placeholder="자동 생성" :disabled="true" class="w-full" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">검사대상</label>
                <Dropdown v-model="eqForm.eq_type" :options="TypeOptions" optionLabel="label" optionValue="value"
                    placeholder="유형 선택" class="w-full" />
            </div>
        </div>

        <!-- 모델명 / 제조사 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">기준(상한)</label>
                <InputText v-model="eqForm.range_top" type="text" placeholder="기준치 입력" class="w-full" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">검사항목</label>
                <InputText v-model="eqForm.inspection_item" type="text" placeholder="검사항목 입력" class="w-full" />
            </div>
        </div>

        <!-- 용량 / 등록일자 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">기준(하한)</label>
                <InputText v-model="eqForm.range_bot" type="text" placeholder="기준치 입력" class="w-full" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">단위</label>
                <Dropdown v-model="eqForm.unit" :options="eqTypeOptions" optionLabel="label" optionValue="value"
                    placeholder="유형 선택" class="w-full" />
            </div>
        </div>

        <!-- 용량 / 등록일자 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <LabeledDatePicker :key="`regdate_from_${isEditMode}_${eqForm.prod_code}`" v-model="eqForm.regdate_from"
                    label="등록일자" placeholder="날짜를 선택" :disabled="false" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">판정방식</label>
                <Checkbox v-model="isUnused" binary variant="filled" inputId="usage-checkbox" />
                <label for="usage-checkbox" class="text-lg">
                {{ isUnused ? ' 수동' : ' 자동' }}
            </label>
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">비고</label>
                <InputText v-model="eqForm.note" type="text" placeholder="" class="w-full" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, defineProps, defineEmits, nextTick } from 'vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
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

// 모델 폼 데이터
const eqForm = ref({
    prod_code: '',
    prod_name: '',
    regdate_from: '',
    regdate_to: '',
    is_used: ''
});

// 수정 모드 여부 계산
const isEditMode = computed(() => {
    return props.selectedData !== null && props.selectedData !== undefined;
});

// checkbox
const isUnused = computed({
    get() {
        // is_used가 'f1'이면 체크박스가 선택됨 (미사용)
        return eqForm.value.is_used === 'f1';
    },
    set(value) {
        // 체크박스가 선택되면(true) is_used는 'f1' (미사용)
        // 체크박스가 해제되면(false) is_used는 'f2' (사용)
        eqForm.value.is_used = value ? 'f1' : 'f2';
    }
});

const TypeOptions = [
    { label: '배합기', value: 'MIX' },
    { label: '숙성기', value: 'REM' },
    { label: '압연기', value: 'ROP' },
    { label: '절단기', value: 'CUT' },
    { label: '성형기', value: 'SHM' },
];

// 단위
const eqTypeOptions = [
    { label: '단위1', value: 'EA' },
    { label: '단위1', value: 'EA' },
    { label: '단위1', value: 'EA' },
    { label: '단위1', value: 'EA' },
    { label: '단위1', value: 'EA' },
];

// 폼 초기화 함수
const resetForm = async () => {
    eqForm.value = {
        prod_code: '',
        prod_name: '',
        regdate_from: null,
        regdate_to: null,
        is_used: 'f2',
    };

    await nextTick();
};

// 선택된 데이터 변경 감지 (테이블에서 행 선택 시)
watch(
    () => props.selectedData,
    (newData) => {
        if (newData) {
            console.log('📝 선택된 데이터를 폼에 설정:', newData);
            // 선택된 데이터를 폼에 채우기
            eqForm.value = {
                prod_code: newData.prod_code || '',
                prod_name: newData.prod_name || '',
                regdate_from: newData.regdate_from ? new Date(newData.regdate_from) : null,
                regdate_to: newData.regdate_to ? new Date(newData.regdate_to) : null,
                is_used: newData.is_used || 'f2'
            };
        } else {
            // 선택 해제 시 폼 초기화
            resetForm();
        }
    },
    { immediate: true }
);

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

// 모델 등록 함수
const saveEquipment = async () => {
    try {
        console.log('모델 등록:', eqForm.value);

        // 필수 필드 검증
        if (!eqForm.value.eq_type || !eqForm.value.prod_name) {
            alert('모델명은 필수 항목입니다.');
            return;
        }

        const submitData = {
            ...eqForm.value,
            regdate_from: formatDateForDB(eqForm.value.regdate_from) || formatDateForDB(new Date()),
            regdate_to: formatDateForDB(eqForm.value.regdate_to) || formatDateForDB(new Date()),
            is_used: eqForm.value.is_used
        };


        const response = await axios.post('/api/eq', submitData);

        if (response.data.success) {
            console.log('등록 완료');
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

// 모델 수정 함수
const updateEquipment = async () => {
    try {
        console.log('수정:', eqForm.value);

        // 필수 필드 검증
        if (!eqForm.value.prod_name) {
            alert('코드명은 필수입니다.');
            return;
        }

        const submitData = {
            ...eqForm.value,
            regdate_from: formatDateForDB(eqForm.value.regdate_from) || formatDateForDB(new Date()),
            regdate_to: formatDateForDB(eqForm.value.regdate_to) || formatDateForDB(new Date()),
            is_used: eqForm.value.is_used
        };


        const response = await axios.put(`/api/eq/${eqForm.value.prod_code}`, submitData);

        if (response.data.success) {
            console.log('모델 수정 완료');
            alert('모델명이 성공적으로 수정되었습니다.');
            await resetForm();
            emit('data-updated'); // 부모에게 데이터 업데이트 알림
        } else {
            console.error('수정 실패:', response.data.error);
            alert('모델 수정에 실패했습니다.');
        }
    } catch (error) {
        console.error('모델 수정 실패:', error);
        alert('모델 수정 중 오류가 발생했습니다.');
    }
};

// 수정 취소 함수
const cancelEdit = () => {
    console.log('수정 취소');
    emit('data-updated'); // 부모에서 선택 해제하도록 알림
};
</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>