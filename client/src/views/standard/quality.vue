<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

import qualitySearchBar from './components/QualitySearchBar.vue'
import qualityTable from './components/QualityTable.vue'
import qualityInput from './components/QualityInput.vue'

// 자식 컴포넌트 refs
const searchRef = ref()
const tableRef = ref()
const formRef = ref()

// 목록 데이터
const bomList = ref([])

// 🔄 페이지 최초 진입 시 전체 목록 조회
onMounted(() => {
  fetchQcrList()
})

// ✅ 기본 목록 조회 (/list)
const fetchQcrList = async () => {
  try {
    const res = await axios.get('/api/qcr/list')
    bomList.value = res.data
  } catch (err) {
    console.error('품질 목록 조회 실패:', err)
  }
}

// 🔍 검색 기능 (/search)
const searchQcrList = async (searchParams) => {
  try {
    const res = await axios.get('/api/qcr/search', {
      params: searchParams
    })
    // ✅ com_value를 라벨로 가공
    bomList.value = res.data.map(item => ({
      ...item,
      com_value: convertComValue(item.com_value)
    }))
  } catch (err) {
    console.error('품질기준정보 조건 검색 실패:', err)
  }
}

// 🔁 변환 함수
const convertComValue = (code) => {
  const map = {
    i1: '완제품',
    i3: '부자재',
    i4: '원자재'
  }
  return map[code] || code
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

    await searchQcrList(searchParams);
  } catch (err) {
    console.error('❌ 검색 실패:', err);
  }
};

// 등록 동작 
const handleRegister = async () => {
  console.log('📦 [handleRegister] 실행됨')
  try {
    const qcrData = formRef.value.getFormData()
    
    // ✅ 객체 그대로 보내기 (key 펼치기!)
    const response = await axios.post('/api/qcr/register', qcrData)

    console.log('✅ 등록 성공:', response.data)
    alert('등록 완료되었습니다!')

    await fetchQcrList()         // 등록 후 목록 새로고침
    formRef.value.resetForm()    // 입력폼 초기화

  } catch (error) {
    console.error('❌ 등록 실패:', error)
    alert('등록 실패: ' + error.message)
  }
}

// 테이블 행 클릭 시 상세 조회
const handleRowSelected = async (row) => {
  console.log('🔍 row selected in parent:', row)
  try {
    const res = await axios.get('/api/qcr/detail', {
      params: { qcr_code: row.qcr_code }
    })

    const qcrData = res.data // ✅ 직접 할당 (product 아님)

    console.log('📦 상세 응답 데이터:', qcrData)

    formRef.value.setFormData(qcrData)
  } catch (err) {
    console.error('❌ 상세 조회 실패:', err)
  }
}

// 초기화 버튼 클릭시
const handleReset = async () => {
  searchRef.value.resetSearch?.()

  tableRef.value.clearSelection?.()

  formRef.value.resetForm?.()

  await fetchQcrList()
}
</script>

<template>
  <!-- 🔍 검색바 -->
  <qualitySearchBar ref="searchRef" @search="handleSearch" @reset="handleReset" />

  <!-- 📋 테이블 + 입력폼 -->
  <div class="flex flex-col lg:flex-row gap-6 mt-4">
    <!-- 좌측: BOM 목록 테이블 -->
    <qualityTable
      ref="tableRef"
      :data="bomList"
      @rowSelected="handleRowSelected"
      class="flex-1"
    />

    <!-- 우측: 입력 폼 -->
    <qualityInput
      ref="formRef"
      class="w-full lg:w-[40%]"
      @register="handleRegister"
    />
  </div>
</template>
