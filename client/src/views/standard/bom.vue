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
const selectedRow = ref(null)

// 목록 데이터
const bomList = ref([])

// 페이지 최초 진입 시 전체 목록 조회
onMounted(() => {
  fetchBomList()
})

// 기본 목록 조회 (/list)
const fetchBomList = async () => {
  try {
    const res = await axios.get('/api/bom/list')
    bomList.value = res.data
  } catch (err) {
    alert('오류가 발생했습니다. 다시 시도해주세요.');
  }
}

//  검색 기능 (/search)
const searchBomList = async (searchParams) => {
  try {
    const res = await axios.get('/api/bom/search', {
      params: searchParams
    })
    bomList.value = res.data
  } catch (err) {
    alert('오류가 발생했습니다. 다시 시도해주세요.');
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

//  검색 버튼 클릭 시 실행되는 핸들러
const handleSearch = async () => {
  try {
    const rawParams = searchRef.value.getSearchParams();
    const searchParams = cleanParams(rawParams);

    await searchBomList(searchParams);
  } catch (err) {
    alert('오류가 발생했습니다. 다시 시도해주세요.');
  }
};

// 등록 요청 처리
const handleRegister = async () => {
  try {
    const productData = formRef.value.getFormData();
    const detailData = tableRef.value.getDetailRows();

    const bomData = {
      unit: productData.unit,
      spec: productData.spec,
      regdate: productData.regdate,
      udate: productData.regdate,
      is_used: productData.is_used
    };

    const payload = { productData, bomData, detailData };

    await axios.post('/api/bom/register', payload);
    alert('등록이 완료되었습니다!');

    await fetchBomList();            // 목록 새로고침
    formRef.value.resetForm();       // 입력폼 초기화
    tableRef.value.resetRows();      // 자재 테이블 초기화
  } catch (error) {
     alert('오류가 발생했습니다. 다시 시도해주세요.');
  }
};

// 테이블 행 클릭 시 상세 조회
const handleRowSelected = async (row) => {
  try {
    const res = await axios.get('/api/bom/detail', {
      params: { bom_code: row.bom_code }
    })

    const productData = res.data.product
    const detailRows = res.data.materials

    formRef.value.setFormData(productData)
    tableRef.value.setFormData(detailRows)
  } catch (err) {
     alert('오류가 발생했습니다. 다시 시도해주세요.');
  }
}

// 자재 팝업에서 선택 시
const handleMaterialSelected = (matRow) => {
  // console.log('🧾 자재 선택:', matRow)
}

const handleReset = async () => {
  // 검색 조건 초기화
  searchRef.value.resetSearch();

  // 입력 폼 초기화
  formRef.value.resetForm();

  // 자재 테이블 초기화
  tableRef.value.resetRows();

  // 선택된 행 초기화
  tableRef.value.resetSelection()

  // 목록도 다시 가져오기 (완전히 새로고침처럼)
  await fetchBomList();
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
      v-model:selection="selectedRow"
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
