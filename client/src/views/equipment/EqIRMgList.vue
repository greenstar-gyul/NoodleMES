<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import EqIRMgListTable from './components/EqIRMgListTable.vue';
import EqIRMgListSearch from './components/EqIRMgListSearch.vue';

const eqMaData = ref([]);
const originalData = ref([]);
const searchRef = ref(null);


const router = useRouter();

const initData = async () => {
    try {
        const result = await axios.get('/api/eq/eqirmg');
        originalData.value = result.data;
        eqMaData.value = result.data;
    } catch (err) {
        alert('초기 데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
}

const updateData = (selectedEqMa) => {
    if (selectedEqMa && selectedEqMa[0].eq_ma_code) {
        router.push({
            name: 'eqiiresmg',
            params: { eq_ma_code: selectedEqMa[0].eq_ma_code }
        });
    } else {
        alert('선택된 설비 유지보수 데이터가 잘못되었습니다. 다시 시도해주세요.');
    }
};

const moveToEqMaList = (eqCode) => {
    searchRef.value.resetSearch();

    eqMaData.value = originalData.value.filter(item => item.eq_code === eqCode);

    searchRef.value.setEqCode(eqCode);
};

const handleSearch = async (searchParams) => {
    try {
        const params = new URLSearchParams();

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

const resetSearch = () => {
    eqMaData.value = [...originalData.value];
};

onMounted(() => {
    initData();
})

</script>

<template>
    <EqIRMgListSearch @search="handleSearch" @resetSearch="resetSearch" ref="searchRef" />

    <EqIRMgListTable :eqmadata="eqMaData" @initData="initData" @update:data="updateData" />

    <div v-if="eqMaData.length === 0" class="text-center text-gray-500 mt-4">
        조건에 맞는 데이터가 없습니다.
    </div>
</template>