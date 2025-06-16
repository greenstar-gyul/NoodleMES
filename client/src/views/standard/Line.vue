<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import moment from 'moment';

import LineSearchBar from './components/Line-SearchBar.vue'
import LineTable from './components/Line-Table.vue'
import LineInputForm from './components/LineInputFrom.vue'

// 자식 컴포넌트 refs
const searchRef = ref()
const tableRef = ref()
const formRef = ref()

// 목록 데이터
const lineList = ref([])
// 제품선택시 설비구성
const equipmentList = ref([])

// 🔄 페이지 최초 진입 시 전체 목록 조회
onMounted(() => {
  fetchLineList()
})

// ✅ 기본 목록 조회 (/list)
const fetchLineList = async () => {
  try {
    const res = await axios.get('/api/line/list');

    // 👉 여기서 regdate_t 포맷 변환
    lineList.value = res.data.map(item => ({
      ...item,
      regdate_t: moment(item.regdate_t).format('YYYY-MM-DD HH:mm')
    }));

  } catch (err) {
    console.error('기본 목록 조회 실패:', err);
  }
};

// 🔍 검색 기능 (/search)
const searchlineList = async (searchParams) => {

  try {
    const res = await axios.get('/api/line/search', {
      params: searchParams
    })

    lineList.value = res.data
  } catch (err) {
    console.error('❌ Line 검색 실패:', err)
  }
}

// 🔍 검색 버튼 클릭 시 실행되는 핸들러
const handleSearch = async () => {

  try {
    const rawParams = searchRef.value.getSearchParams();

    const searchParams = cleanParams(rawParams);

    await searchlineList(searchParams);
  } catch (err) {
    console.error('❌ 검색 실패:', err);
  }
};

// 빈문자열 null로 변경
const cleanParams = (params) => {
  const cleaned = {};
  for (const key in params) {
    const value = params[key];
    cleaned[key] = (value === '' || value === undefined) ? null : value;
  }
  return cleaned;
};



// ✅ 라인 등록 요청 처리
const handleRegister = async () => {
  try {
    const lineData = formRef.value.getFormData();          // 폼에서 가져온 라인 데이터
    const lineDetailData = tableRef.value.getDetailRows(); // 테이블에서 가져온 상세 데이터 (단일 또는 다중)

    const payload = { lineData, lineDetailData };

    const response = await axios.post('/api/line/register', payload);
    console.log('✅ 등록 성공:', response.data);
    alert('등록 완료되었습니다!');

    await fetchLineList();             // 등록 후 목록 새로고침
    formRef.value.resetForm();         // 입력폼 초기화
    tableRef.value.resetRows();        // 상세 테이블 초기화

  } catch (error) {
    console.error('❌ 등록 실패:', error);
    alert('등록 실패: ' + error.message);
  }
};

// 📌 테이블 행 클릭 시 상세 조회
const handleRowSelected = async (row) => {
  try {
    const res = await axios.get('/api/line/detail', {
      params: { line_code: row.line_code } // ✅ 올바른 파라미터 이름 사용
    })

    const lineData = res.data.lineData
    const lineDetailData = res.data.lineDetailData

    formRef.value.setFormData(lineData)
    tableRef.value.setFormData(lineDetailData)
  } catch (err) {
    console.error('❌ 상세 조회 실패:', err)
  }
}

// 초기화 버튼 클릭시
const handleReset = async () => {
  // 1️⃣ 검색바 초기화
  searchRef.value.resetSearch()

  // 2️⃣ 입력폼 초기화
  formRef.value.resetForm()

  // 3️⃣ 상세 테이블 초기화
  tableRef.value.resetRows()

  // 4️⃣ 전체 목록 다시 조회
  await fetchLineList()
}

// 👉 제품 선택 시 설비 구성 조회
const handleProductSelected = async (product) => {
  console.log('📦 emit 받은 제품:', product); // ✅ 로그 확인
  try {
    const res = await axios.get('/api/line/equipment', {
      params: { prod_code: product.prod_code }
    });
    console.log('✅ 서버 응답:', res.data); // ✅ 응답 확인
    equipmentList.value = res.data;
  } catch (err) {
    console.error('❌ 설비 구성 조회 실패:', err);
  }
};

</script>

<template>
  <!-- 🔍 검색바 -->
  <LineSearchBar ref="searchRef" @search="handleSearch" @reset="handleReset" />

  <!-- 📋 테이블 + 입력폼 -->
  <div class="flex flex-col lg:flex-row gap-6 mt-4">
    <!-- 좌측: BOM 목록 테이블 -->
    <LineTable
      ref="tableRef"
      :data="lineList"
      :tableData="equipmentList" 
      @rowSelected="handleRowSelected"
      class="flex-1"
    />

    <!-- 우측: 입력 폼 -->
    <LineInputForm
      ref="formRef"
      class="w-full lg:w-[40%]"
      :tableData="equipmentList"
      @register="handleRegister"
      @product-selected="handleProductSelected"
    />
  </div>
</template>
