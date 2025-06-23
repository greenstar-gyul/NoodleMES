<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import EqiiManageSearch from './components/EqiiManageSearch.vue';
import EqiiManageTable from './components/EqiiManageTable.vue';
import axios from 'axios';
import moment from 'moment';

const currentEqiiCode = ref('');
const route = useRoute();

const eqiiInfo = ref({
    eqii_code: '',
    inst_date: null,
    chk_exp_date: null,
    stat: '',
    note: '',
    inst_emp_name: 'EMP-10001',
    inst_emp_code: 'EMP-10001'
});

const eqirList = ref([]);

// 라우트 파라미터에서 eqii_code 가져오기
const getEqiiCodeFromRoute = () => {
    const eqiiCodeParam = route.params.eqiiCode;
    console.log('라우트에서 가져온 eqii_code:', eqiiCodeParam);
    return eqiiCodeParam || '';
}

// currentEqiiCode 변경 감지해서 테이블 데이터 로딩
watch(currentEqiiCode, async (newCode, oldCode) => {
    console.log('currentEqiiCode 변경됨:', oldCode, '->', newCode);
    
    if (newCode && newCode !== oldCode) {
        console.log('점검항목 데이터 로딩 시작:', newCode);
        await loadEqirInfo(newCode);
    }
}, { immediate: true }); // immediate: true로 초기에도 실행!

// 또는 eqiiInfo.eqii_code를 직접 watch하는 방법도 있어
watch(
    () => eqiiInfo.value.eqii_code, 
    async (newCode) => {
        if (newCode && newCode !== currentEqiiCode.value) {
            currentEqiiCode.value = newCode;
            await loadEqirInfo(newCode);
        }
    },
    { immediate: true }
);

const loadEqiiDataByCode = async (eqiiCodeParam) => {
    if (!eqiiCodeParam) return;

    try {
        const response = await axios.get(`/api/eq/eqii/${eqiiCodeParam}`);

        if (response.data && response.data.data) {
            eqiiInfo.value = {
                ...response.data.data,
                inst_date: response.data.data.inst_date ? new Date(response.data.data.inst_date) : null,
                chk_exp_date: response.data.data.chk_exp_date ? new Date(response.data.data.chk_exp_date) : null
            };
            currentEqiiCode.value = eqiiInfo.value.eqii_code;  // ← .data 제거
            console.log('eqii_code:', eqiiInfo.value.eqii_code);
        }
    } catch (error) {
        console.error('데이터 로딩 실패:', error);
    }
};

onMounted(async () => {
    // 라우트 파라미터에서 eqii_code 확인
    const eqiiCodeFromRoute = getEqiiCodeFromRoute();

    if (eqiiCodeFromRoute) {
        // 해당 eqii_code로 데이터 로딩
        await loadEqiiDataByCode(eqiiCodeFromRoute);
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
    if (!eqiiInfo.value.inst_date) {
        alert('지시일자를 입력해주세요.');
        return false;
    }
    if (!eqiiInfo.value.chk_exp_date) {
        alert('점검예정일을 입력해주세요.');
        return false;
    }
    if (!eqiiInfo.value.stat) {
        alert('상태를 선택해주세요.');
        return false;
    }

    // 점검항목 검증
    if (!eqirList.value || eqirList.value.length === 0) {
        alert('점검항목을 추가해주세요.');
        return false;
    }

    for (let i = 0; i < eqirList.value.length; i++) {
        const item = eqirList.value[i];
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
            ...eqiiInfo.value,
            inst_date: formatDateForDB(eqiiInfo.value.inst_date),
            chk_exp_date: formatDateForDB(eqiiInfo.value.chk_exp_date),
            inst_emp_name: eqiiInfo.value.inst_emp_code || 'EMP-10001'
        };

        const eqirDataForServer = eqirList.value.map(item => ({
            ...item,
            chk_start_date: formatDateTimeForDB(item.chk_start_date),
            chk_end_date: formatDateTimeForDB(item.chk_end_date),
            inst_emp_name: eqiiInfo.value.inst_emp_code || 'EMP-10001',
            eqii_code: eqiiInfo.value.eqii_code // 연결 코드 설정
        }));

        const requestData = {
            eqiiData: eqiiDataForServer,
            detailData: eqirDataForServer
        };

        let response;
        if (!eqiiInfo.value.eqii_code) {
            // 신규 등록
            response = await axios.post(`/api/eq/eqii/save-all`, requestData);
        } else {
            // 기존 수정
            response = await axios.put(`/api/eq/eqii/save-all/${eqiiInfo.value.eqii_code}`, requestData);
        }

        const result = response.data;
        console.log('저장 결과:', result);

        if (result.success && result.data.result_code === "SUCCESS") {
            alert('저장에 성공했습니다.');

            // 신규 등록의 경우 생성된 코드로 업데이트
            if (result.data.eqii_code && !eqiiInfo.value.eqii_code) {
                eqiiInfo.value.eqii_code = result.data.eqii_code;
                currentEqiiCode.value = result.data.eqii_code;
                // 점검항목들도 새로 불러오기
                await loadEqirInfo(result.data.eqii_code);
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
    eqirList.value = [];
    eqiiInfo.value = {
        eqii_code: '',
        inst_date: null,
        chk_exp_date: null,
        stat: '',
        note: '',
        inst_emp_name: 'EMP-10001',
        inst_emp_code: 'EMP-10001'
    };
    currentEqiiCode.value = '';
};

const loadEqirInfo = async (eqiiCodeParam) => {
    if (eqiiCodeParam && eqiiCodeParam !== '') {
        try {
            const result = await axios.get(`/api/eq/eqirall/${eqiiCodeParam}`);
            eqirList.value = result.data;
        } catch (error) {
            eqirList.value = [];
        }
    } else {
        eqirList.value = [];
    }
};

// eqiiInfo 업데이트 함수 (자식 컴포넌트에서 호출)
const updateEqiiInfo = (newData) => {
    console.log('eqiiInfo 업데이트:', newData);

    // 실제로 변경된 경우에만 업데이트
    const hasChanges = Object.keys(newData).some(key =>
        eqiiInfo.value[key] !== newData[key]
    );

    if (!hasChanges) {
        console.log('변경사항 없음, 업데이트 건너뜀');
        return;
    }

    eqiiInfo.value = { ...eqiiInfo.value, ...newData };

    // eqii_code가 변경된 경우에만 점검항목 로딩
    if (newData.eqii_code && newData.eqii_code !== currentEqiiCode.value) {
        currentEqiiCode.value = newData.eqii_code;
        loadEqirInfo(newData.eqii_code);
    }
};

// eqirList 업데이트 함수
const updateEqirList = async (newList) => {
    console.log('eqirList 업데이트:', newList);
    // await loadEqirInfo(currentEqiiCode.value);
    eqirList.value = newList;
}

</script>


<template>
    <div>
        <EqiiManageSearch :data="eqiiInfo" @update:data="updateEqiiInfo" @reset-list="resetData" @save-data="saveData">
        </EqiiManageSearch>

        <!-- currentEqiiCode가 있을 때만 테이블 렌더링 -->
        <EqiiManageTable
            :subData="eqirList" 
            @update:subData="updateEqirList" 
            :eqii="currentEqiiCode"
            :dataKey="'eqir_code'"
            :columns="['eqir_code', 'eq_name', 'chk_start_date', 'chk_end_date', 'chk_detail', 'note', 'chk_result', 'eqi_stat']"
            title="설비점검항목">
        </EqiiManageTable>
    </div>
</template>