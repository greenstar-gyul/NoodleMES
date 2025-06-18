<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import QualityManageSearch from './QualityManageSearch.vue';
import QualityManageMiddleTbl from './QualityManageMiddleTbl.vue';
import axios from 'axios';
import moment from 'moment';
import prdrMapping from '../../../service/PrdrMapping';
import production from '../../../router/production';

const currentQioCode = ref('');
const route = useRoute();

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
    po_code: '',
    purchase_code: '',
    prod_code: '',
    prodcution_qtt: 0
});

// 라우트 파라미터에서 qio_code 가져오기
const getqioCodeFromRoute = () => {
    const qioCodeParam = route.params.qioCode;
    console.log('라우트에서 가져온 qio_code:', qioCodeParam);
    return qioCodeParam || '';
}

// currentQioCode 변경 감지해서 테이블 데이터 로딩
watch(currentQioCode, async (newCode, oldCode) => {
    console.log('currentQioCode 변경됨:', oldCode, '->', newCode);

    if (newCode && newCode !== oldCode) {
        console.log('점검항목 데이터 로딩 시작:', newCode);
        await loadQioInfo(newCode);
        await loadPrdrInfoByQioCode(newCode);
    }
}, { immediate: true }); // immediate: true로 초기에도 실행!

// 또는 qioInfo.qio_code를 직접 watch하는 방법도 있어
watch(
    () => qioInfo.value.qio_code,
    async (newCode) => {
        if (newCode && newCode !== currentQioCode.value) {
            currentQioCode.value = newCode;
            await loadQioInfo(newCode);
            await loadPrdrInfoByQioCode(newCode);
        }
    },
    { immediate: true }
);

const loadQioDataByCode = async (qioCodeParam) => {
    if (!qioCodeParam) return;

    try {
        const response = await axios.get(`/api/qcr/qio/${qioCodeParam}`);

        if (response.data && response.data.data) {
            qioInfo.value = {
                ...response.data.data,
                insp_date: response.data.data.insp_date ? new Date(response.data.data.insp_date) : null
            };
            currentQioCode.value = qioInfo.value.qio_code;  // ← .data 제거
            console.log('qio_code:', qioInfo.value.qio_code);
        }
    } catch (error) {
        console.error('데이터 로딩 실패:', error);
    }
};

onMounted(async () => {
    // 라우트 파라미터에서 qio_code 확인
    const qioCodeFromRoute = getqioCodeFromRoute();

    if (qioCodeFromRoute) {
        // 해당 qio_code로 데이터 로딩
        await loadQioDataByCode(qioCodeFromRoute);
    }
});

const formatDateForDB = (date) => {
    if (!date) return null;
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

const formatDateTimeForDB = (date) => {
    if (!date) return null;
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

const validateData = () => {
    // 지시서 정보 검증
    if (!qioInfo.value.insp_date) {
        alert('지시일자를 입력해주세요.');
        return false;
    }
    if (!qioInfo.value.prdr_code || !qioInfo.purchase_code) {
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
            qio_code: qioInfo.value.qio_code // 연결 코드 설정
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
                // 점검항목들도 새로 불러오기
                await loadQioInfo(result.data.qio_code);
            }
        } else {
            alert('저장에 실패했습니다. 다시 시도해주세요.');
        }
    } catch (error) {
        console.error('저장 중 오류:', error);
        alert('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
};

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
    currentQioCode.value = '';
};

const loadQioInfo = async (qioCodeParam) => {
    if (qioCodeParam && qioCodeParam !== '') {
        try {
            const result = await axios.get(`/api/qcr/qio/${qioCodeParam}`);
            qioList.value = result.data;
        } catch (error) {
            qioList.value = [];
        }
    } else {
        qioList.value = [];
    }
};

const loadPrdrInfoByQioCode = async (qioCodeParam) => {
    if (qioCodeParam && qioCodeParam !== '') {
        try {
            const result = await axios.get(`/api/qcr/qio/prdr/${qioCodeParam}`);
            prdrList.value = result.data;
        } catch (error) {
            prdrList.value = [];
        }
    } else {
        prdrList.value = [];
    }
};

// qioInfo 업데이트 함수 (자식 컴포넌트에서 호출)
const updateqioInfo = (newData) => {
    console.log('qioInfo 업데이트:', newData);

    // 실제로 변경된 경우에만 업데이트
    const hasChanges = Object.keys(newData).some(key =>
        qioInfo.value[key] !== newData[key]
    );

    if (!hasChanges) {
        console.log('변경사항 없음, 업데이트 건너뜀');
        return;
    }

    qioInfo.value = { ...qioInfo.value, ...newData };

    // qio_code가 변경된 경우에만 점검항목 로딩
    if (newData.qio_code && newData.qio_code !== currentQioCode.value) {
        currentQioCode.value = newData.qio_code;
        loadQioInfo(newData.qio_code);
        loadPrdrInfoByQioCode(newData.qio_code);
    }
};

const updatePrdrList = (newData) => {
    console.log('prdrList 업데이트:', newData);

    // 실제로 변경된 경우에만 업데이트
    const hasChanges = Object.keys(newData).some(key =>
        prdrList.value[key] !== newData[key]
    );

    if (!hasChanges) {
        console.log('변경사항 없음, 업데이트 건너뜀');
        return;
    }

    prdrList.value = { ...prdrList.value, ...newData };
};

// qioList 업데이트 함수
const updateqioList = async (newList) => {
    console.log('qioList 업데이트:', newList);
    await loadQioInfo(currentQioCode.value);
}

</script>


<template>
    <div>
        <QualityManageSearch :data="qioInfo" @update:data="updateqioInfo" @reset-list="resetData" @save-data="saveData">
        </QualityManageSearch>
        <!-- currentQioCode가 있을 때만 테이블 렌더링 -->
        <QualityManageMiddleTbl :data="prdrList" @update:data="updatePrdrList" @reset-list="resetData" @save-data="saveData">
        </QualityManageMiddleTbl>
    </div>
</template>