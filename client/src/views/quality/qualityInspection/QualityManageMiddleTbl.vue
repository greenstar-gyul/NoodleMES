<script setup>
import { ref, watch, computed } from 'vue';
import Button from 'primevue/button';
import LabeledTextarea from '../../../components/registration-bar/LabeledTextarea.vue';
import LabeledInput from '../../../components/registration-bar/LabeledInput.vue';
import axios from 'axios';
import EquipIIMapping from '../../../service/EquipIIMapping';
import QualitySinglePopup from './QualitySinglePopup.vue';
import LabeledDatePicker from '../../../components/registration-bar/LabeledDatePicker.vue';
import LabeledSelect from '../../../components/registration-bar/LabeledSelect.vue';
import moment from 'moment';
import mpo from '../../../router/mpo';
import mpr from '../../../router/mpr';

const emit = defineEmits(['updateList', 'updatePrdp', 'resetList', 'saveData', 'update:data']);
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

const currentData = ref({
    // PRDR 필드들
    qio_code: '',
    prdr_code: '',
    po_name: '',
    prod_name: '',
    purchase_code: '',
    end_date: null,
    production_qtt: '0',

    // MPR 필드들
    mpr_d_code: '',
    mpr_code: '',
    mat_name: '',
    mat_code: '',
    deadline: null,
    req_qtt: '0'
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

    // 날짜만! YYYY-MM-DD 형식
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const parseDate = (dateString) => {
    if (!dateString) return null;
    if (typeof dateString === 'string') {
        return new Date(dateString);
    }
    return dateString;
};

const lastSelectedType = ref('EMPTY');

const currentDataType = computed(() => {
    if (currentData.value.prdr_code) {
        return 'PRDR';
    } else if (currentData.value.mpr_d_code) {
        return 'MPR';
    } else {
        return 'EMPTY';
    }
});

// ✅ 무한루프 방지용 플래그
const isInternalUpdate = ref(false);

// ✅ watch 수정 - 무한루프 방지
watch(() => props.data, (newData) => {
    if (newData) {
        console.log('MiddleTbl - props.data 변경 감지:', newData);
        console.log('MiddleTbl - PRDR 코드:', newData.prdr_code);
        console.log('MiddleTbl - MPR-D 코드:', newData.mpr_d_code);
        console.log('MiddleTbl - isInternalUpdate 상태:', isInternalUpdate.value);

        // 내부 업데이트이지만 실제로 다른 데이터면 업데이트
        const isDifferentData = !currentData.value ||
            currentData.value.prdr_code !== newData.prdr_code ||
            currentData.value.mpr_d_code !== newData.mpr_d_code ||
            currentData.value.qio_code !== newData.qio_code;

        if (!isInternalUpdate.value || isDifferentData) {
            console.log('MiddleTbl - 데이터 업데이트 진행');

            // 🎯 PRDR과 MPR 필드 모두 업데이트
            currentData.value = {
                // 기본 정보
                qio_code: newData.qio_code || '',

                // PRDR 필드들
                prdr_code: newData.prdr_code || '',
                po_name: newData.po_name || '',
                prod_name: newData.prod_name || '',
                purchase_code: newData.purchase_code || '',
                end_date: newData.end_date ? parseDate(newData.end_date) : null,
                production_qtt: String(newData.production_qtt || 0),

                // MPR 필드들 (🎯 이 부분이 중요!)
                mpr_d_code: newData.mpr_d_code || '',
                mpr_code: newData.mpr_code || '',
                mat_name: newData.mat_name || '',
                mat_code: newData.mat_code || '',
                deadline: newData.deadline ? parseDate(newData.deadline) : null,
                req_qtt: String(newData.req_qtt || 0)
            };

            console.log('MiddleTbl - currentData 업데이트 완료:', {
                prdr_code: currentData.value.prdr_code,
                mpr_code: currentData.value.mpr_code
            });
        } else {
            console.log('MiddleTbl - 내부 업데이트 중이므로 스킵');
        }
    }
}, { immediate: true, deep: true });

// ✅ 업데이트 함수들에 플래그 적용
const updatePrdrCode = (newCode) => {
    isInternalUpdate.value = true;

    emit('update:data', {
        ...props.data,
        prdr_code: newCode
    });

    setTimeout(() => {
        isInternalUpdate.value = false;
    }, 50);
};

const updatePoName = (newName) => {
    isInternalUpdate.value = true;

    emit('update:data', {
        ...props.data,
        po_name: newName
    });

    setTimeout(() => {
        isInternalUpdate.value = false;
    }, 50);
};

const updatePurchaseCode = (newCode) => {
    isInternalUpdate.value = true;

    emit('update:data', {
        ...props.data,
        purchase_code: newCode
    });

    setTimeout(() => {
        isInternalUpdate.value = false;
    }, 50);
};

const updateEndDate = (newDate) => {
    isInternalUpdate.value = true;

    emit('update:data', {
        ...props.data,
        end_date: formatDateForDB(newDate)
    });

    setTimeout(() => {
        isInternalUpdate.value = false;
    }, 50);
};

const updateProdName = (newName) => {
    isInternalUpdate.value = true;

    emit('update:data', {
        ...props.data,
        prod_name: newName
    });

    setTimeout(() => {
        isInternalUpdate.value = false;
    }, 50);
};

const updateProductionQtt = (newQtt) => {
    isInternalUpdate.value = true;

    emit('update:data', {
        ...props.data,
        production_qtt: String(newQtt)
    });

    setTimeout(() => {
        isInternalUpdate.value = false;
    }, 50);
};

const updateMprCode = (newCode) => {
    isInternalUpdate.value = true;
    emit('update:data', {
        ...props.data,
        mpr_code: newCode
    });
    setTimeout(() => {
        isInternalUpdate.value = false;
    }, 50);
};

const updateMprDCode = (newCode) => {
    isInternalUpdate.value = true;
    emit('update:data', {
        ...props.data,
        mpr_d_code: newCode
    });
    setTimeout(() => {
        isInternalUpdate.value = false;
    }, 50);
};

const updateMatName = (newName) => {
    isInternalUpdate.value = true;
    emit('update:data', {
        ...props.data,
        mat_name: newName
    });
    setTimeout(() => {
        isInternalUpdate.value = false;
    }, 50);
};

const updateDeadline = (newDate) => {
    isInternalUpdate.value = true;
    emit('update:data', {
        ...props.data,
        deadline: formatDateForDB(newDate)
    });
    setTimeout(() => {
        isInternalUpdate.value = false;
    }, 50);
};

const updateReqQtt = (newQtt) => {
    isInternalUpdate.value = true;
    emit('update:data', {
        ...props.data,
        req_qtt: String(newQtt)
    });
    setTimeout(() => {
        isInternalUpdate.value = false;
    }, 50);
};

const loadPrdpPopupInfo = ref([]);
const loadMprPopupInfo = ref([]);

const loadPlansData = async () => {
    try {
        const response = await axios.get(`/api/prdr/all`);

        if (response.data && Array.isArray(response.data)) {
            loadPrdpPopupInfo.value = response.data.map(item => ({
                qio_code: item.qio_code,
                prdr_code: item.prdr_code,
                po_name: item.po_name,
                prod_name: item.prod_name,
                purchase_code: item.purchase_code,
                end_date: item.end_date,
                production_qtt: item.production_qtt || 0,
            }));
        }
    } catch (error) {
        console.error('실적 간편 조회 실패:', error);
        loadPrdpPopupInfo.value = [];
    }
};

const loadMprsData = async () => {
    try {
        console.log('🔍 자재 데이터 로딩 시작...');
        const response = await axios.get(`/api/mpr/simple`);

        console.log('🎯 자재 API 전체 응답:', response.data);
        console.log('🎯 result_code 체크:', response.data.result_code === "SUCCESS");
        console.log('🎯 data 배열 체크:', Array.isArray(response.data.data));
        console.log('🎯 data 길이:', response.data.data?.length);

        // ✅ 응답 구조 체크
        if (response.data && response.data.result_code === "SUCCESS" && Array.isArray(response.data.data)) {
            console.log('✅ 조건 통과! 데이터 매핑 시작...');

            // 🔍 원본 데이터 확인
            console.log('🎯 원본 data 배열:', response.data.data);
            if (response.data.data.length > 0) {
                console.log('🎯 첫 번째 아이템:', response.data.data[0]);
                console.log('🎯 첫 번째 아이템 키들:', Object.keys(response.data.data[0]));
            }

            loadMprPopupInfo.value = response.data.data.map((item, index) => {
                console.log(`🎯 ${index}번째 아이템 매핑 중:`, item);

                const mappedItem = {
                    mpr_d_code: item.mpr_d_code || '',
                    mpr_code: item.mpr_code || '',
                    mat_name: item.mat_name || '',
                    mat_code: item.mat_code || '',  // 🎯 mat_code 추가!
                    deadline: item.deadline || '',
                    req_qtt: item.req_qtt || 0
                };

                console.log(`🎯 ${index}번째 매핑 결과:`, mappedItem);
                return mappedItem;
            });

            console.log('✅ 최종 loadMprPopupInfo.value:', loadMprPopupInfo.value);
            console.log('✅ loadMprPopupInfo.value 길이:', loadMprPopupInfo.value.length);
            console.log('✅ loadMprPopupInfo.value는 배열?', Array.isArray(loadMprPopupInfo.value));

        } else {
            console.error('❌ 조건 실패!');
            console.log('- response.data 존재?', !!response.data);
            console.log('- result_code === SUCCESS?', response.data?.result_code === "SUCCESS");
            console.log('- data가 배열?', Array.isArray(response.data?.data));
            loadMprPopupInfo.value = [];
        }

    } catch (error) {
        console.error('💥 발주서 간편 조회 실패:', error);
        console.error('💥 에러 상세:', error.response?.data);
        loadMprPopupInfo.value = [];
    }
};

const loadSelectedPlan = async (selectedItem) => {
    console.log('선택된 생산실적:', selectedItem);

    if (!selectedItem || !selectedItem.prdr_code) {
        alert('생산실적을 선택해주세요.');
        return;
    }

    // ✅ 내부 업데이트 플래그 설정
    isInternalUpdate.value = true;
    lastSelectedType.value = 'PRDR';

    // 선택한 데이터로 부모 컴포넌트에 업데이트 요청
    emit('update:data', {
        qio_code: selectedItem.qio_code || '',

        prdr_code: selectedItem.prdr_code,
        po_name: selectedItem.po_name,
        prod_name: selectedItem.prod_name,
        purchase_code: selectedItem.purchase_code,
        end_date: selectedItem.end_date,
        production_qtt: selectedItem.production_qtt || 0,

        mpr_d_code: selectedItem.mpr_d_code || '',
        mpr_code: selectedItem.mpr_code || '',
        mat_name: selectedItem.mat_name || '',
        mat_code: selectedItem.mat_code || '',
        deadline: selectedItem.deadline,
        req_qtt: selectedItem.req_qtt || 0
    });

    // 팝업 닫기
    prdrPopupVisible.value = false;

    // 플래그 해제
    setTimeout(() => {
        isInternalUpdate.value = false;
    }, 100);

    console.log('생산실적 정보가 성공적으로 로드되었습니다!');
};

const dynamicDataKey = computed(() => {
    if (props.items && props.items.length > 0) {
        const hasQioCode = props.items.some(item => item.qio_code);
        return hasQioCode ? 'qio_code' : 'prdr_code';
    }
    return 'prdr_code';
});

const loadSelectedMpr = async (selectedItem) => {
    console.log('선택된 자재요청:', selectedItem);

    if (!selectedItem || !selectedItem.mpr_d_code) {
        alert('자재요청을 선택해주세요.');
        return;
    }

    // ✅ 내부 업데이트 플래그 설정
    isInternalUpdate.value = true;
    lastSelectedType.value = 'MPR';

    // 선택한 데이터로 부모 컴포넌트에 업데이트 요청
    emit('update:data', {
        qio_code: props.data.qio_code || '',

        prdr_code: '',
        po_name: '',
        prod_name: '',
        purchase_code: '',
        end_date: null,
        production_qtt: '0',

        mpr_d_code: selectedItem.mpr_d_code || '',
        mpr_code: selectedItem.mpr_code || '',
        mat_name: selectedItem.mat_name || '',
        mat_code: selectedItem.mat_code || '',
        deadline: selectedItem.deadline,
        req_qtt: selectedItem.req_qtt || 0
    });

    // 팝업 닫기
    mprPopupVisible.value = false;

    // 플래그 해제
    setTimeout(() => {
        isInternalUpdate.value = false;
    }, 100);

    console.log('자재요청 정보가 성공적으로 로드되었습니다!');
};

const openPopup = async () => {
    await loadPlansData();
    prdrPopupVisible.value = true;
};

const openPopup2 = async () => {
    console.log('🚀 자재 팝업 열기 시작!');

    await loadMprsData();

    console.log('🎯 팝업 열기 전 최종 체크:');
    console.log('- loadMprPopupInfo.value:', loadMprPopupInfo.value);
    console.log('- 길이:', loadMprPopupInfo.value.length);
    console.log('- 배열인가?', Array.isArray(loadMprPopupInfo.value));
    console.log('- mprPopupVisible 상태:', mprPopupVisible.value);

    // 🚨 긴급! 데이터가 없으면 임시 데이터로 테스트
    if (loadMprPopupInfo.value.length === 0) {
        console.log('🚨 데이터가 비어있어서 임시 데이터 주입!');
        loadMprPopupInfo.value = [
            {
                mpr_d_code: 'TEST-D-001',
                mpr_code: 'MPR-TEST-001',
                mat_name: '테스트 자재',
                mat_code: 'MAT-TEST-001',
                deadline: '2025-06-21',
                req_qtt: 100
            }
        ];
        console.log('🎯 임시 데이터 주입 완료:', loadMprPopupInfo.value);
    }

    mprPopupVisible.value = true;
    console.log('🎯 팝업 상태 변경 후:', mprPopupVisible.value);

    // 🔍 팝업이 열린 후 잠시 후에 데이터 재확인
    setTimeout(() => {
        console.log('🎯 팝업 열린 후 데이터 재확인:');
        console.log('- loadMprPopupInfo.value:', loadMprPopupInfo.value);
        console.log('- mprPopupVisible:', mprPopupVisible.value);
    }, 500);
};
const prdrPopupVisible = ref(false);
const mprPopupVisible = ref(false);
const qios = ref([]);
</script>

<template>
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <!-- 🎯 헤더 부분 - 데이터 타입에 따라 제목 변경 -->
        <div class="grid grid-cols-1 gap-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">
                        <b v-if="currentDataType === 'PRDR'">생산 실적 정보</b>
                        <b v-else-if="currentDataType === 'MPR'">자재 정보</b>
                        <b v-else>정보 선택</b>
                    </div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button label="초기화" severity="contrast" class="min-w-fit" @click="emit('resetList')" />
                    <Button label="생산실적 불러오기" severity="success" class="min-w-fit whitespace-nowrap"
                        @click="openPopup" />
                    <Button label="자재정보 불러오기" severity="success" class="min-w-fit whitespace-nowrap"
                        @click="openPopup2" />
                </div>
            </div>
        </div>

        <!-- 🎯 PRDR 필드들 (생산실적) -->
        <div v-if="currentDataType === 'PRDR'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabeledInput label="생산실적 코드" :model-value="currentData.prdr_code" @update:model-value="updatePrdrCode"
                    :disabled="true" />
                <LabeledInput label="공정명" :model-value="currentData.po_name" @update:model-value="updatePoName"
                    :disabled="true" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabeledInput label="제품명" :model-value="currentData.prod_name" @update:model-value="updateProdName"
                    :disabled="true" />
                <LabeledDatePicker label="완료일자" :model-value="currentData.end_date" @update:model-value="updateEndDate"
                    :disabled="true" /> 
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabeledInput label="생산수량" :model-value="currentData.production_qtt"
                    @update:model-value="updateProductionQtt" :disabled="true" />
            </div>
        </div>

        <!-- 🎯 MPR 필드들 (자재정보) -->
        <div v-else-if="currentDataType === 'MPR'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabeledInput label="자재요청 코드" :model-value="currentData.mpr_code" @update:model-value="updateMprCode"
                    :disabled="true" />
                <LabeledInput label="자재명" :model-value="currentData.mat_name" @update:model-value="updateMatName"
                    :disabled="true" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabeledDatePicker label="입고예정일" :model-value="currentData.deadline"
                    @update:model-value="updateDeadline" :disabled="true" />
                <LabeledInput label="요청수량" :model-value="currentData.req_qtt" @update:model-value="updateReqQtt"
                    :disabled="true" />
            </div>
        </div>

        <!-- 🎯 빈 상태 (아무것도 선택 안됨) -->
        <div v-else class="text-center p-8 text-gray-500">
            <p>생산실적 또는 자재정보를 불러와주세요.</p>
            <p class="text-sm mt-2">위의 버튼을 사용해서 데이터를 선택해주세요.</p>
        </div>
    </div>

    <!-- 팝업 컴포넌트 -->
    <QualitySinglePopup v-model:visible="prdrPopupVisible" :items="loadPrdpPopupInfo" @confirm="loadSelectedPlan"
        :selectedHeader="['prdr_code', 'po_name', 'prod_name', 'end_date', 'production_qtt']" :mapper="{
            prdr_code: '생산계획 코드',
            po_name: '공정명',
            prod_name: '제품명',
            end_date: '완료일자',
            production_qtt: '생산량'
        }" :dataKey="dynamicDataKey" :placeholder="'생산실적 불러오기'">
    </QualitySinglePopup>

    <QualitySinglePopup v-model:visible="mprPopupVisible" :items="loadMprPopupInfo" @confirm="loadSelectedMpr"
        :selectedHeader="['mpr_code', 'mat_name', 'deadline', 'req_qtt']" :mapper="{
            mpr_code: '자재요청 코드',
            mat_name: '자재명',
            deadline: '입고일',
            req_qtt: '입고 수량'
        }" :dataKey="'mpr_d_code'" :placeholder="'자재정보 불러오기'">
    </QualitySinglePopup>
</template>