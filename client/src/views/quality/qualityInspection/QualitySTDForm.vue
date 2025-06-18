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

        <!-- 입력 항목들 -->
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

            <div class="flex items-center space-x-2">
                <Checkbox v-model="isUnused" binary variant="filled" inputId="usage-checkbox" />
                <label for="usage-checkbox" class="text-lg">
                    {{ isUnused ? '수동' : '자동' }}
                </label>
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

const STDform = ref({
    qcr_code: '',
    inspection_item: '',
    range_top: '',
    range_bot: '',
    com_value: null,
    unit: null,
    note: '',
    check_method: '', // ✅ 추가
    regdate_from: null,
    regdate_to: null,
    is_used: 'F'
});

const isEditMode = computed(() => !!props.selectedData);

const isUnused = computed({
    get: () => STDform.value.is_used === 'T',
    set: val => STDform.value.is_used = val ? 'T' : 'F'
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

// const formatDateForDB = (date) => {
//     if (!date) return null;
//     if (date instanceof Date) {
//         const y = date.getFullYear();
//         const m = String(date.getMonth() + 1).padStart(2, '0');
//         const d = String(date.getDate()).padStart(2, '0');
//         return `${y}-${m}-${d}`;
//     }
//     return null;
// };

const resetForm = async () => {
    STDform.value = {
        qcr_code: '',
        inspection_item: '',
        range_top: '',
        range_bot: '',
        com_value: null,
        unit: null,
        note: '',
        check_method: '', // ✅ 추가
        regdate_from: null,
        regdate_to: null,
        is_used: 'F'
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
            check_method: data.check_method || '', // ✅ 추가
            regdate_from: data.regdate_from ? new Date(data.regdate_from) : null,
            regdate_to: data.regdate_to ? new Date(data.regdate_to) : null,
            is_used: data.is_used || 'F'
        };
    } else {
        resetForm();
    }
}, { immediate: true });

// 수정된 registerQCR 함수
const registerQCR = async () => {
    try {
        // 더 엄격한 유효성 검사
        if (!STDform.value.inspection_item?.trim()) {
            alert('검사항목은 필수 입력입니다.');
            return;
        }
        
        if (!STDform.value.range_top || !STDform.value.range_bot) {
            alert('기준(상한/하한)은 필수 입력입니다.');
            return;
        }
        
        // 숫자 형태 검증
        if (isNaN(Number(STDform.value.range_top)) || isNaN(Number(STDform.value.range_bot))) {
            alert('기준값은 숫자로 입력해주세요.');
            return;
        }
        
        if (!STDform.value.com_value) {
            alert('품목유형을 선택해주세요.');
            return;
        }

        const today = new Date();

        const submitData = {
            qcr_code: STDform.value.qcr_code || '',
            inspection_item: STDform.value.inspection_item.trim(),
            range_top: Number(STDform.value.range_top), // 숫자로 변환
            range_bot: Number(STDform.value.range_bot), // 숫자로 변환
            unit: STDform.value.unit || '', // null 대신 빈 문자열
            note: STDform.value.note?.trim() || '',
            check_method: STDform.value.check_method?.trim() || '',
            regdate: formatDateForDB(STDform.value.regdate_from) || formatDateForDB(today),
            com_value: STDform.value.com_value || '', // null 대신 빈 문자열
            is_used: STDform.value.is_used || 'F'
        };

        console.log('등록 요청 데이터:', submitData);

        const response = await axios.post('/api/qcr/register', submitData, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10초 타임아웃
        });

        if (response.data.success) {
            alert(`✅ 등록 성공! 생성된 코드: ${response.data.qcr_codes.join(', ')}`);
            await resetForm();
            emit('data-updated');
        } else {
            alert('❌ 등록 실패: ' + (response.data.message || '서버 응답 없음'));
        }
    } catch (err) {
        console.error('❗ 등록 중 오류 발생:', err);
        
        // 더 자세한 에러 정보
        if (err.response) {
            // 서버가 응답했지만 에러 상태 코드
            const status = err.response.status;
            const message = err.response.data?.message || err.response.statusText;
            alert(`🚨 서버 오류 (${status}): ${message}`);
            console.error('서버 응답:', err.response.data);
        } else if (err.request) {
            // 요청은 보냈지만 응답이 없음
            alert('🚨 서버 연결 실패: 네트워크를 확인해주세요.');
            console.error('요청 정보:', err.request);
        } else {
            // 요청 설정 중 오류
            alert('🚨 요청 설정 오류: ' + err.message);
        }
    }
};

// 수정된 updateEquipment 함수
const updateEquipment = async () => {
    try {
        // 더 엄격한 유효성 검사
        if (!STDform.value.inspection_item?.trim()) {
            alert('검사항목은 필수 입력입니다.');
            return;
        }
        
        if (!STDform.value.range_top || !STDform.value.range_bot) {
            alert('기준(상한/하한)은 필수 입력입니다.');
            return;
        }
        
        // 숫자 형태 검증
        if (isNaN(Number(STDform.value.range_top)) || isNaN(Number(STDform.value.range_bot))) {
            alert('기준값은 숫자로 입력해주세요.');
            return;
        }

        const submitData = {
            qcr_code: STDform.value.qcr_code,
            inspection_item: STDform.value.inspection_item.trim(),
            range_top: Number(STDform.value.range_top),
            range_bot: Number(STDform.value.range_bot),
            unit: STDform.value.unit || '',
            note: STDform.value.note?.trim() || '',
            check_method: STDform.value.check_method?.trim() || '',
            regdate: formatDateForDB(STDform.value.regdate_from) || formatDateForDB(new Date()),
            com_value: STDform.value.com_value || '',
            is_used: STDform.value.is_used || 'F'
        };

        console.log('수정 요청 데이터:', submitData);

        // API 엔드포인트 통일 (qcr로 변경)
        const response = await axios.put(`/api/qcr/${STDform.value.qcr_code}`, submitData, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        if (response.data.success) {
            alert('✅ 수정이 완료되었습니다.');
            await resetForm();
            emit('data-updated');
        } else {
            alert('❌ 수정 실패: ' + (response.data.message || '서버 응답 없음'));
        }
    } catch (err) {
        console.error('❗ 수정 중 오류 발생:', err);
        
        if (err.response) {
            const status = err.response.status;
            const message = err.response.data?.message || err.response.statusText;
            alert(`🚨 서버 오류 (${status}): ${message}`);
            console.error('서버 응답:', err.response.data);
        } else if (err.request) {
            alert('🚨 서버 연결 실패: 네트워크를 확인해주세요.');
        } else {
            alert('🚨 요청 설정 오류: ' + err.message);
        }
    }
};

// 개선된 날짜 포맷 함수
const formatDateForDB = (date) => {
    if (!date) return null;
    
    try {
        let dateObj;
        if (date instanceof Date) {
            dateObj = date;
        } else if (typeof date === 'string') {
            dateObj = new Date(date);
        } else {
            return null;
        }
        
        // 유효한 날짜인지 확인
        if (isNaN(dateObj.getTime())) {
            return null;
        }
        
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    } catch (error) {
        console.error('날짜 포맷 오류:', error);
        return null;
    }
};
</script>

<style scoped>
/* 필요 시 커스텀 스타일 작성 */
</style>
