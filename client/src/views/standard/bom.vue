<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

import BomSearchBar from './components/Bom-SearchBar.vue'
import BomTable from './components/Bom-Table.vue'
import BomInputForm from './components/BomInputFrom.vue'

// 자식 컴포넌트 refs
const searchRef = ref()
const tableRef = ref()
const formRef = ref()

// 목록 데이터
const bomList = ref([])

// 🔄 페이지 최초 진입 시 전체 목록 조회
onMounted(() => {
  fetchBomList()
})

// ✅ 기본 목록 조회 (/list)
const fetchBomList = async () => {
  try {
    const res = await axios.get('/api/bom/list')
    bomList.value = res.data
  } catch (err) {
    console.error('기본 목록 조회 실패:', err)
  }
}

// 🔍 검색 기능 (/search)
const searchBomList = async (searchParams) => {
  console.log('🔍 검색 조건:', searchParams)
  try {
    const res = await axios.get('/api/bom/search', {
      params: searchParams
    })
    console.log('✅ 검색 결과:', res.data)
    bomList.value = res.data
  } catch (err) {
    console.error('❌ BOM 검색 실패:', err)
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

    await searchBomList(searchParams);
  } catch (err) {
    console.error('❌ 검색 실패:', err);
  }
};

// ✅ 등록 요청 처리
const handleRegister = async () => {
  console.log('📦 [handleRegister] 실행됨')
  try {
    const productData = formRef.value.getFormData()
    const detailData = tableRef.value.getDetailRows()

    const bomData = {
      unit: productData.unit,
      spec: productData.spec,
      regdate: productData.regdate,
      udate: productData.regdate,
      is_used: productData.is_used
    }

    const payload = { productData, bomData, detailData }

    const response = await axios.post('/api/bom/register', payload)
    console.log('✅ 등록 성공:', response.data)
    alert('등록 완료되었습니다!')

    await fetchBomList() // 등록 후 목록 새로고침
    formRef.value.resetForm()     // ✅ 입력폼 초기화
    tableRef.value.resetRows()    // ✅ 자재 테이블 초기화
    
  } catch (error) {
    console.error('❌ 등록 실패:', error)
    alert('등록 실패: ' + error.message)
  }
}

// 📌 테이블 행 클릭 시 상세 조회
const handleRowSelected = async (row) => {
  console.log('🔍 row selected in parent:', row)
  try {
    const res = await axios.get('/api/bom/detail', {
      params: { bom_code: row.bom_code }
    })

    const productData = res.data.product
    const detailRows = res.data.materials

    console.log('📦 상세 응답 데이터:', res.data)

    formRef.value.setFormData(productData)
    tableRef.value.setFormData(detailRows)
  } catch (err) {
    console.error('❌ 상세 조회 실패:', err)
  }
}

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
  <BomSearchBar ref="searchRef" @search="handleSearch" @reset="handleReset" />

  <!-- 📋 테이블 + 입력폼 -->
  <div class="flex flex-col lg:flex-row gap-6 mt-4">
    <!-- 좌측: BOM 목록 테이블 -->
    <BomTable
      ref="tableRef"
      :data="bomList"
      @rowSelected="handleRowSelected"
      @materialRowSelected="handleMaterialSelected"
      class="flex-1"
    />

    <!-- 우측: 입력 폼 -->
    <BomInputForm
      ref="formRef"
      class="w-full lg:w-[40%]"
      @register="handleRegister"
    />
  </div>
</template>
