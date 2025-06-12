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

// 등록 요청
const handleRegister = async () => {
    console.log('🔍 [handleSearch] 실행됨'); // ✅ 확인용 로그
  try {
    const productData = formRef.value.getFormData(); // ✅ ref 이름 일치
    const detailData = tableRef.value.getDetailRows();
     console.log('🔍 검색 파라미터:', searchParams); // ✅ 파라미터 확인
     // 🔧 bomData를 productData에서 추출하여 구성
    const bomData = {
      unit: productData.unit,
      spec: productData.spec,
      regdate: productData.regdate,
      udate: productData.regdate,
      is_used: productData.is_used
    };

    const payload = {
        productData,
        bomData,  
        detailData,
    };

    const response = await axios.post('/api/bom/register', payload);
    console.log('✅ 등록 성공:', response.data);
    alert('등록 완료되었습니다!');

    // 🔁 등록 완료 후 목록 재조회
    await fetchBomList();

  } catch (error) {
    console.error('❌ 등록 실패:', error);
    alert('등록 실패: ' + error.message);
  }
};

// 목록 테이블 선택시 
const handleRowSelected = async (row) => {
  console.log('🔍 row selected in parent:', row);
  try {
    const res = await axios.get('/api/bom/detail', {
      params: { bom_code: row.bom_code }
    });

    const productData = res.data.product;
    const detailRows = res.data.materials; // ✅ 여기 수정

    console.log('📦 응답 데이터:', res.data);

    formRef.value.setFormData(productData);
    tableRef.value.setFormData(detailRows);
  } catch (err) {
    console.error('❌ 상세 조회 실패:', err);
  }
};

const handleMaterialSelected = (matRow) => {
  console.log('🧾 자재 선택:', matRow);
  // 필요한 로직 (선택 삭제 등)
};


const bomList = ref([]);

onMounted(() => {
    fetchBomList ()
});

// 목록조회
const fetchBomList = async () => {
    console.log('📡 기본 목록 fetch 시도');
    try {
    const res = await axios.get('/api/bom/list')
    console.log('✅ 기본 목록 결과:', res.data);
    bomList.value = res.data
    } catch (err) {
    console.error('❌ 기본 목록 조회 실패:', err);
    }
}


// 조회
const handleSearch = async () => {
    console.log('✅ [handleSearch] 실행됨');
  try {
    const searchParams = searchRef.value.getSearchParams(); // searchBar에서 params 가져오기
     console.log('🔍 검색 파라미터:', searchParams);
    const res = await axios.get('/api/bom/list', { params: searchParams });
     console.log('📦 검색 응답 데이터:', res.data);
    bomList.value = res.data; // 테이블에 바인딩되는 데이터에 저장
  } catch (err) {
    console.error('❌ 검색 실패:', err);
  }
};





</script>

<template>
  <!-- 🔍 검색바 영역 -->
  <BomSearchBar ref="searchRef" @search="handleSearch" />

  <!-- 📋 검색 결과 + 입력폼 구성 -->
  <div class="flex flex-col lg:flex-row gap-6 mt-4">
    <!-- 좌측: 테이블 (60%) -->
    <BomTable ref="tableRef" :data="bomList" 
    @rowSelected="handleRowSelected"
    @materialRowSelected="handleMaterialSelected"
    class="flex-1" />

    <!-- 우측: 입력폼 (40%) -->
    <BomInputForm ref="formRef" class="w-full lg:w-[40%]" @register="handleRegister" />
  </div>
</template>
