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

const qioInfo = ref({
    qio_code: '',
    qio_date: null,
    insp_date: null,
    prdr_code: '',
    po_code: '',
    purchase_code: '',
    emp_name: '정품질'
});

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

    // 중복 처리 방지
    if (!newCode || newCode === lastProcessedQioCode.value) {
        console.log('중복 처리 방지:', newCode);
        return;
    }

    lastProcessedQioCode.value = newCode;
    console.log('데이터 로딩 시작:', newCode);

    // 병렬 처리
    await Promise.all([
        loadQioInfo(newCode),
        loadPrdrInfoByQioCode(newCode)
    ]);
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
        await loadAllQirList();
    }
});

// 날짜 포맷팅 함수들
const formatDateForDB = (date) => {
    if (!date) return null;
    return moment(date).format('YYYY-MM-DD');
};

const formatDateTimeForDB = (date) => {
    if (!date) return null;
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

// 데이터 유효성 검증
const validateData = () => {
    // 지시서 정보 검증
    if (!qioInfo.value.insp_date) {
        alert('지시일자를 입력해주세요.');
        return false;
    }
    if (!qioInfo.value.prdr_code || !qioInfo.value.purchase_code) {
        alert('제품 혹은 발주서를 선택해주세요.');
        return false;
    }

    // 점검항목 검증
    if (!qioList.value || qioList.value.length === 0) {
        alert('점검항목을 추가해주세요.');
        return false;
    }

    for (let i = 0; i < qioList.value.length; i++) {
        const item = qioList.value[i];
        if (!item.chk_text || item.chk_text === '항목 선택') {
            alert(`${i + 1}번째 점검항목을 선택해주세요.`);
            return false;
        }
        if (!item.eq_name || item.eq_name === '설비 선택') {
            alert(`${i + 1}번째 설비를 선택해주세요.`);
            return false;
        }
        if (!item.chk_start_date) {
            alert(`${i + 1}번째 점검시작일시를 입력해주세요.`);
            return false;
        }
        if (!item.chk_end_date) {
            alert(`${i + 1}번째 점검종료일시를 입력해주세요.`);
            return false;
        }
    }

    return true;
};

// ✅ 데이터 저장
const saveData = async () => {
    if (!confirm('설비점검지시 정보를 저장하시겠습니까?')) {
        alert('저장을 취소했습니다.');
        return;
    }

    // 데이터 검증
    if (!validateData()) {
        return;
    }

    try {
        // 서버 전송용 데이터 변환
        const eqiiDataForServer = {
            ...qioInfo.value,
            insp_date: formatDateForDB(qioInfo.value.insp_date),
            chk_exp_date: formatDateForDB(qioInfo.value.chk_exp_date),
            inst_emp_name: qioInfo.value.inst_emp_code || 'EMP-10001'
        };

        const eqirDataForServer = qioList.value.map(item => ({
            ...item,
            chk_start_date: formatDateTimeForDB(item.chk_start_date),
            chk_end_date: formatDateTimeForDB(item.chk_end_date),
            inst_emp_name: qioInfo.value.inst_emp_code || 'EMP-10001',
            qio_code: qioInfo.value.qio_code
        }));

        const requestData = {
            eqiiData: eqiiDataForServer,
            detailData: eqirDataForServer
        };

        let response;
        if (!qioInfo.value.qio_code) {
            // 신규 등록
            response = await axios.post(`/api/eq/eqii/save-all`, requestData);
        } else {
            // 기존 수정
            response = await axios.put(`/api/eq/eqii/save-all/${qioInfo.value.qio_code}`, requestData);
        }

        const result = response.data;
        console.log('저장 결과:', result);

        if (result.success && result.data.result_code === "SUCCESS") {
            alert('저장에 성공했습니다.');

            // 신규 등록의 경우 생성된 코드로 업데이트
            if (result.data.qio_code && !qioInfo.value.qio_code) {
                qioInfo.value.qio_code = result.data.qio_code;
                currentQioCode.value = result.data.qio_code;

                // 데이터 로딩
                await handleQioCodeChange(result.data.qio_code);
            }
        } else {
            alert('저장에 실패했습니다. 다시 시도해주세요.');
        }
    } catch (error) {
        console.error('저장 중 오류:', error);
        alert('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
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
};

// ✅ QIR 목록 로딩
const loadQioInfo = async (qioCodeParam) => {
    if (qioCodeParam && qioCodeParam !== '') {
        try {
            const result = await axios.get(`/api/qcr/qir`);

            if (result.data && result.data.success) {
                qioList.value = result.data.data || [];
            } else {
                qioList.value = result.data || [];
            }

            console.log('QIR 목록 로딩 완료:', qioList.value.length, '건');
        } catch (error) {
            console.error('QIR 목록 로딩 실패:', error);
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
        const response = await axios.get(`/api/qcr/qio/prdr/${qioCodeParam}`);
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

// ✅ 전체 QIR 목록 로딩
const loadAllQirList = async () => {
    try {
        const response = await axios.get('/api/qcr/qir');

        if (response.data && response.data.success) {
            qioList.value = response.data.data || [];
        } else {
            qioList.value = response.data || [];
        }

        console.log('QIR 전체 목록 로딩 완료:', qioList.value.length, '건');
    } catch (error) {
        console.error('QIR 전체 목록 로딩 실패:', error);
        qioList.value = [];
    }
};

// QIR 선택 변경
const onSelectionChange = (selectedItems) => {
    console.log('선택된 QIR:', selectedItems);

    if (selectedItems && selectedItems.length === 1) {
        selectedQir.value = selectedItems[0];
        console.log('InputForm으로 전달할 QIR 데이터:', selectedQir.value);
    } else {
        selectedQir.value = null;
    }
};

// 데이터 업데이트 후 처리
const onDataUpdated = async () => {
    console.log('QIR 데이터 업데이트됨, 목록 새로고침');

    if (currentQioCode.value) {
        await loadQioInfo(currentQioCode.value);
    } else {
        await loadAllQirList();
    }

    selectedQir.value = null;
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
        <QualityManageSearch :data="qioInfo" @loadPrdrByQio="loadPrdrInfoByQioCode" @update:data="updateqioInfo"
            @reset-list="resetData" @save-data="saveData">
        </QualityManageSearch>

        <QualityManageMiddleTbl :data="prdrList" @update:data="updatePrdrList" @reset-list="resetData"
            @save-data="saveData">
        </QualityManageMiddleTbl>

        <div class="flex flex-col lg:flex-row gap-6 mt-6">
            <div class="space-y-6" style="width: 55%">
                <QualityManageBottomTbl :data="qioList" :dataKey="'qir_code'" :title="'품질검사결과 목록'" :columns="[
                    'qir_code',
                    'qio_code',
                    'inspection_item',
                    'result',
                    'unpass_qtt',
                    'pass_qtt',
                    'qir_emp_name'
                ]" :mapper="{
                        qir_code: '검사결과코드',
                        qio_code: '검사지시코드',
                        inspection_item: '품질기준항목',
                        result: '결과',
                        unpass_qtt: '불량수량',
                        pass_qtt: '합격수량',
                        qir_emp_name: '검사자'
                    }" @selection-change="onSelectionChange" @delete="deleteSelectedQir" @export="exportQirToExcel" />
            </div>
            <QualityManageInputForm :selectedData="selectedQir" @data-updated="onDataUpdated" />
        </div>
    </div>
</template>