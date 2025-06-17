<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import EqirMaListSearch from './components/EqirMaListSearch.vue';
import axios from 'axios';
import moment from 'moment';

// 현재 설비 유지보수 코드
const currentEqMaCode = ref('');
const route = useRoute();

// 설비 유지보수 정보
const eqMaInfo = ref({
  eq_ma_code: '',
  eq_name: '',
  fail_date: null,
  fail_cause: '',
  act_detail: '',
  act_result: '',
  start_date: null,
  end_date: null,
  re_chk_exp_date: null,
  eqir_code: '',
  regdate: null,
  note: '',
  m_emp_name: '',
  fix_emp_name: ''
});

// 라우트 파라미터에서 eq_ma_code 가져오기
const getEqMaCodeFromRoute = () => {
  const eqMaCodeParam = route.params.eq_ma_code || route.query.eq_ma_code;
  console.log('라우트에서 가져온 eq_ma_code:', eqMaCodeParam);
  console.log('🔍 params:', route.params);
  console.log('🔍 query:', route.query);
  return eqMaCodeParam || '';
}

// 설비 유지보수 데이터 로딩
const loadEqMaDataByCode = async (eqMaCodeParam) => {
  if (!eqMaCodeParam) return;

  try {
    const response = await axios.get(`/api/eq/eqirmg/${eqMaCodeParam}`);
    
    console.log('서버 응답 전체:', response.data); // 디버깅용
    
    let actualData = null;
    
    // 여러 응답 형태 처리
    if (response.data && response.data.success && response.data.data) {
      // {success: true, data: {...}} 형태
      actualData = response.data.data;
    } else if (response.data && !response.data.success && typeof response.data === 'object') {
      // 직접 데이터 객체인 경우
      actualData = response.data;
    } else if (Array.isArray(response.data) && response.data.length > 0) {
      // 배열 형태인 경우 첫 번째 요소
      actualData = response.data[0];
    }
    
    if (actualData && actualData.eq_ma_code) {
      console.log('실제 데이터:', actualData);
      eqMaInfo.value = { ...actualData };
      currentEqMaCode.value = actualData.eq_ma_code;
    } else {
      console.warn('유효한 데이터를 찾을 수 없음:', response.data);
    }
    
  } catch (error) {
    console.error('데이터 로딩 실패:', error);
  }
};

onMounted(async () => {
  // 라우트 파라미터에서 eq_ma_code 확인
  const eqMaCodeFromRoute = getEqMaCodeFromRoute();

  if (eqMaCodeFromRoute) {
    console.log('라우트 파라미터로 eq_ma_code 받음:', eqMaCodeFromRoute);
    // 해당 eq_ma_code로 데이터 로딩
    await loadEqMaDataByCode(eqMaCodeFromRoute);
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
  // 설비 유지보수 정보 검증
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

    // 데이터 검증
    if (!validateData()) {
        return;
    }

    try {
        // 서버 전송용 데이터 변환
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
            // 신규 등록
            response = await axios.post(`/api/eq/eqirmg`, eqMaDataForServer);
        } else {
            // 기존 수정
            response = await axios.put(`/api/eq/eqirmg/${eqMaInfo.value.eq_ma_code}`, eqMaDataForServer);
        }

        const result = response.data;

        // 간단한 성공 체크
        if (result && result.success) {
            alert('저장에 성공했습니다.');
            
            // 신규 등록의 경우 생성된 코드로 업데이트 (여러 케이스 체크)
            const newEqMaCode = result.eq_ma_code || (result.data && result.data.eq_ma_code);
            if (newEqMaCode && !eqMaInfo.value.eq_ma_code) {
                eqMaInfo.value.eq_ma_code = newEqMaCode;
                currentEqMaCode.value = newEqMaCode;
            }
            return;
        }
        
        // 실패 케이스
        console.error('저장 실패 응답:', result);
        alert('저장에 실패했습니다. 다시 시도해주세요.');
        
    } catch (error) {
        console.error('저장 중 오류:', error);
        
        // 에러 응답도 체크
        if (error.response) {
            console.error('서버 에러 응답:', error.response.data);
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
    fail_date: null,
    fail_cause: '',
    act_detail: '',
    act_result: '',
    start_date: null,
    end_date: null,
    re_chk_exp_date: null,
    eqir_code: '',
    regdate: null,
    note: '',
    m_emp_name: '최설비',
    fix_emp_name: '최설비'
  };
  currentEqMaCode.value = '';
};

// eqMaInfo 업데이트 함수 (자식 컴포넌트에서 호출)
const updateEqMaInfo = (newData) => {
  console.log('eqMaInfo 업데이트:', newData);

  // 실제로 변경된 경우에만 업데이트
  const hasChanges = Object.keys(newData).some(key =>
    eqMaInfo.value[key] !== newData[key]
  );

  if (!hasChanges) {
    console.log('변경사항 없음, 업데이트 건너뜀');
    return;
  }

  eqMaInfo.value = { ...eqMaInfo.value, ...newData };

  // eq_ma_code가 변경된 경우 currentEqMaCode도 업데이트
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