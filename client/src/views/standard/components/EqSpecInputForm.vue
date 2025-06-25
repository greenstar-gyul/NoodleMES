<template>
    <!-- 우측: 제품 등록 영역 (45%) -->
    <div class="card space-y-6 p-6" style="width: 45%">
        <!-- 버튼 영역역 -->
        <div class="grid grid-cols-1 gap-4 mb-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">검사정보</div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button v-if="isEditMode" label="취소" severity="secondary" class="min-w-fit whitespace-nowrap"
                        outlined @click="cancelEdit" />
                    <Button v-if="isEditMode" label="수정" severity="info" class="min-w-fit whitespace-nowrap"
                        @click="updateEqChkType" />
                    <Button v-if="!isEditMode" label="등록" severity="success" class="min-w-fit whitespace-nowrap"
                        @click="saveEqiChkType" />
                </div>
            </div>
        </div>
        <!-- 점검항목코드 / 항목명 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">점검항목코드</label>
                <InputText v-model="ectForm.chk_type_code" type="text" placeholder="제품코드" :disabled="true" class="w-full" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">설비유형</label>
                <Dropdown v-model="ectForm.eq_type" :options="eqTypeOptions" optionLabel="label" optionValue="value"
                    placeholder="유형 선택" class="w-full" />
            </div>
        </div>

        <!-- 항목명 / 점검방법 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">항목명</label>
                <InputText v-model="ectForm.chk_text" type="text" class="w-full" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">점검방법</label>
                <InputText v-model="ectForm.chk_mth" type="text" class="w-full" />
            </div>
        </div>

        <!-- 기준값(상한) / 기준값(하한) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">기준값(상한)</label>
                <InputText v-model="ectForm.range_top" type="text" class="w-full" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">기준값(하한)</label>
                <InputText v-model="ectForm.range_bot" type="text" class="w-full" />
            </div>
        </div>

        <!-- 단위 / 등록일자 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">단위</label>
                <Dropdown v-model="ectForm.unit" :options="unitOptions" optionLabel="label" optionValue="value"
                placeholder="단위 선택" class="w-full" />
            </div>
            <div>
                <LabeledDatePicker v-model="ectForm.regdate" label="등록일자" placeholder="날짜를 선택" :disabled="true" />
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">판정방식</label>
                <InputText v-model="ectForm.jdg_mth" type="text" class="w-full" />
            </div>
        </div>
        
        <!-- 비고 -->
        <div>
            <label class="font-semibold text-xl block mb-2">비고</label>
            <Textarea v-model="ectForm.note" placeholder="특이사항 입력" :autoResize="true" rows="4" class="w-full" />
        </div>
    </div>
    <!-- <SinglePopup v-model:visible="dialogVisible" :items="clients" @confirm="handleConfirm" :mapper="clientMapper" -->
        <!-- :dataKey="'client_code'"></SinglePopup> -->
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

// 설비점검기준정보 폼 데이터
const ectForm = ref({
    chk_type_code: '',
    eq_type: '',
    chk_text: '',
    chk_mth: '',
    range_top: '',
    range_bot: '',
    unit: '',
    jdg_mth: '',
    regdate: new Date(),
    crrdate: '',
    note: ''
});

// 수정 모드 여부 계산
const isEditMode = computed(() => {
    return props.selectedData !== null && props.selectedData !== undefined;
});

const eqTypeOptions = [
    { label: '배합기', value: 'MIX' },
    { label: '숙성기', value: 'REM' },
    { label: '압연기', value: 'ROP' },
    { label: '절단기', value: 'CUT' },
    { label: '성형기', value: 'SHM' },
    { label: '증숙기', value: 'STM' },
    { label: '튀김기', value: 'FRY' },
    { label: '건조기', value: 'DRY' },
    { label: '냉각기', value: 'COO' },
    { label: '스프계량기', value: 'SDP' },
    { label: '충전기', value: 'FIL' },
    { label: '포장기', value: 'PCK' },
    { label: '인쇄기', value: 'INK' },
    { label: '중량 선별기', value: 'WEI' },
    { label: '박스포장기', value: 'CTN' },
    { label: '출하설비', value: 'CVY' }
];

const unitOptions = [
    { label: 'kg', value: 'h1' },
    { label: 't', value: 'h2' },
    { label: 'L', value: 'h3' },
    { label: 'ea', value: 'h4' },
    { label: 'box', value: 'h5' },
    { label: 'g', value: 'h6' },
    { label: 'mm', value: 'h7' },
    { label: '%', value: 'h8' },
    { label: 'cm', value: 'h9' },
    { label: 'N', value: 'ha' },
    { label: 'mg', value: 'hb' },
    { label: 'ml', value: 'hc' }
];

// 폼 초기화 함수
const resetForm = async () => {
    ectForm.value = {
        chk_type_code: '',
        eq_type: '',
        chk_text: '',
        chk_mth: '',
        range_top: '',
        range_bot: '',
        unit: '',
        jdg_mth: '',
        regdate: new Date(),
        note: ''
    };

    await nextTick();
};

// 선택된 데이터 변경 감지 (테이블에서 행 선택 시)
watch(
    () => props.selectedData,
    (newData) => {
        if (newData) {
            // console.log('📝 선택된 데이터를 폼에 설정:', newData);
            // 선택된 데이터를 폼에 채우기
            ectForm.value = {
                chk_type_code: newData.chk_type_code || '',
                eq_type: newData.eq_type || '',
                chk_text: newData.chk_text || '',
                chk_mth: newData.chk_mth || '',
                range_top: newData.range_top || '',
                range_bot: newData.range_bot || '',
                unit: newData.unit || '',
                jdg_mth: newData.jdg_mth || '',
                regdate: newData.regdate ? new Date(newData.regdate) : null,
                note: newData.note || ''
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

// 설비 등록 함수
const saveEqiChkType = async () => {
    try {
        // console.log('설비점검항목 등록:', ectForm.value);

        // 필수 필드 검증
        if (!ectForm.value.eq_type || !ectForm.value.chk_text) {
            alert('항목명은 필수입니다.');
            return;
        }

        const submitData = {
            ...ectForm.value,
            range_top: ectForm.value.range_top ? parseFloat(ectForm.value.range_top) : null,  // 숫자 변환
            range_bot: ectForm.value.range_bot ? parseFloat(ectForm.value.range_bot) : null,
            regdate: formatDateForDB(new Date())
        };


        const response = await axios.post('/api/eqichk', submitData);

        if (response.data.success) {
            // console.log('점검항목 등록 완료');
            alert('점검항목가 성공적으로 등록되었습니다.');
            await resetForm();
            emit('data-updated'); // 부모에게 데이터 업데이트 알림
        } else {
            // console.error('등록 실패:', response.data.error);
            alert('점검항목 등록에 실패했습니다.');
        }
    } catch (error) {
        // console.error('점검항목 등록 실패:', error);
        alert('점검항목 등록 중 오류가 발생했습니다.');
    }
};

// 점검항목 수정 함수
const updateEqChkType = async () => {
    try {
        // console.log('점검항목 수정:', ectForm.value);

        // 필수 필드 검증
        if (!ectForm.value.chk_text) {
            alert('항목명은 필수입니다.');
            return;
        }

        const submitData = {
            ...ectForm.value,
            range_top: ectForm.value.range_top ? parseFloat(ectForm.value.range_top) : null,  // 숫자 변환
            range_bot: ectForm.value.range_bot ? parseFloat(ectForm.value.range_bot) : null,
            regdate: formatDateForDB(ectForm.value.regdate) || formatDateForDB(new Date()),
            crrdate: formatDateForDB(new Date())
        };


        const response = await axios.put(`/api/eqichk/${ectForm.value.chk_type_code}`, submitData);

        if (response.data.success) {
            // console.log('점검항목 수정 완료');
            alert('점검항목이 성공적으로 수정되었습니다.');
            await resetForm();
            emit('data-updated'); // 부모에게 데이터 업데이트 알림
        } else {
            // console.error('수정 실패:', response.data.error);
            alert('점검항목 수정에 실패했습니다.');
        }
    } catch (error) {
        // console.error('점검항목 수정 실패:', error);
        alert('점검항목 수정 중 오류가 발생했습니다.');
    }
};

// 수정 취소 함수
const cancelEdit = () => {
    // console.log('수정 취소');
    emit('data-updated'); // 부모에서 선택 해제하도록 알림
};

const handleReset = async () => {
    // console.log('🔄 부모로부터 초기화 신호 받음!');
    await resetForm();
};

defineExpose({
    resetForm: handleReset
});

</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>
