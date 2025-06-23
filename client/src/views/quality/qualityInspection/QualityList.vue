<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import QualityListTable from './QualityListTable.vue';
import QualityListSearch from './QualityListSearch.vue';

// 데이터 및 옵션
const qioData = ref([]);
const originalData = ref([]);
const searchRef = ref(null);

const router = useRouter();

// 초기 데이터 로드
const initData = async () => {
  try {
    const result = await axios.get('/api/qlt/qio');  // 기존 API 사용
    originalData.value = result.data;
    qioData.value = result.data; 
    console.log('초기 데이터 로드 완료:', result.data.length, '건');
  } catch (err) {
    console.error('초기 데이터 로드 실패:', err);
  } 
}

// update:data 이벤트 핸들러
const updateData = (selectedQio) => {
  
  if (selectedQio && selectedQio[0].qio_code) {
    router.push({
      name: 'qiodetail',  // 품질검사 상세 페이지 라우터 이름
      params: { qioCode: selectedQio[0].qio_code }
    });
    
  } else {
    console.warn('선택된 Qio 데이터가 잘못되었습니다.');
  }
};

const handleSearch = async (searchParams) => {
    try {
        console.log('🔍 검색 조건:', searchParams);
        
        // 백엔드 검색 API 호출
        const params = new URLSearchParams();
        
        // null이나 빈 값이 아닌 경우만 파라미터에 추가
        if (searchParams.qio_code) params.append('qio_code', searchParams.qio_code);
        if (searchParams.prdr_code) params.append('prdr_code', searchParams.prdr_code);
        if (searchParams.mpr_d_code) params.append('mpr_d_code', searchParams.mpr_d_code);
        if (searchParams.emp_name) params.append('emp_name', searchParams.emp_name);
        if (searchParams.start_date) params.append('start_date', searchParams.start_date);
        if (searchParams.end_date) params.append('end_date', searchParams.end_date);
        if (searchParams.insp_start_date) params.append('insp_start_date', searchParams.insp_start_date);
        if (searchParams.insp_end_date) params.append('insp_end_date', searchParams.insp_end_date);
        
        const response = await axios.get(`/api/qlt/qio/search?${params}`);
        
        if (response.data.success) {
            qioData.value = response.data.data;
            console.log('🎯 검색 완료:', response.data.count, '건');
        } else {
            console.error('검색 실패:', response.data.message);
            qioData.value = [];
        }
    } catch (error) {
        console.error('🚨 검색 오류:', error);
        qioData.value = [];
    }
};

// 검색 조건 초기화
const resetSearch = () => {
  qioData.value = [...originalData.value];
};

onMounted(() => {
  initData();
})

</script>

<template>
  <QualityListSearch 
    @search="handleSearch" 
    @resetSearch="resetSearch"  
    ref="searchRef" 
  />
  
  <QualityListTable 
    :qiodata="qioData" 
    @initData="initData" 
    @update:data="updateData"
  />
 
  <!-- 조건 미일치 메시지 -->
  <div v-if="qioData.length === 0" class="text-center text-gray-500 mt-4">
    조건에 맞는 데이터가 없습니다.
  </div>
</template>