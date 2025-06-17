<script setup>
import { onMounted, ref, watch } from 'vue';
import EqiiManageSearch from './components/EqiiManageSearch.vue';
import EqiiManageTable from './components/EqiiManageTable.vue';
import axios from 'axios';

const eqiiCode = ref('');

// 🔥 defineModel 제거하고 일반 ref로 변경!
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

onMounted(() => {
    // 컴포넌트 마운트 시 초기화
});

const formatDateForDB = (date) => {
    if (!date) {
        return null;
    }
    
    let dateObj;
    if (date instanceof Date) {
        dateObj = date;
    } else if (typeof date === 'string') {
        dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            return null;
        }
    } else {
        return null;
    }
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const result = `${year}-${month}-${day}`;
    return result;
};

const formatDateTimeForDB = (date) => {
    if (!date) return null;
    if (date instanceof Date) {
        return date.toISOString().slice(0, 19).replace('T', ' ');
    }
    if (typeof date === 'string') {
        return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
    }
    return null;
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
                eqiiCode.value = result.data.eqii_code;
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
    eqiiCode.value = '';
};

const loadEqirInfo = async (eqiiCodeParam) => {
    console.log('🔍 loadEqirInfo 호출됨:', eqiiCodeParam);
    if (eqiiCodeParam && eqiiCodeParam !== '') {
        try {
            const result = await axios.get(`/api/eq/eqirall/${eqiiCodeParam}`);
            eqirList.value = result.data;
            console.log('✅ 점검항목 로딩 완료:', result.data);
        } catch (error) {
            console.error('점검항목 불러오기 실패:', error);
            eqirList.value = [];
        }
    } else {
        eqirList.value = [];
    }
};

// 🔥 eqiiInfo 업데이트 함수 (자식 컴포넌트에서 호출)
const updateEqiiInfo = (newData) => {
    console.log('📝 eqiiInfo 업데이트:', newData);
    
    // 🔥 실제로 변경된 경우에만 업데이트
    const hasChanges = Object.keys(newData).some(key => 
        eqiiInfo.value[key] !== newData[key]
    );
    
    if (!hasChanges) {
        console.log('변경사항 없음, 업데이트 건너뜀');
        return;
    }
    
    eqiiInfo.value = { ...eqiiInfo.value, ...newData };
    
    // eqii_code가 변경된 경우에만 점검항목 로딩
    if (newData.eqii_code && newData.eqii_code !== eqiiCode.value) {
        eqiiCode.value = newData.eqii_code;
        loadEqirInfo(newData.eqii_code);
    }
};

// 🔥 eqirList 업데이트 함수
const updateEqirList = (newList) => {
    console.log('📝 eqirList 업데이트:', newList);
    eqirList.value = newList;
};

// 🚨 watch 완전 제거! 더 이상 필요 없어!
</script>

<template>
    <div>
        <EqiiManageSearch 
            :data="eqiiInfo" 
            @update:data="updateEqiiInfo"
            @reset-list="resetData" 
            @save-data="saveData">
        </EqiiManageSearch>
        
        <EqiiManageTable 
            :subData="eqirList" 
            @update:subData="updateEqirList"
            :eqii="eqiiCode" 
            :dataKey="'eqir_code'" 
            :columns="['eqir_code','eq_name', 'chk_start_date','chk_end_date','chk_detail','note','chk_result','eqi_stat']" 
            title="설비점검항목">
        </EqiiManageTable>
    </div>
</template>