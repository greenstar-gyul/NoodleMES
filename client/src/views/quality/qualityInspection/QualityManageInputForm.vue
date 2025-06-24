<template>
    <div class="card space-y-4 p-6" >
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
                    <div v-if="!isEditMode && qirForm.qio_code" class="text-sm text-green-600 mt-1">
                        검사지시: {{ qirForm.qio_code }} (새 QIR 등록 모드)
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

        <!-- 🎯 품질기준항목 (텍스트박스 클릭으로 팝업) / 결과 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="font-semibold text-xl block mb-2">품질기준항목</label>
                <InputText 
                    v-model="qirForm.inspection_item" 
                    type="text" 
                    placeholder="클릭해서 검사항목 선택" 
                    class="w-full cursor-pointer" 
                    readonly
                    @click="openQcrPopup" 
                />
                <!-- 🎯 검사방법 표시 (선택된 항목의 검사방법) -->
                <div v-if="selectedQcrMethod" class="text-sm text-gray-600 mt-1">
                    검사방법: {{ selectedQcrMethod }}
                </div>
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

    <!-- 🎯 품질기준항목 선택 팝업 -->
    <QualitySinglePopup 
        v-model:visible="qcrPopupVisible" 
        :items="qcrPopupInfo" 
        @confirm="loadSelectedQcr"
        :selectedHeader="['inspection_item', 'check_method']" 
        :mapper="{
            inspection_item: '검사항목',
            check_method: '검사방법'
        }" 
        :dataKey="'inspection_item'" 
        :placeholder="'품질기준항목 선택'">
    </QualitySinglePopup>
</template>

<script setup>
import { ref, watch, computed, defineProps, defineEmits, nextTick } from 'vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import LabeledDatePicker from '../../../components/common/LabeledDatePicker.vue';
import QualitySinglePopup from './QualitySinglePopup.vue';
import axios from 'axios';

// Props 정의 (부모에서 선택된 데이터 받기)
const props = defineProps({
    selectedData: {
        type: Object,
        default: null
    }
});

// Emits 정의 (부모에게 이벤트 전달)
const emit = defineEmits(['data-updated', 'add-to-memory', 'update-in-memory']);

// QIR 폼 데이터
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
    inspection_item: '',
    qcr_code: ''
});

// 🎯 품질기준항목 팝업 관련
const qcrPopupVisible = ref(false);
const qcrPopupInfo = ref([]);
const selectedQcrMethod = ref(''); // 선택된 검사방법 표시용

// 🎯 수정 모드 여부 계산 (QIR 코드가 있고 임시코드가 아니면 수정모드)
const isEditMode = computed(() => {
    return props.selectedData && 
           props.selectedData.qir_code && 
           props.selectedData.qir_code !== '' &&
           !props.selectedData.qir_code.startsWith('QIR-TEMP-');
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
        inspection_item: '',
        qcr_code: ''
    };
    
    selectedQcrMethod.value = ''; // 검사방법도 초기화

    await nextTick();
};

// 🎯 QIO 코드 유지하고 폼 초기화
const resetFormKeepQio = async () => {
    const qioCode = qirForm.value.qio_code;
    await resetForm();
    qirForm.value.qio_code = qioCode;  // QIO 코드만 복원
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
                inspection_item: newData.inspection_item || '',
                qcr_code: newData.qcr_code || ''
            };
            
            // 🎯 검사방법도 복원 (기존 데이터에 있다면)
            selectedQcrMethod.value = newData.check_method || '';
        } else {
            resetForm();
        }
    },
    { immediate: true }
);

// 불량률 자동 계산
watch([() => qirForm.value.unpass_qtt, () => qirForm.value.pass_qtt], ([unpass, pass]) => {
    try {
        const unpassNum = Math.max(0, parseInt(unpass) || 0);
        const passNum = Math.max(0, parseInt(pass) || 0);
        const total = unpassNum + passNum;

        if (total > 0) {
            const rate = (unpassNum / total) * 100;
            qirForm.value.unpass_rate = rate.toFixed(1);
            console.log(`불량률 계산: ${unpassNum}/${total} = ${rate.toFixed(1)}%`);
        } else {
            qirForm.value.unpass_rate = '';
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

// 🎯 품질기준항목 데이터 로딩
const loadQcrData = async () => {
    try {
        console.log('🔍 품질기준항목 데이터 로딩 시작...');
        const response = await axios.get('/api/qlt/qio/qcr');

        console.log('🎯 QCR API 응답:', response.data);

        if (response.data && Array.isArray(response.data)) {
            qcrPopupInfo.value = response.data.map(item => ({
                qcr_code: item.qcr_code || '',
                inspection_item: item.inspection_item || '',
                check_method: item.check_method || ''
            }));
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
            // 다른 API 응답 구조일 경우
            qcrPopupInfo.value = response.data.data.map(item => ({
                qcr_code: item.qcr_code || '',
                inspection_item: item.inspection_item || '',
                check_method: item.check_method || ''
            }));
        } else {
            console.warn('❌ QCR 데이터 구조가 예상과 다름:', response.data);
            qcrPopupInfo.value = [];
        }

        console.log('✅ QCR 데이터 로딩 완료:', qcrPopupInfo.value.length, '건');
        
        // 🚨 데이터가 없으면 임시 데이터로 테스트
        if (qcrPopupInfo.value.length === 0) {
            console.log('🚨 QCR 데이터가 비어있어서 임시 데이터 주입!');
            qcrPopupInfo.value = [
                {
                    inspection_item: '외관검사',
                    check_method: '육안검사'
                },
                {
                    inspection_item: '치수검사',
                    check_method: '측정기구 사용'
                },
                {
                    inspection_item: '기능검사',
                    check_method: '성능 테스트'
                }
            ];
        }

    } catch (error) {
        console.error('💥 QCR 데이터 로딩 실패:', error);
        qcrPopupInfo.value = [
            {
                inspection_item: '외관검사',
                check_method: '육안검사'
            },
            {
                inspection_item: '치수검사',
                check_method: '측정기구 사용'
            }
        ];
    }
};

// 🎯 품질기준항목 팝업 열기
const openQcrPopup = async () => {
    console.log('🚀 품질기준항목 팝업 열기!');
    await loadQcrData();
    qcrPopupVisible.value = true;
};

// 🎯 품질기준항목 선택 처리
const loadSelectedQcr = (selectedItem) => {
    console.log('🎯 선택된 품질기준항목:', selectedItem);

    if (!selectedItem || !selectedItem.inspection_item) {
        alert('품질기준항목을 선택해줘! 🤔');
        return;
    }

    // 폼에 선택된 데이터 설정
    qirForm.value.inspection_item = selectedItem.inspection_item;
    selectedQcrMethod.value = selectedItem.check_method || '';
    qirForm.value.qcr_code = selectedItem.qcr_code || ''; // QCR 코드도 저장

    // 팝업 닫기
    qcrPopupVisible.value = false;

    console.log('✅ 품질기준항목 선택 완료!');
    console.log('- 검사항목:', qirForm.value.inspection_item);
    console.log('- 검사방법:', selectedQcrMethod.value);
};

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

const formatDateTimeForDB = (date) => {
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
    
    // 🎯 날짜+시간! YYYY-MM-DD HH:mm:ss 형식
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 🎯 QIR 등록 함수 (메모리 전용)
const saveQir = async () => {
    try {
        // 필수 데이터 검증
        if (!qirForm.value.qio_code) {
            alert('검사지시코드가 없어! 먼저 검사지시를 저장해줘 😅');
            return;
        }

        if (!qirForm.value.inspection_item) {
            alert('품질기준항목을 선택해줘! 🤔');
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

        console.log('💾 QIR 메모리 등록 시작...');
        
        // 🎯 새 QIR 코드 생성 (임시)
        const tempQirCode = `QIR-TEMP-${Date.now()}`;
        
        const newQirData = {
            qir_code: tempQirCode,  // 임시 코드
            qio_code: qirForm.value.qio_code,
            start_date: formatDateTimeForDB(qirForm.value.start_date),
            end_date: formatDateTimeForDB(qirForm.value.end_date),
            unpass_qtt: parseInt(qirForm.value.unpass_qtt) || 0,
            pass_qtt: parseInt(qirForm.value.pass_qtt) || 0,
            unpass_rate: parseFloat(qirForm.value.unpass_rate) || 0,
            result: qirForm.value.result,
            note: qirForm.value.note || '',
            qir_emp_name: qirForm.value.qir_emp_name,
            inspection_item: qirForm.value.inspection_item,
            check_method: selectedQcrMethod.value || '', // 검사방법도 저장
            po_name: '임시',  // BottomTbl 표시용
            qio_date: new Date().toISOString().split('T')[0],  // 오늘 날짜
            qcr_code: qirForm.value.qcr_code || ''  // QCR 코드도 저장
        };

        console.log('📤 메모리에 추가할 QIR 데이터:', newQirData);

        // 🎯 부모(QualityManage)에게 메모리 추가 요청
        emit('add-to-memory', newQirData);
        
        alert('QIR이 목록에 추가되었어! 저장하려면 "저장" 버튼을 눌러줘! 🎉');
        
        // 폼 초기화 (QIO 코드는 유지)
        await resetFormKeepQio();
        
    } catch (error) {
        console.error('💥 QIR 메모리 등록 실패:', error);
        alert('QIR 등록 중 오류가 발생했어! 😭');
    }
};

// 🎯 QIR 수정 함수 (메모리 전용)
const updateQir = async () => {
    try {
        // 필수 데이터 검증
        if (!qirForm.value.qio_code) {
            alert('검사지시코드가 없어! 😅');
            return;
        }

        if (!qirForm.value.inspection_item) {
            alert('품질기준항목을 선택해줘! 🤔');
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
        
        const updatedQirData = {
            qir_code: qirForm.value.qir_code,  // 기존 코드 유지
            qio_code: qirForm.value.qio_code,
            start_date: formatDateTimeForDB(qirForm.value.start_date),
            end_date: formatDateTimeForDB(qirForm.value.end_date),
            unpass_qtt: parseInt(qirForm.value.unpass_qtt) || 0,
            pass_qtt: parseInt(qirForm.value.pass_qtt) || 0,
            unpass_rate: parseFloat(qirForm.value.unpass_rate) || 0,
            result: qirForm.value.result,
            note: qirForm.value.note || '',
            qir_emp_name: qirForm.value.qir_emp_name,
            inspection_item: qirForm.value.inspection_item,
            check_method: selectedQcrMethod.value || '', // 검사방법도 저장
            po_name: '수정됨',  // BottomTbl 표시용
            qio_date: new Date().toISOString().split('T')[0],  // 오늘 날짜
            qcr_code: qirForm.value.qcr_code || ''  // QCR 코드도 저장
        };

        console.log('📤 메모리에서 수정할 QIR 데이터:', updatedQirData);

        // 🎯 부모에게 메모리 수정 요청
        emit('update-in-memory', updatedQirData);
        
        alert('QIR이 목록에서 수정되었어! 저장하려면 "저장" 버튼을 눌러줘! 🎉');
        
        // 폼 초기화 (QIO 코드는 유지)
        await resetFormKeepQio();
        
    } catch (error) {
        console.error('💥 QIR 메모리 수정 실패:', error);
        alert('QIR 수정 중 오류가 발생했어! 😭');
    }
};

// 수정 취소 함수
const cancelEdit = () => {
    console.log('수정 취소 - QIO 기본 모드로 복귀');
    emit('data-updated'); // 부모에서 선택 해제하도록 알림
};
</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>