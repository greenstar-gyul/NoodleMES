<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import EqIRMgListTable from './components/EqIRMgListTable.vue';
import EqIRMgListSearch from './components/EqIRMgListSearch.vue';

// 데이터 및 옵션
const eqMaData = ref([]); // 화면에 표시할 데이터 (설비 유지보수 데이터)
const originalData = ref([]); // 초기 원본 데이터
const searchRef = ref(null); // 초기화 기능에 사용

const router = useRouter(); // 라우트 정보 가져오기

// 초기 데이터 로드
const initData = async () => {
    try {
        const result = await axios.get('/api/eq/eqirmg');
        originalData.value = result.data;
        eqMaData.value = result.data;
        console.log('초기 데이터 로드 완료:', result.data.length, '건');
    } catch (err) {
        console.error('초기 데이터 로드 실패:', err);
    }
}

// update:data 이벤트 핸들러 - 선택된 설비 유지보수 데이터로 상세 페이지 이동
const updateData = (selectedEqMa) => {
    if (selectedEqMa && selectedEqMa[0].eq_ma_code) {
        router.push({
            name: 'eqiiresmg',
            params: { eq_ma_code: selectedEqMa[0].eq_ma_code }
        });
    } else {
        console.warn('선택된 설비 유지보수 데이터가 잘못되었습니다.');
    }
};

// 특정 설비코드로 필터링하는 함수
const moveToEqMaList = (eqCode) => {
    console.log('이동할 eqCode:', eqCode);
    // 검색 조건 초기화
    searchRef.value.resetSearch();

    // eqMaData를 해당 설비코드로 필터링
    eqMaData.value = originalData.value.filter(item => item.eq_code === eqCode);

    // 검색 컴포넌트에 eqCode 전달
    searchRef.value.setEqCode(eqCode);
};

const handleSearch = async (searchParams) => {
    try {
        console.log('🔍 검색 조건:', searchParams);

        // 검색 API 호출
        const params = new URLSearchParams();

        // null이나 빈 값이 아닌 경우만 파라미터에 추가
        if (searchParams.eq_ma_code) params.append('eq_ma_code', searchParams.eq_ma_code);
        if (searchParams.eq_name) params.append('eq_name', searchParams.eq_name);
        if (searchParams.act_result) params.append('act_result', searchParams.act_result);
        if (searchParams.fail_cause) params.append('fail_cause', searchParams.fail_cause);
        if (searchParams.m_emp_name) params.append('m_emp_name', searchParams.m_emp_name);
        if (searchParams.fix_emp_name) params.append('fix_emp_name', searchParams.fix_emp_name);
        if (searchParams.start_date) params.append('start_date', searchParams.start_date);
        if (searchParams.end_date) params.append('end_date', searchParams.end_date);

        const response = await axios.get(`/api/eq/eqirmg/search?${params}`);

        if (response.data.success) {
            eqMaData.value = response.data.data;
        } else {
            eqMaData.value = [];
        }
    } catch (error) {
        eqMaData.value = [];
    }
};

// 검색 조건 초기화
const resetSearch = () => {
    eqMaData.value = [...originalData.value];
};

onMounted(() => {
    initData();
})

</script>

<template>
    <!-- 검색 컴포넌트 -->
    <EqIRMgListSearch @search="handleSearch" @resetSearch="resetSearch" ref="searchRef" />

    <!-- 테이블 컴포넌트 -->
    <EqIRMgListTable :eqmadata="eqMaData" @initData="initData" @update:data="updateData" />

    <!-- 조건 미일치 메시지 -->
    <div v-if="eqMaData.length === 0" class="text-center text-gray-500 mt-4">
        조건에 맞는 데이터가 없습니다.
    </div>
</template>