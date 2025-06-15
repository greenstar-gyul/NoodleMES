<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import moment from 'moment';
import performanceListSearchbar from './performanceList-sub/performanceList-searchbar.vue';
import performanceListTable from './performanceList-sub/performanceList-table.vue';

const tableData = ref([]);


// ✅ 검색 초기화
const resetSearch = async () => {
    
};

</script>

<template>
    <performanceListSearchbar @search="handleSearch" @reset="resetSearch"/>

    <performanceListTable :data="tableData"/>
</template>