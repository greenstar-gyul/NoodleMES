<template>
    <!-- 우측: 설비 등록/수정 영역 (45%) -->
    <div class="card space-y-6 p-6" style="width: 45%">
        <!-- 버튼 영역 -->
        <div class="grid grid-cols-1 gap-4 mb-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">
                        {{ isEditMode ? '점검항목 수정' : '점검항목 등록' }}
                    </div>
                    <div v-if="isEditMode" class="text-sm text-blue-600 mt-1">
                        선택된 점검항목: {{ eqForm.eq_code }}
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

        <!-- 설비코드 / 설비명 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">점검항목코드</label>
                <InputText v-model="eqForm.eq_code" type="text" placeholder="설비코드" :disabled="isEditMode"
                    class="w-full" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">설비유형</label>
                <InputText v-model="eqForm.eq_name" type="text" placeholder="설비명 입력" class="w-full" />
            </div>
        </div>

        <!-- 모델명 / 제조사 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">항목명</label>
                <InputText v-model="eqForm.eq_model" type="text" placeholder="모델명 입력" class="w-full" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">점검방법</label>
                <InputText v-model="eqForm.eq_maker" type="text" placeholder="제조사명 입력" class="w-full" />
            </div>
        </div>

        <!-- 용량 / 등록일자 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">기준값</label>
                <InputText v-model="eqForm.capacity" type="number" placeholder="용량 입력" class="w-full" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">단위</label>
                <InputText v-model="eqForm.chk_cycle" type="number" placeholder="점검주기 입력" class="w-full" />
            </div>
        </div>

        <!-- 제조일자 / 점검주기 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <LabeledDatePicker v-model="eqForm.eq_make_date" label="제조일자" placeholder="날짜를 선택" :disabled="false" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">점검주기</label>
                <InputText v-model="eqForm.chk_cycle" type="number" placeholder="점검주기 입력" class="w-full" />
            </div>
        </div>

        <!-- 인계일자 / 설비유형 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <LabeledDatePicker v-model="eqForm.bring_date" label="도입일자" placeholder="날짜를 선택" :disabled="false" />
            </div>
            
            <div>
                <LabeledDatePicker v-model="eqForm.reg_date" label="등록일자" placeholder="날짜를 선택" :disabled="false" />
            </div>
        </div>

        <!-- 설치위치 / 사용여부 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">설치위치</label>
                <InputText v-model="eqForm.eq_pos" type="text" placeholder="설치위치 입력" class="w-full" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">사용여부</label>
                <Dropdown v-model="eqForm.is_used" :options="statusOptions" optionLabel="label" optionValue="value"
                    placeholder="사용여부 선택" class="w-full" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, defineProps, defineEmits } from 'vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
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

// 설비 폼 데이터
const eqForm = ref({
    eq_code: '',
    eq_name: '',
    eq_model: '',
    eq_maker: '',
    capacity: '',
    stat: '',
    chk_cycle: '',
    eq_make_date: '',
    bring_date: '',
    take_date: '',
    eq_pos: '',
    eq_type: '',
    is_used: ''
});

// 수정 모드 여부 계산
const isEditMode = computed(() => {
    return props.selectedData !== null && props.selectedData !== undefined;
});

// 사용여부 옵션들
const statusOptions = [
    { label: '아니요/미사용', value: 'f1' },
    { label: '예/사용', value: 'f2' },
    { label: '전체', value: '' }
];

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

// 폼 초기화 함수
const resetForm = () => {
    eqForm.value = {
        eq_code: '',
        eq_name: '',
        eq_model: '',
        eq_maker: '',
        capacity: '',
        stat: '',
        reg_date: null,
        eq_make_date: null,
        bring_date: null,
        take_date: null,
        chk_cycle: '',
        eq_pos: '',
        eq_type: '',
        is_used: '',
    };
};

// 선택된 데이터 변경 감지 (테이블에서 행 선택 시)
watch(
    () => props.selectedData,
    (newData) => {
        if (newData) {
            console.log('📝 선택된 데이터를 폼에 설정:', newData);
            // 선택된 데이터를 폼에 채우기
            eqForm.value = {
                eq_code: newData.eq_code || '',
                eq_name: newData.eq_name || '',
                eq_model: newData.eq_model || '',
                eq_maker: newData.eq_maker || '',
                capacity: newData.capacity || '',
                stat: newData.stat || '',
                chk_cycle: newData.chk_cycle || '',
                eq_make_date: newData.eq_make_date ? new Date(newData.eq_make_date) : null,
                bring_date: newData.bring_date ? new Date(newData.bring_date) : null,
                take_date: newData.take_date ? new Date(newData.take_date) : null,
                eq_pos: newData.eq_pos || '',
                eq_type: newData.eq_type || '',
                is_used: newData.is_used || ''
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
        return date.toISOString().split('T')[0]; // YYYY-MM-DD 형태로 변환
    }
    return null;
};

// 설비 등록 함수
const saveEquipment = async () => {
    try {
        console.log('설비 등록:', eqForm.value);

        // 필수 필드 검증
        if (!eqForm.value.eq_code || !eqForm.value.eq_name) {
            alert('설비코드와 설비명은 필수입니다.');
            return;
        }

        const submitData = {
            ...eqForm.value,
            capacity: eqForm.value.capacity ? parseInt(eqForm.value.capacity) : null,  // 🎯 숫자 변환!
            chk_cycle: eqForm.value.chk_cycle ? parseInt(eqForm.value.chk_cycle) : null,  // 점검주기도 숫자일 수 있으니까
            eq_make_date: formatDateForDB(eqForm.value.eq_make_date) || new Date().toISOString().split('T')[0],
            bring_date: formatDateForDB(eqForm.value.bring_date) || new Date().toISOString().split('T')[0],
            take_date: formatDateForDB(eqForm.value.take_date) || new Date().toISOString().split('T')[0]
        };


        const response = await axios.post('/api/eq', submitData);

        if (response.data.success) {
            console.log('설비 등록 완료');
            alert('설비가 성공적으로 등록되었습니다.');
            resetForm();
            emit('data-updated'); // 부모에게 데이터 업데이트 알림
        } else {
            console.error('등록 실패:', response.data.error);
            alert('설비 등록에 실패했습니다.');
        }
    } catch (error) {
        console.error('설비 등록 실패:', error);
        alert('설비 등록 중 오류가 발생했습니다.');
    }
};

// 설비 수정 함수
const updateEquipment = async () => {
    try {
        console.log('설비 수정:', eqForm.value);

        // 필수 필드 검증
        if (!eqForm.value.eq_name) {
            alert('설비명은 필수입니다.');
            return;
        }

        const submitData = {
            ...eqForm.value,
            capacity: eqForm.value.capacity ? parseInt(eqForm.value.capacity) : null,  // 🎯 숫자 변환!
            chk_cycle: eqForm.value.chk_cycle ? parseInt(eqForm.value.chk_cycle) : null,  // 점검주기도 숫자일 수 있으니까
            eq_make_date: formatDateForDB(eqForm.value.eq_make_date) || new Date().toISOString().split('T')[0],
            bring_date: formatDateForDB(eqForm.value.bring_date) || new Date().toISOString().split('T')[0],
            take_date: formatDateForDB(eqForm.value.take_date) || new Date().toISOString().split('T')[0]
        };


        const response = await axios.put(`/api/eq/${eqForm.value.eq_code}`, submitData);

        if (response.data.success) {
            console.log('설비 수정 완료');
            alert('설비가 성공적으로 수정되었습니다.');
            emit('data-updated'); // 부모에게 데이터 업데이트 알림
        } else {
            console.error('수정 실패:', response.data.error);
            alert('설비 수정에 실패했습니다.');
        }
    } catch (error) {
        console.error('설비 수정 실패:', error);
        alert('설비 수정 중 오류가 발생했습니다.');
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