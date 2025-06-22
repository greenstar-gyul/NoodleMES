<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import QltRListTable from './QltRListTable.vue';
import QltRListSearch from './QltRListSearch.vue';
import axios from 'axios';
import moment from 'moment';

const currentQioCode = ref('');
const route = useRoute();

const qioInfo = ref({
    qio_code: '',
    chk_start_date: null,
    chk_end_date: null,
    client: '',
    note: '',
    manager: '',
    inspector: ''
});

const qirList = ref([]);

const getQioCodeFromRoute = () => {
    const qioCodeParam = route.params.qioCode;
    console.log('라우트에서 가져온 qio_code:', qioCodeParam);
    return qioCodeParam || '';
};

watch(currentQioCode, async (newCode, oldCode) => {
    console.log('currentQioCode 변경됨:', oldCode, '->', newCode);
    
    if (newCode && newCode !== oldCode) {
        console.log('검사 결과 로딩 시작:', newCode);
        await loadQirInfo(newCode);
    }
}, { immediate: true });

watch(
    () => qioInfo.value.qio_code,
    async (newCode) => {
        if (newCode && newCode !== currentQioCode.value) {
            currentQioCode.value = newCode;
            await loadQirInfo(newCode);
        }
    },
    { immediate: true }
);

const loadQioDataByCode = async (qioCodeParam) => {
    if (!qioCodeParam) return;

    try {
        const response = await axios.get(`/api/qc/results/${qioCodeParam}`);

        if (response.data && response.data.data) {
            qioInfo.value = {
                ...response.data.data,
                chk_start_date: response.data.data.chk_start_date ? new Date(response.data.data.chk_start_date) : null,
                chk_end_date: response.data.data.chk_end_date ? new Date(response.data.data.chk_end_date) : null
            };
            currentQioCode.value = qioInfo.value.qio_code;
            console.log('qio_code:', qioInfo.value.qio_code);
        }
    } catch (error) {
        console.error('데이터 로딩 실패:', error);
    }
};

onMounted(async () => {
    const qioCodeFromRoute = getQioCodeFromRoute();
    if (qioCodeFromRoute) {
        await loadQioDataByCode(qioCodeFromRoute);
    }
});

const formatDateTimeForDB = (date) => {
    return date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : null;
};

const validateData = () => {
    if (!qioInfo.value.chk_start_date) {
        alert('검사 시작일자를 입력해주세요.');
        return false;
    }
    if (!qioInfo.value.chk_end_date) {
        alert('검사 종료일자를 입력해주세요.');
        return false;
    }
    if (!qirList.value || qirList.value.length === 0) {
        alert('검사 결과 항목을 추가해주세요.');
        return false;
    }

    return true;
};

const saveData = async () => {
    if (!confirm('품질검사 정보를 저장하시겠습니까?')) {
        alert('저장을 취소했습니다.');
        return;
    }

    if (!validateData()) {
        return;
    }

    try {
        const qioDataForServer = {
            ...qioInfo.value,
            chk_start_date: formatDateTimeForDB(qioInfo.value.chk_start_date),
            chk_end_date: formatDateTimeForDB(qioInfo.value.chk_end_date),
        };

        const qirDataForServer = qirList.value.map(item => ({
            ...item,
            qio_code: qioInfo.value.qio_code
        }));

        const requestData = {
            qioData: qioDataForServer,
            detailData: qirDataForServer
        };

        let response;
        if (!qioInfo.value.qio_code) {
            response = await axios.post(`/api/qc/results/save-all`, requestData);
        } else {
            response = await axios.put(`/api/qc/results/save-all/${qioInfo.value.qio_code}`, requestData);
        }

        const result = response.data;
        if (result.success && result.data.result_code === "SUCCESS") {
            alert('저장에 성공했습니다.');

            if (result.data.qio_code && !qioInfo.value.qio_code) {
                qioInfo.value.qio_code = result.data.qio_code;
                currentQioCode.value = result.data.qio_code;
                await loadQirInfo(result.data.qio_code);
            }
        } else {
            alert('저장에 실패했습니다.');
        }
    } catch (error) {
        console.error('저장 중 오류:', error);
        alert('저장 중 오류가 발생했습니다.');
    }
};

const resetData = () => {
    qirList.value = [];
    qioInfo.value = {
        qio_code: '',
        chk_start_date: null,
        chk_end_date: null,
        client: '',
        note: '',
        manager: '',
        inspector: ''
    };
    currentQioCode.value = '';
};

const loadQirInfo = async (qioCodeParam) => {
    if (qioCodeParam) {
        try {
            const result = await axios.get(`/api/qc/results/detail/${qioCodeParam}`);
            qirList.value = result.data;
        } catch (error) {
            qirList.value = [];
        }
    } else {
        qirList.value = [];
    }
};

const updateQioInfo = (newData) => {
    console.log('qioInfo 업데이트:', newData);
    const hasChanges = Object.keys(newData).some(key =>
        qioInfo.value[key] !== newData[key]
    );
    if (!hasChanges) {
        console.log('변경사항 없음, 업데이트 건너뜀');
        return;
    }

    qioInfo.value = { ...qioInfo.value, ...newData };

    if (newData.qio_code && newData.qio_code !== currentQioCode.value) {
        currentQioCode.value = newData.qio_code;
        loadQirInfo(newData.qio_code);
    }
};

const updateQirList = async (newList) => {
    console.log('qirList 업데이트:', newList);
    await loadQirInfo(currentQioCode.value);
};
</script>
<template>
    <div>
        <QltRListSearch
            :data="qioInfo"
            @update:data="updateQioInfo"
            @reset-list="resetData"
            @save-data="saveData"
        />
        
        <QltRListTable
            v-if="currentQioCode"
            :subData="qirList"
            @update:subData="updateQirList"
            :qio="currentQioCode"
            :dataKey="'qir_code'"
            :columns="['qir_code', 'prod_code', 'chk_start_date', 'chk_end_date', 'def_qty', 'note', 'result', 'inspector']"
            title="품질검사 결과 항목"
        />
    </div>
</template>
