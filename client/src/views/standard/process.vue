<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

import ProcSearchBar from './components/ProcSearchBar.vue'
import ProcTable from './components/ProcTable.vue'
import ProcInputForm from './components/ProcInputFrom.vue'

// 자식 컴포넌트 refs
const searchRef = ref()
const tableRef = ref()
const formRef = ref()

// 목록 데이터
const procList = ref([])

// 🔄 페이지 최초 진입 시 전체 목록 조회
onMounted(() => {
  fetchprocList()
})

// ✅ 기본 목록 조회 (/list)
const fetchprocList = async () => {
  try {
    const res = await axios.get('/api/Proc/list')
    procList.value = res.data
  } catch (err) {
    console.error('기본 목록 조회 실패:', err)
  }
}

// 🔍 검색 기능 (/search)
const searchprocList = async (searchParams) => {
  console.log('🔍 검색 조건:', searchParams)
  try {
    const res = await axios.get('/api/proc/search', {
      params: searchParams
    })
    console.log('✅ 검색 결과:', res.data)
    procList.value = res.data
  } catch (err) {
    console.error('❌ 제품 공정흐름도 검색 실패:', err)
  }
}

// 빈문자열 null로 변경
const cleanParams = (params) => {
  const cleaned = {};
  for (const key in params) {
    const value = params[key];
    cleaned[key] = (value === '' || value === undefined) ? null : value;
  }
  return cleaned;
};

// 🔍 검색 버튼 클릭 시 실행되는 핸들러
const handleSearch = async () => {
  console.log('✅ [handleSearch] 실행됨');
  try {
    const rawParams = searchRef.value.getSearchParams();
    console.log('🔍 검색 파라미터 (raw):', rawParams);

    const searchParams = cleanParams(rawParams);
    console.log('🔍 검색 파라미터 (cleaned):', searchParams);

    await searchprocList(searchParams);
  } catch (err) {
    console.error('❌ 검색 실패:', err);
  }
};

// ✅ 등록 요청 처리
const handleRegister = async () => {
  console.log('📦 [handleRegister] 실행됨')
  try {
    const procData = formRef.value.getFormData()
    const detailData = tableRef.value.getDetailRows()

    const payload = { procData, detailData }

    const response = await axios.post('/api/proc/register', payload)
    console.log('✅ 등록 성공:', response.data)
    alert('등록 완료되었습니다!')

    await fetchprocList() // 등록 후 목록 새로고침
    formRef.value.resetForm()     // ✅ 입력폼 초기화
    tableRef.value.resetRows()    // ✅ 자재 테이블 초기화
    
  } catch (error) {
    console.error('❌ 등록 실패:', error)
    alert('등록 실패: ' + error.message)
  }
}

// 📌 테이블 행 클릭 시 공정 흐름도 상세 조회
const handleRowSelected = async (row) => {
  console.log('🔍 row selected in parent:', row);

  try {
    const res = await axios.get('/api/proc/detail', {
      params: { prod_proc_code: row.prod_proc_code }
    });

    const productData = res.data.header;      // 상단 폼용 데이터
    const detailRows = res.data.details;      // 하단 테이블용 데이터

    console.log('📦 공정 흐름도 상세 응답:', res.data);

    formRef.value.setFormData(productData);   // 상단 입력 영역
    tableRef.value.setFormData(detailRows);   // 하단 흐름도 테이블
  } catch (err) {
    console.error('❌ 공정 흐름도 상세 조회 실패:', err);
  }
};

// 🔧 자재 팝업에서 선택 시
const handleMaterialSelected = (matRow) => {
  console.log('🧾 자재 선택:', matRow)
  // (선택 로직은 필요 시 여기에 작성)
}

// 초기화 버튼 클릭시
const handleReset = async () => {
  await fetchBomList(); // 전체 목록 다시 불러오기
};
</script>

<template>
  <!-- 🔍 검색바 -->
  <ProcSearchBar ref="searchRef" @search="handleSearch" @reset="handleReset" />

  <!-- 📋 테이블 + 입력폼 -->
  <div class="flex flex-col lg:flex-row gap-6 mt-4">
    <!-- 좌측: BOM 목록 테이블 -->
    <ProcTable
      ref="tableRef"
      :data="procList"
      @rowSelected="handleRowSelected"
      @materialRowSelected="handleMaterialSelected"
      class="flex-1"
    />

    <!-- 우측: 입력 폼 -->
    <ProcInputForm
      ref="formRef"
      class="w-full lg:w-[40%]"
      @register="handleRegister"
    />
  </div>
</template>
