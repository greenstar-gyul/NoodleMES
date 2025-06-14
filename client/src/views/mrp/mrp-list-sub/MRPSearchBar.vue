<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import SearchText from '@/components/search-bar/SearchText.vue';
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue';

const emit = defineEmits(['search', 'reset']);

// 📌 오늘 기준 월의 1일과 말일 계산
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth(); // 0-based (6월이면 5)
const firstDay = new Date(year, month, 1);
const lastDay = new Date(year, month + 1, 0); // 다음 달 0일 = 말일

// 검색 조건을 저장할 반응형 객체
const search = ref({
    mrp_code: '',
    prdp_code: '',
    prdp_name: '',
    mat_name: '',
    plan_date_from: firstDay.toISOString().slice(0, 10),
    plan_date_to: lastDay.toISOString().slice(0, 10)
});

// 조회 버튼 클릭 시 emit
const fetchPrdps = () => {
  emit('search', search.value);
};

// 초기화 버튼 클릭 시 emit
const resetSearch = () => {
  search.value = {
    mrp_code: '',
    prdp_code: '',
    prdp_name: '',
    mat_name: '',
    plan_date_from: firstDay.toISOString().slice(0, 10),
    plan_date_to: lastDay.toISOString().slice(0, 10)
  };
  emit('reset');
};
</script>

<template>
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      <SearchText v-model="search.mrp_code" label="MRP코드" placeholder="MRP코드를 입력하세요" />
      <SearchText v-model="search.prdp_code" label="생산계획코드" placeholder="생산계획코드를 입력하세요" />
      <SearchText v-model="search.prdp_name" label="생산계획명" placeholder="생산계획명을 입력하세요" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      <div class="col-span-1">
        <SearchText v-model="search.mat_name" label="자재명" placeholder="자재명을 입력하세요" />
      </div>
      <div class="col-span-2">
        <SearchDateBetween label="MRP계획일자" :from="search.plan_date_from" :to="search.plan_date_to"
        @update:from="search.plan_date_from = $event"
        @update:to="search.plan_date_to = $event" />
      </div>
    </div>

    <div class="flex justify-center gap-3 mt-4">
      <Button label="초기화" severity="contrast" @click="resetSearch" />
      <Button label="조회" severity="info" @click="fetchPrdps" />
    </div>
  </div>
</template>