<template>
    <div class="card space-y-4 p-6" style="width: 50%">
        <!-- 제목 -->
        <div class="grid grid-cols-1 gap-4 mb-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">
                        {{ isEditMode ? '품질검사결과 수정' : '품질검사결과 등록' }}
                    </div>
                    <div v-if="isEditMode" class="text-sm text-blue-600 mt-1">
                        선택된 검사결과: {{ qirForm.qir_code }}
                    </div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button v-if="isEditMode" label="취소" severity="secondary" class="min-w-fit whitespace-nowrap"
                        outlined @click="cancelEdit" />
                    <Button v-if="isEditMode" label="수정" severity="info" class="min-w-fit whitespace-nowrap"
                        @click="updateQir" />
                    <Button v-if="!isEditMode" label="등록" severity="success" class="min-w-fit whitespace-nowrap"
                        @click="saveQir" />
                </div>
            </div>
        </div>

        <!-- 검사결과코드 / 검사지시코드 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">검사결과코드</label>
                <InputText v-model="qirForm.qir_code" type="text" placeholder="자동 생성" :disabled="true" class="w-full" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">검사지시코드</label>
                <InputText v-model="qirForm.qio_code" type="text" placeholder="검사지시코드" :disabled="true"
                    class="w-full" />
            </div>
        </div>

        <!-- 시작일시 / 종료일시 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <LabeledDatePicker v-model="qirForm.start_date" label="시작일시" placeholder="날짜를 선택" :showTime="true" />
            </div>
            <div>
                <LabeledDatePicker v-model="qirForm.end_date" label="종료일시" placeholder="날짜를 선택" :showTime="true" />
            </div>
        </div>

        <!-- 품질기준항목 / 결과 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">품질기준항목</label>
                <InputText v-model="qirForm.inspection_item" type="text" placeholder="검사항목 입력" class="w-full" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">결과</label>
                <Dropdown v-model="qirForm.result" :options="resultOptions" optionLabel="label" optionValue="value"
                    placeholder="결과 선택" class="w-full" />
            </div>
        </div>

        <!-- 불량수량 / 합격수량 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">불량수량</label>
                <InputText v-model="qirForm.unpass_qtt" type="number" placeholder="불량수량 입력" class="w-full" />
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">합격수량</label>
                <InputText v-model="qirForm.pass_qtt" type="number" placeholder="합격수량 입력" class="w-full" />
            </div>
        </div>

        <!-- 불량률 / 검사자 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">불량률(%)</label>
                <InputText v-model="qirForm.unpass_rate" type="number" placeholder="자동 계산됨" :disabled="true"
                    class="w-full" />
                <!-- ↑ disabled로 사용자가 직접 수정 못하게 함 -->
            </div>
            <div>
                <label class="font-semibold text-xl block mb-2">검사자</label>
                <InputText v-model="qirForm.qir_emp_name" type="text" placeholder="검사자명 입력" class="w-full" />
            </div>
        </div>

        <!-- 비고 -->
        <div class="grid grid-cols-1 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">비고</label>
                <InputText v-model="qirForm.note" type="text" placeholder="비고 입력" class="w-full" />
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

// 설비 폼 데이터
const qirForm = ref({
    qir_code: '',
    start_date: null,
    end_date: null,
    unpass_qtt: '',
    pass_qtt: '',
    unpass_rate: '',
    result: '',
    note: '',
    qio_code: '',
    qir_emp_name: '',
    inspection_item: ''
});

// 수정 모드 여부 계산
const isEditMode = computed(() => {
    return props.selectedData !== null && props.selectedData !== undefined;
});

// checkbox
const isUnused = computed({
    get() {
        // is_used가 'f1'이면 체크박스가 선택됨 (미사용)
        return qirForm.value.is_used === 'f1';
    },
    set(value) {
        // 체크박스가 선택되면(true) is_used는 'f1' (미사용)
        // 체크박스가 해제되면(false) is_used는 'f2' (사용)
        qirForm.value.is_used = value ? 'f1' : 'f2';
    }
});

// 폼 초기화 함수
const resetForm = async () => {
    qirForm.value = {
        qir_code: '',
        start_date: null,
        end_date: null,
        unpass_qtt: '',
        pass_qtt: '',
        unpass_rate: '',
        result: '',
        note: '',
        qio_code: '',
        qir_emp_name: '',
        inspection_item: ''
    };

    await nextTick();
};

// 선택된 데이터 변경 감지 (테이블에서 행 선택 시)
watch(
    () => props.selectedData,
    (newData) => {
        if (newData) {
            console.log('실제 QIR 데이터 받음:', newData);
            qirForm.value = {
                qir_code: newData.qir_code || '',
                start_date: newData.start_date ? new Date(newData.start_date) : null,
                end_date: newData.end_date ? new Date(newData.end_date) : null,
                unpass_qtt: newData.unpass_qtt || '',
                pass_qtt: newData.pass_qtt || '',
                unpass_rate: newData.unpass_rate || '',
                result: newData.result || '',
                note: newData.note || '',
                qio_code: newData.qio_code || '',
                qir_emp_name: newData.qir_emp_name || '',
                inspection_item: newData.inspection_item || ''
            };
        } else {
            resetForm();
        }
    },
    { immediate: true }
);

watch([() => qirForm.value.unpass_qtt, () => qirForm.value.pass_qtt], ([unpass, pass]) => {
    try {
        // 입력값 검증 및 변환
        const unpassNum = Math.max(0, parseInt(unpass) || 0);  // 음수 방지
        const passNum = Math.max(0, parseInt(pass) || 0);      // 음수 방지
        const total = unpassNum + passNum;

        if (total > 0) {
            const rate = (unpassNum / total) * 100;
            qirForm.value.unpass_rate = rate.toFixed(1);  // 1.0, 2.5 이런식으로
            console.log(`불량률 계산: ${unpassNum}/${total} = ${rate.toFixed(1)}%`);
        } else {
            qirForm.value.unpass_rate = '';
            console.log('전체 수량이 0이므로 불량률 계산 안함');
        }
    } catch (error) {
        console.error('불량률 계산 실패:', error);
        qirForm.value.unpass_rate = '';
    }
});

const resultOptions = [
    { label: '합격', value: 'g2' },
    { label: '불합격', value: 'g1' },
    { label: '조건부 합격', value: 'g3' }
];

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
    
    // 날짜만! YYYY-MM-DD 형식
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};

const parseDate = (dateString) => {
    if (!dateString) return null;
    
    try {
        if (typeof dateString === 'string') {
            // ISO 형식이나 MySQL 형식 모두 처리
            return new Date(dateString);
        } else if (dateString instanceof Date) {
            return dateString;
        }
        return null;
    } catch (error) {
        console.warn('날짜 파싱 실패:', dateString, error);
        return null;
    }
};

// 설비 등록 함수
const saveQir = async () => {
    try {
        // 📝 필수 데이터 검증
        if (!qirForm.value.qio_code) {
            alert('검사지시코드가 없어! 먼저 검사지시를 저장해줘 😅');
            return;
        }

        if (!qirForm.value.inspection_item) {
            alert('품질기준항목을 입력해줘! 🤔');
            return;
        }

        if (!qirForm.value.result) {
            alert('검사 결과를 선택해줘! ✨');
            return;
        }

        if (!qirForm.value.qir_emp_name) {
            alert('검사자를 입력해줘! 👨‍🔬');
            return;
        }

        console.log('💾 QIR 등록 시작...');
        
        const qirPayload = {
            qio_code: qirForm.value.qio_code,
            start_date: formatDateForDB(qirForm.value.start_date),
            end_date: formatDateForDB(qirForm.value.end_date),
            unpass_qtt: parseInt(qirForm.value.unpass_qtt) || 0,
            pass_qtt: parseInt(qirForm.value.pass_qtt) || 0,
            unpass_rate: parseFloat(qirForm.value.unpass_rate) || 0,
            result: qirForm.value.result,
            note: qirForm.value.note || '',
            qir_emp_name: qirForm.value.qir_emp_name,
            inspection_item: qirForm.value.inspection_item
        };

        console.log('📤 등록할 QIR 데이터:', qirPayload);

        const response = await axios.post('/api/qcr/qir', qirPayload);

        if (response.data.success) {
            alert('QIR 등록이 완료되었어! 🎉');
            
            // ✅ 폼 초기화를 먼저 하고
            await resetForm();
            
            // ✅ 그 다음에 부모에게 데이터 업데이트 알림
            // 약간의 딜레이를 주어서 UI가 제대로 업데이트되도록 함
            setTimeout(() => {
                emit('data-updated');
            }, 100);
            
            console.log('✅ QIR 등록 완료 및 데이터 새로고침 요청');
        } else {
            alert('QIR 등록에 실패했어 ㅠㅠ');
        }
    } catch (error) {
        console.error('💥 QIR 등록 실패:', error);
        alert('QIR 등록 중 오류가 발생했어! 😭\n' + (error.response?.data?.message || error.message));
    }
};

const validateQirData = (data) => {
    const errors = [];
    
    if (!data.qio_code) errors.push('검사지시코드');
    if (!data.inspection_item) errors.push('품질기준항목');
    if (!data.result) errors.push('검사결과');
    if (!data.qir_emp_name) errors.push('검사자');
    
    if (errors.length > 0) {
        alert(`다음 필드를 입력해주세요: ${errors.join(', ')} 😅`);
        return false;
    }
    
    return true;
};

// 설비 수정 함수
const updateQir = async () => {
    try {
        // 검증 로직 동일...
        
        const response = await axios.put(`/api/qcr/qir/${qirForm.value.qir_code}`, updatePayload);

        if (response.data.success) {
            alert('QIR 수정이 완료되었어! 🎉');
            
            // ✅ 폼 초기화를 먼저 하고
            await resetForm();
            
            // ✅ 부모에게 데이터 업데이트 알림 (딜레이 적용)
            setTimeout(() => {
                emit('data-updated');
            }, 100);
            
            console.log('✅ QIR 수정 완료 및 데이터 새로고침 요청');
        } else {
            alert('QIR 수정에 실패했어 ㅠㅠ');
        }
    } catch (error) {
        console.error('💥 QIR 수정 실패:', error);
        alert('QIR 수정 중 오류가 발생했어! 😭');
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