<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import QualityListTable from './QualityListTable.vue';
import QualityListSearch from './QualityListSearch.vue';

const qioData = ref([]);
const originalData = ref([]);
const searchRef = ref(null);

const router = useRouter();

const initData = async () => {
  try {
    const result = await axios.get('/api/qlt/qio');
    originalData.value = result.data;
    qioData.value = result.data; 
    console.log('초기 데이터 로드 완료:', result.data.length, '건');
  } catch (err) {
    console.error('초기 데이터 로드 실패:', err);
  } 
}

const updateData = (selectedQio) => {
  
  if (selectedQio && selectedQio[0].qio_code) {
    router.push({
      name: 'qiodetail',
      params: { qioCode: selectedQio[0].qio_code }
    });
    
  } else {
    console.warn('선택된 Qio 데이터가 잘못되었습니다.');
  }
};

const handleSearch = async (searchParams) => {
    try {
        console.log('🔍 검색 조건:', searchParams);
        
        const params = new URLSearchParams();
        
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
 
  <div v-if="qioData.length === 0" class="text-center text-gray-500 mt-4">
    조건에 맞는 데이터가 없습니다.
  </div>
</template>