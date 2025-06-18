<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useReleaseListStore } from '@/stores/releaseListStore';
import SearchText from '@/components/search-bar/SearchText.vue';
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue';
import SearchDropdownValue from '../../../../components/search-bar/SearchDropdownValue.vue';
import SearchNumberBetween from '@/components/search-bar/SearchNumberBetween.vue';
import Button from 'primevue/button';


// 피니아
const relStore = useReleaseListStore();
const { search } = storeToRefs(relStore);
const { fetchReleasesByDate, fetchReleasesBySearch, resetSearch } = relStore;

onMounted(() => {
  fetchReleasesByDate();
});

// 검색 초기화 함수
const onReset = () => {
  resetSearch();
  fetchReleasesByDate();
};

// 검색 실행
const onSearch = () => {
  const values = Object.values(search.value);
  const hasCondition = values.some(v => v !== '' && v !== null);
  if (hasCondition) {
    fetchReleasesBySearch();
  } else {
    fetchReleasesByDate();
  }
};
</script>

<template>
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <!-- 검색 조건 영역 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      <SearchText v-model="search.out_req_d_code" label="출고요청상세코드" placeholder="출고요청상세코드를 입력하세요" />
      <SearchText v-model="search.prod_name" label="출고제품명" placeholder="출고제품명을 입력하세요" />
      <SearchNumberBetween label="출고수량" v-model:from="search.prod_qtt_from" v-model:to="search.prod_qtt_to" />

      <SearchDateBetween
        label="출고일자"
        :from="search.out_req_date_from"
        :to="search.out_req_date_to"
        @update:from="search.out_req_date_from = $event"
        @update:to="search.out_req_date_to = $event"
      />

      <SearchText v-model="search.emp_name" label="등록자" placeholder="등록자명을 입력하세요" />
      <SearchDropdownValue label="거래처" v-model="search.client_name" :options="[]" />
    </div>

    <!-- 버튼 영역 -->
    <div class="flex justify-center gap-3 mt-4">
      <Button label="초기화" severity="contrast" @click="onReset" />
      <Button label="조회" severity="info" @click="onSearch" />
    </div>
  </div>
</template>