<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import EqirMaListSearch from './components/EqirMaListSearch.vue';
import axios from 'axios';
import moment from 'moment';

const currentEqMaCode = ref('');
const route = useRoute();

// 설비 유지보수 정보
const eqMaInfo = ref({
  eq_ma_code: '',
  eq_name: '',
  fail_date: new Date(),
  fail_cause: '',
  act_detail: '',
  act_result: '',
  start_date: new Date(),
  end_date: new Date(),
  re_chk_exp_date: new Date(),
  eqir_code: '',
  regdate: new Date(),
  note: '',
  m_emp_name: '',
  fix_emp_name: ''
});

const getEqMaCodeFromRoute = () => {
  const eqMaCodeParam = route.params.eq_ma_code || route.query.eq_ma_code;
  return eqMaCodeParam || '';
}

const loadEqMaDataByCode = async (eqMaCodeParam) => {
  if (!eqMaCodeParam) return;

  try {
    const response = await axios.get(`/api/eq/eqirmg/${eqMaCodeParam}`);
    
    let actualData = null;
    
    if (response.data && response.data.success && response.data.data) {
      actualData = response.data.data;
    } else if (response.data && !response.data.success && typeof response.data === 'object') {
      actualData = response.data;
    } else if (Array.isArray(response.data) && response.data.length > 0) {
      actualData = response.data[0];
    }
    
    if (actualData && actualData.eq_ma_code) {
      
      eqMaInfo.value = { ...actualData };
      currentEqMaCode.value = actualData.eq_ma_code;
    } else {
      alert('해당 설비 유지보수 정보를 찾을 수 없습니다. 다시 시도해주세요.');
    }
    
  } catch (error) {
    alert('설비 유지보수 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
};

onMounted(async () => {
  const eqMaCodeFromRoute = getEqMaCodeFromRoute();

  if (eqMaCodeFromRoute) {
    await loadEqMaDataByCode(eqMaCodeFromRoute);
  }
});

const formatDateForDB = (date) => {
  if (!date) return null;
  return moment(date).format('YYYY-MM-DD hh:mm:ss');
};

const formatDateTimeForDB = (date) => {
  if (!date) return null;
  return moment(date).format('YYYY-MM-DD hh:mm:ss');
};

const validateData = () => {
  if (!eqMaInfo.value.fail_date) {
    alert('고장일을 입력해주세요.');
    return false;
  }
  if (!eqMaInfo.value.act_detail) {
    alert('조치내용을 입력해주세요.');
    return false;
  }
  if (!eqMaInfo.value.start_date) {
    alert('조치시작일시를 입력해주세요.');
    return false;
  }
  if (!eqMaInfo.value.end_date) {
    alert('조치종료일시를 입력해주세요.');
    return false;
  }
  if (!eqMaInfo.value.act_result) {
    alert('조치결과를 선택해주세요.');
    return false;
  }

  return true;
};

const saveData = async () => {
    if (!confirm('설비 유지보수 정보를 저장하시겠습니까?')) {
        alert('저장을 취소했습니다.');
        return;
    }

    if (!validateData()) {
        return;
    }

    try {
        const eqMaDataForServer = {
            eq_ma_code: eqMaInfo.value.eq_ma_code,
            fail_date: formatDateForDB(eqMaInfo.value.fail_date),
            fail_cause: eqMaInfo.value.fail_cause,
            act_detail: eqMaInfo.value.act_detail,
            act_result: eqMaInfo.value.act_result,
            start_date: formatDateTimeForDB(eqMaInfo.value.start_date),
            end_date: formatDateTimeForDB(eqMaInfo.value.end_date),
            re_chk_exp_date: formatDateForDB(eqMaInfo.value.re_chk_exp_date),
            eqir_code: eqMaInfo.value.eqir_code,
            regdate: formatDateTimeForDB(eqMaInfo.value.regdate),
            note: eqMaInfo.value.note,
            m_emp_name: eqMaInfo.value.m_emp_name || '최설비',
            fix_emp_name: eqMaInfo.value.fix_emp_name || '최설비'
        };

        let response;
        if (!eqMaInfo.value.eq_ma_code) {
            response = await axios.post(`/api/eq/eqirmg`, eqMaDataForServer);
        } else {
            response = await axios.put(`/api/eq/eqirmg/${eqMaInfo.value.eq_ma_code}`, eqMaDataForServer);
        }

        const result = response.data;

        if (result && result.success) {
            alert('저장에 성공했습니다.');
            
            const newEqMaCode = result.eq_ma_code || (result.data && result.data.eq_ma_code);
            if (newEqMaCode && !eqMaInfo.value.eq_ma_code) {
                eqMaInfo.value.eq_ma_code = newEqMaCode;
                currentEqMaCode.value = newEqMaCode;
            }
            return;
        }
        alert('저장에 실패했습니다. 다시 시도해주세요.');
        
    } catch (error) {
        if (error.response) {
            alert(`저장 중 서버 오류가 발생했습니다: ${error.response.data.message || '알 수 없는 오류'}`);
        } else {
            alert('저장 중 네트워크 오류가 발생했습니다. 다시 시도해주세요.');
        }
    }
};

const resetData = () => {
  eqMaInfo.value = {
    eq_ma_code: '',
    eq_name: '',
    fail_date: new Date(),
    fail_cause: '',
    act_detail: '',
    act_result: '',
    start_date: new Date(),
    end_date: new Date(),
    re_chk_exp_date: new Date(),
    eqir_code: '',
    regdate: new Date(),
    note: '',
    m_emp_name: '최설비',
    fix_emp_name: '최설비'
  };
  currentEqMaCode.value = '';
};

const updateEqMaInfo = (newData) => {
  const hasChanges = Object.keys(newData).some(key =>
    eqMaInfo.value[key] !== newData[key]
  );

  if (!hasChanges) {
    return;
  }

  eqMaInfo.value = { ...eqMaInfo.value, ...newData };

  if (newData.eq_ma_code && newData.eq_ma_code !== currentEqMaCode.value) {
    currentEqMaCode.value = newData.eq_ma_code;
  }
};

</script>

<template>
  <div>
    <EqirMaListSearch :data="eqMaInfo" @update:data="updateEqMaInfo" @reset-list="resetData" @save-data="saveData">
    </EqirMaListSearch>
  </div>
</template>