<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import eqiiMapping from '@/service/EquipIIMapping';
import EqiiListTable from './components/EqiiListTable.vue';
import EqiiListSearch from './components/EqiiListSearch.vue';

const eqiiData = ref([]);
const originalData = ref([]);
const searchRef = ref(null);

const router = useRouter();

const initData = async () => {
  try {
    const result = await axios.get('/api/eq/eqiiall');
    originalData.value = result.data;
    eqiiData.value = result.data; 
  } catch (err) {
    alert('초기 데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
  } 
}

const updateData = (selectedEqii) => {
  
  if (selectedEqii && selectedEqii[0].eqii_code) {
    router.push({
      name: 'eqiilist',
      params: { eqiiCode: selectedEqii[0].eqii_code }
    });
  } else {
    alert('선택된 유지보수 데이터가 잘못되었습니다. 다시 시도해주세요.');
  }
};

const handleSearch = async (searchParams) => {
    try {
        const params = new URLSearchParams();
        
        if (searchParams.eqii_code) params.append('eqii_code', searchParams.eqii_code);
        if (searchParams.stat) params.append('stat', searchParams.stat);
        if (searchParams.inst_emp_name) params.append('inst_emp_name', searchParams.inst_emp_name);
        if (searchParams.start_date) params.append('start_date', searchParams.start_date);
        if (searchParams.end_date) params.append('end_date', searchParams.end_date);
        
        const response = await axios.get(`/api/eq/eqii/search?${params}`);
        
        if (response.data.success) {
            eqiiData.value = response.data.data;
        } else {
            eqiiData.value = [];
        }
    } catch (error) {
        eqiiData.value = [];
    }
};

const resetSearch = () => {
  eqiiData.value = [...originalData.value];
};

onMounted(() => {
  initData();
})

</script>

<template>
  <EqiiListSearch 
    @search="handleSearch" 
    @resetSearch="resetSearch"  
    ref="searchRef" 
  />
  
  <EqiiListTable 
    :eqiidata="eqiiData" 
    :mapper="eqiiMapping" 
    @initData="initData" 
    @update:data="updateData"
  />
 
  <div v-if="eqiiData.length === 0" class="text-center text-gray-500 mt-4">
    조건에 맞는 데이터가 없습니다.
  </div>
</template>