<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import QualityManageSearch from './QualityManageSearch.vue';
import QualityManageMiddleTbl from './QualityManageMiddleTbl.vue';
import QualityManageBottomTbl from './QualityManageBottomTbl.vue';
import axios from 'axios';
import moment from 'moment';
import QualityManageInputForm from './QualityManageInputForm.vue';

const currentQioCode = ref('');
const lastProcessedQioCode = ref('');
const route = useRoute();
const selectedQir = ref(null);
const bottomTblRef = ref(null)

const qioInfo = ref({
    qio_code: '',
    qio_date: null,
    insp_date: null,
    prdr_code: '',
    po_code: '',
    purchase_code: '',
    emp_name: '정품질'
});
const qirList = ref([]);
const fullQirList = ref([]);
const qioList = ref([]);
const prdrList = ref({
    prdr_code: '',
    po_name: '',
    purchase_code: '',
    prod_name: '',
    end_date: null,
    production_qtt: '0'
});

// 라우트 파라미터에서 qio_code 가져오기
const getqioCodeFromRoute = () => {
    const qioCodeParam = route.params.qioCode;
    console.log('라우트에서 가져온 qio_code:', qioCodeParam);
    return qioCodeParam || '';
};

// ✅ QIO 코드 변경 시 데이터 로딩 (watch 대신 직접 호출)
const handleQioCodeChange = async (newCode) => {
    console.log('QIO 코드 변경 처리:', newCode);

    if (!newCode || newCode === lastProcessedQioCode.value) {
        console.log('중복 처리 방지:', newCode);
        return;
    }

    lastProcessedQioCode.value = newCode;
    console.log('데이터 로딩 시작:', newCode);

    // 병렬 처리
    await Promise.all([
        loadQioInfo(newCode),
        loadPrdrInfoByQioCode(newCode),
        loadQirInfoByQioCode(newCode)
    ]);

    selectedQir.value = {
        qio_code: newCode,
        qir_code: '',
        po_name: prdrList.value.po_name || '',
        prod_name: prdrList.value.prod_name || '',
    };

    console.log('🎯 InputForm에 QIO 기본 데이터 전달:', selectedQir.value);
};

// ✅ 특정 QIO 코드로 데이터 로딩
const loadQioDataByCode = async (qioCodeParam) => {
    if (!qioCodeParam) return;

    try {
        const response = await axios.get(`/api/qcr/qio/${qioCodeParam}`);

        if (response.data && response.data.data) {
            qioInfo.value = {
                ...response.data.data,
                qio_date: response.data.data.qio_date ? new Date(response.data.data.qio_date) : null,
                insp_date: response.data.data.insp_date ? new Date(response.data.data.insp_date) : null
            };

            // 단순 할당만
            const qioCode = qioInfo.value.qio_code;
            currentQioCode.value = qioCode;

            // 데이터 로딩은 별도 호출
            await handleQioCodeChange(qioCode);

            console.log('로딩된 qio_code:', qioCode);
        }
    } catch (error) {
        console.error('데이터 로딩 실패:', error);
    }
};

// ✅ 컴포넌트 마운트 시 초기화
onMounted(async () => {
    const qioCodeFromRoute = getqioCodeFromRoute();

    if (qioCodeFromRoute) {
        await loadQioDataByCode(qioCodeFromRoute);
    } else {
        // 빈페이지일 때 QIR 전체 조회
        await loadSimpleQirList();
    }
});

// 날짜 포맷팅 함수들
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

// const formatDateForDB = (date) => {
//     if (!date) return null;
//     return moment(date).format('YYYY-MM-DD HH:mm:ss');
// };

// 데이터 유효성 검증
const validateData = () => {

};

// ✅ 데이터 저장
const saveData = async () => {
    try {
        console.log('💾 저장 시작...');

        // 📝 데이터 유효성 검증
        if (!qioInfo.value.qio_date) {
            alert('지시일자를 입력해주세요! ㅠㅠ');
            return;
        }

        if (!qioInfo.value.insp_date) {
            alert('검사예정일을 입력해주세요! 😅');
            return;
        }

        if (!qioInfo.value.emp_name) {
            alert('지시자를 입력해주세요! 🤔');
            return;
        }

        // 🔄 저장 API 호출
        const savePayload = {
            qioData: {
                qio_code: qioInfo.value.qio_code || '',
                qio_date: formatDateForDB(qioInfo.value.qio_date),
                insp_date: formatDateForDB(qioInfo.value.insp_date),
                prdr_code: prdrList.value.prdr_code || '',
                po_name: prdrList.value.po_name || '',
                purchase_code: prdrList.value.purchase_code || '',
                emp_name: qioInfo.value.emp_name || '정품질'
            },
            detailData: qioList.value || []
        };

        console.log('📤 저장할 데이터:', savePayload);

        const response = await axios.post('/api/qcr/qio/save-all', savePayload);

        if (response.data.success) {
            alert('저장이 완료되었어! 🎉');

            // ✅ 저장 성공 후 강제 데이터 새로고침
            const newQioCode = response.data.data.qio_code;
            if (newQioCode) {
                console.log('✨ 새로 생성된 QIO 코드:', newQioCode);

                // 📌 중요: 직접 데이터를 다시 로드해서 최신 상태로 업데이트
                await forcedDataReload(newQioCode);
            }
        } else {
            alert('저장에 실패했어 ㅠㅠ');
        }
    } catch (error) {
        console.error('💥 저장 실패:', error);
        alert('저장 중 오류가 발생했어! 😭\n' + (error.response?.data?.message || error.message));
    }
};

const forcedDataReload = async (qioCode) => {
    try {
        console.log('🔄 강제 데이터 새로고침 시작:', qioCode);

        // 1️⃣ QIO 정보 다시 로드
        const qioResponse = await axios.get(`/api/qcr/qio/${qioCode}`);
        if (qioResponse.data && qioResponse.data.data) {
            const freshQioData = qioResponse.data.data;

            // 직접 qioInfo 업데이트 (watch 트리거)
            qioInfo.value = {
                qio_code: freshQioData.qio_code,
                qio_date: freshQioData.qio_date ? new Date(freshQioData.qio_date) : null,
                insp_date: freshQioData.insp_date ? new Date(freshQioData.insp_date) : null,
                prdr_code: freshQioData.prdr_code || '',
                purchase_code: freshQioData.purchase_code || '',
                emp_name: freshQioData.emp_name || '정품질'
            };

            console.log('✅ QIO 정보 새로고침 완료');
        }

        // 2️⃣ QIR 목록 다시 로드
        await loadQioInfo(qioCode);

        // 3️⃣ 생산실적 정보 다시 로드
        await loadPrdrInfoByQioCode(qioCode);

        // 4️⃣ currentQioCode 업데이트
        currentQioCode.value = qioCode;
        lastProcessedQioCode.value = qioCode;

        console.log('🎉 모든 데이터 새로고침 완료!');

    } catch (error) {
        console.error('❌ 데이터 새로고침 실패:', error);
    }
};

// ✅ 데이터 초기화
const resetData = () => {
    qioList.value = [];
    qioInfo.value = {
        qio_code: '',
        qio_date: null,
        insp_date: null,
        prdr_code: '',
        purchase_code: '',
        emp_name: '정품질'
    };
    prdrList.value = {
        prdr_code: '',
        po_name: '',
        purchase_code: '',
        prod_name: '',
        end_date: null,
        production_qtt: '0',
    };
    currentQioCode.value = '';
    lastProcessedQioCode.value = '';
    loadSimpleQirList();

    if (bottomTblRef.value && bottomTblRef.value.clearSelection) {
        bottomTblRef.value.clearSelection();
    }
    selectedQir.value = null;
};

// ✅ QIO 목록 로딩
const loadQioInfo = async (qioCodeParam) => {
    if (qioCodeParam && qioCodeParam !== '') {
        try {
            const result = await axios.get(`/api/qlt/qio/${qioCodeParam}`);

            if (result.data && result.data.success) {
                qioList.value = Array.isArray(result.data.data) || [];
            } else {
                qioList.value = result.data || [];
            }

            console.log('QIO 목록 로딩 완료:', qioList.value.length, '건');
        } catch (error) {
            console.error('QIO 목록 로딩 실패:', error);
            qioList.value = [];
        }
    } else {
        qioList.value = [];
    }
};

// ✅ 생산실적 정보 로딩
const loadPrdrInfoByQioCode = async (qioCodeParam) => {
    console.log('검사지시에 연결된 생산실적 자동 로딩:', qioCodeParam);

    try {
        const response = await axios.get(`/api/qlt/qio/prdr/${qioCodeParam}`);
        console.log('생산실적 API 응답:', response.data);

        if (response.data.data && response.data.data.length > 0) {
            const data = response.data.data[0];
            prdrList.value = {
                qio_code: data.qio_code || '',
                prdr_code: data.prdr_code || '',
                po_name: data.po_name || '',
                prod_name: data.prod_name || '',
                purchase_code: data.purchase_code || '',
                end_date: data.end_date,
                production_qtt: String(data.production_qtt || 0)
            };

            console.log('생산실적 정보 자동 로딩 완료:', prdrList.value);
        }
    } catch (error) {
        console.error('생산실적 자동 로딩 실패:', error);
        prdrList.value = {
            prdr_code: '',
            po_name: '',
            purchase_code: '',
            prod_name: '',
            end_date: null,
            production_qtt: '0'
        };
    }
};


const loadQirInfoByQioCode = async (qioCodeParam) => {
    console.log('QIR 목록 로딩 시작:', qioCodeParam);
    if (!qioCodeParam) return;

    try {
        const response = await axios.get(`/api/qlt/qir/simple/${qioCodeParam}`);

        if (response.data && response.data.success) {
            qirList.value = response.data.data || [];
        } else {
            qirList.value = [];
        }

        console.log('QIR 목록 로딩 완료:', qirList.value.length, '건');
    } catch (error) {
        console.error('QIR 목록 로딩 실패:', error);
        qirList.value = [];
    }
};

// QIR 삭제
const deleteSelectedQir = (selectedItems) => {
    console.log('QIR 삭제 요청:', selectedItems);
    alert('삭제 기능은 아직 구현 중입니다.');
};

// QIR 엑셀 다운로드
const exportQirToExcel = (data) => {
    console.log('QIR 엑셀 다운로드:', data);
    alert('엑셀 다운로드 기능은 아직 구현 중입니다.');
};

const loadSimpleQirList = async () => {
    console.log('QIR 목록 간단 조회 시작');

    try {
        const response = await axios.get('/api/qlt/qir/simple');

        if (response.data && response.data.success) {
            qirList.value = response.data.data || [];
        } else {
            qirList.value = [];
        }

        console.log('QIR 목록 간단 조회 완료:', qirList.value.length, '건');
    } catch (error) {
        console.error('QIR 목록 간단 조회 실패:', error);
        qirList.value = [];
    }
};

const loadQirListByQioCode = async (qioCodeParam) => {
    console.log('QIR 목록 로딩 시작:', qioCodeParam);

    if (!qioCodeParam) {
        console.warn('QIO 코드가 제공되지 않았습니다.');
        return;
    }

    try {
        await loadQirInfoByQioCode(qioCodeParam);
        console.log('QIR 목록 로딩 완료:', qirList.value.length, '건');
    } catch (error) {
        console.error('QIR 목록 로딩 실패:', error);
        qirList.value = [];
    }
};

// QIR 선택 변경
const onSelectionChange = async (selectedItems) => {
    console.log('선택된 QIR:', selectedItems);

    if (selectedItems && selectedItems.length === 1) {
        const selectedItem = selectedItems[0];

        // 🎯 선택된 QIR의 상세 정보 로딩 (수정 모드)
        try {
            console.log('QIR 상세 정보 로딩 시작:', selectedItem.qir_code);

            const response = await axios.get(`/api/qlt/qir/${selectedItem.qir_code}`);

            if (response.data && response.data.success) {
                // 📋 상세 정보를 selectedQir에 설정 (수정 모드)
                selectedQir.value = response.data.data;
                console.log('InputForm으로 전달할 QIR 상세 데이터 (수정 모드):', selectedQir.value);
            } else {
                // 실패 시 기본 선택 데이터라도 전달
                selectedQir.value = selectedItem;
                console.warn('QIR 상세 정보 로딩 실패, 기본 데이터 사용');
            }
        } catch (error) {
            console.error('QIR 상세 정보 로딩 오류:', error);
            // 에러 시에도 기본 선택 데이터는 전달
            selectedQir.value = selectedItem;
        }
    } else {
        // 🔄 선택 해제 시 - QIO 코드가 있으면 기본 모드로 유지!
        if (currentQioCode.value) {
            selectedQir.value = {
                qio_code: currentQioCode.value,
                qir_code: '', // 새 등록 모드
                po_name: prdrList.value.po_name || '',
                prod_name: prdrList.value.prod_name || '',
            };
            console.log('🎯 QIR 선택 해제, QIO 기본 모드 유지:', selectedQir.value);
        } else {
            // QIO 코드가 없으면 완전히 초기화
            selectedQir.value = null;
            console.log('🚫 QIO 코드 없음, 완전 초기화');
        }
    }
};

// 데이터 업데이트 후 처리
const onDataUpdated = async () => {
    console.log('QIR 데이터 업데이트됨, 목록 새로고침');

    if (currentQioCode.value) {
        // QIR 목록 새로고침
        await loadQirInfoByQioCode(currentQioCode.value);
        
        // 🎯 QIO 기본 모드로 돌려놓기 (새 QIR 등록 준비)
        selectedQir.value = {
            qio_code: currentQioCode.value,
            qir_code: '', // 새 등록 모드
            po_name: prdrList.value.po_name || '',
            prod_name: prdrList.value.prod_name || '',
        };
        console.log('🎯 데이터 업데이트 후 QIO 기본 모드로 설정:', selectedQir.value);
        
        // BottomTbl 선택도 해제
        if (bottomTblRef.value && bottomTblRef.value.clearSelection) {
            bottomTblRef.value.clearSelection();
        }
    } else {
        await loadSimpleQirList();
        selectedQir.value = null;
    }
};

// ✅ qioInfo 업데이트 함수 (무한루프 방지)
const updateqioInfo = async (newData) => {
    console.log('qioInfo 업데이트:', newData);

    // 현재 코드 저장
    const oldCode = qioInfo.value.qio_code;
    const newCode = newData.qio_code;

    // 데이터 업데이트
    qioInfo.value = { ...qioInfo.value, ...newData };

    // 코드가 변경된 경우에만 처리
    if (newCode && newCode !== oldCode && newCode !== currentQioCode.value) {
        console.log('새로운 QIO 코드 설정:', newCode);
        currentQioCode.value = newCode;

        // 데이터 로딩
        await handleQioCodeChange(newCode);
    }
};

// prdrList 업데이트
const updatePrdrList = (newData) => {
    console.log('prdrList 업데이트:', newData);
    prdrList.value = { ...prdrList.value, ...newData };
};

// qioList 업데이트
const updateqioList = async (newList) => {
    console.log('qioList 업데이트:', newList);
    if (currentQioCode.value) {
        await loadQioInfo(currentQioCode.value);
    }
};

</script>

<template>
    <div>
        <div class="flex flex-col lg:flex-row gap-6 mt-4">
            <QualityManageSearch :data="qioInfo" @loadPrdrByQio="loadPrdrInfoByQioCode"
                @loadQirByQio="loadQirListByQioCode" @update:data="updateqioInfo" @reset-list="resetData"
                @save-data="saveData">
            </QualityManageSearch>
            <QualityManageMiddleTbl :data="prdrList" @update:data="updatePrdrList" @reset-list="resetData"
                @save-data="saveData">
            </QualityManageMiddleTbl>
        </div>

        <div class="flex flex-col lg:flex-row gap-6 mt-6">
            <div class="space-y-6" style="width: 44%">
                <QualityManageBottomTbl ref="bottomTblRef" :data="qirList" :dataKey="'qir_code'" :title="'품질검사결과 목록'"
                    :columns="[
                        'qir_code',
                        'po_name',
                        'result',
                        'qio_date',
                    ]" :mapper="{
                    qir_code: '검사코드',
                    po_name: '발주명',
                    result: '검사결과',
                    qio_date: '지시일자'
                }" @selection-change="onSelectionChange" @delete="deleteSelectedQir" @export="exportQirToExcel" />
            </div>
            <QualityManageInputForm :selectedData="selectedQir" @data-updated="onDataUpdated" />
        </div>
    </div>
</template>