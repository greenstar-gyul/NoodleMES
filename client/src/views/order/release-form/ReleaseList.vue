<script setup>
import ReleaseListSearch from './release-list-sub/ReleaseListSearch.vue';
import ReleaseTable from './release-list-sub/ReleaseTable.vue';
</script>

<template>
    <!-- ===== 검색바 영역 ===== -->
    <ReleaseListSearch/>

    <!-- ===== 검색조회 영역 ===== -->
    <ReleaseTable/>  
</template>