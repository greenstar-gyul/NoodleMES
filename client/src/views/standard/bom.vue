<script setup>
import BomSearcBar from './components/Bom-SeacrBar.vue';
import BomTable from './components/Bom-Table.vue';
import BomInputForm from './components/BomInputFrom.vue';
</script>
<template>
    <!-- 🔍 검색바 영역 -->
    <BomSearcBar/>
    <!-- 📋 검색 조회 테이블 영역 -->
    <div class="flex flex-col lg:flex-row gap-6 mt-4">
        <!-- 좌측: 검색결과 + 하위자재 구성 (60%) -->
          <BomTable @update:productRows="val => productRows = val" />
        <!-- 우측: 제품 등록 영역 (40%) --> 
        <BomInputForm/>  
    </div>
</template>