<template>
  <!-- 🔍 검색바 영역 -->
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      <!-- MRP코드 -->
      <SearchText v-model="search.mrp_code" label="MRP코드" placeholder="MRP코드를 입력하세요" />

      <!-- 계획명 -->
      <SearchText v-model="search.mat_name" label="자재명" placeholder="자재명을 입력하세요" />

      <!-- 계획일자 -->
      <SearchDateBetween
        label="계획일자"
        :from="search.mrp_date_from"
        :to="search.mrp_date_to"
        @update:from="search.mrp_date_from = $event"
        @update:to="search.mrp_date_to = $event"
      />

      <SearchDateBetween
        label="납기일자"
        :from="search.due_date_from"
        :to="search.due_date_to"
        @update:from="search.due_date_from = $event"
        @update:to="search.due_date_to = $event"
      />

    </div>

    <!-- 조회/초기화 버튼 -->
    <div class="flex justify-center gap-3 mt-4">
      <Button label="초기화" severity="contrast" @click="resetSearch" />
      <Button label="조회" severity="info" @click="searchMRPs" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import TableList from '@/components/form/TableWithExcel.vue';
import SearchText from '@/components/search-bar/SearchText.vue';
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue';

import ProductMapper from '@/service/ProductionMapping.js';

import ProductionData from '@/service/ProductionData.js';

// 데이터 및 옵션
const productiondata = ref(ProductionData);

// 검색 조건 초기값
const search = ref({
  mrp_code: '',
  mat_name: '',
  mrp_date_from: null,
  mrp_date_to: null,
  line: ''
});

// 초기화
const resetSearch = () => {
  search.value = {
    mrp_code: '',
    mat_name: '',
    mrp_date_from: null,
    mrp_date_to: null,
    line: ''
  };
  productiondata.value = [...ProductionData];
};


const searchMRPs = () => {
  // productiondata.value = ProductionData.filter(item => {
  //   const matchCode = !search.value.mrp_code || item.mrp_code.includes(search.value.mrp_code);
  //   const matchName = !search.value.mat_name || item.mat_name.includes(search.value.mat_name);

  //   const prdpDate = new Date(item.prdp_date);
  //   const dueDate = new Date(item.due_date);

  //   const matchDate =
  //     (!search.value.mrp_date_from && !search.value.mrp_date_to) ||
  //     ((!search.value.mrp_date_from || prdpDate >= search.value.mrp_date_from) &&
  //       (!search.value.mrp_date_to || prdpDate <= search.value.mrp_date_to));

  //   const matchDueDate =
  //     (!search.value.due_date_from && !search.value.due_date_to) ||
  //     ((!search.value.due_date_from || dueDate >= search.value.due_date_from) &&
  //       (!search.value.due_date_to || dueDate <= search.value.due_date_to));

  //   return matchCode && matchName && matchDate && matchDueDate;
  // });
};



</script>
