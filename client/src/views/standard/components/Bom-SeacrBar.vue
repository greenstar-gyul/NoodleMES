<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import SearchText from '@/components/search-bar/SearchText.vue';
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue';
import SearchDropdown from '@/components/search-bar/SearchDropdown.vue';

// 검색조건 데이터 (v-model로 바인딩됨)
const search = ref({
    prod_code: '',
    prod_name: '',
    regdate_from: null,
    regdate_to: null,
    is_used: ''
});

// 조회 버튼 기능 (API 호출 자리)
const fetchOrders = () => {
    console.log('조회 실행:', search.value);
    // TODO: 실제 API 호출로 데이터 갱신
};

// 초기화 버튼 기능
const resetSearch = () => {
    search.value = {
        prod_code: '',
        prod_name: '',
        regdate_from: null,
        regdate_to: null,
        is_used: ''
    };
};

const comValueOptions = [
    { label: '봉지라면', value: 'a1' },
    { label: '컵라면(대)', value: 'a2' },
    { label: '컵라면(소)', value: 'a3' },
];

</script>
<template>
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
      <!-- 검색 조건 영역 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <!-- 주문번호 -->
          <SearchText v-model="search.prod_code" label="제품코드">
          </SearchText>

          <!-- 주문명 -->
          <SearchText v-model="search.prod_name" label="제품명">
          </SearchText>

          <!-- 상태 -->
          <SearchDropdown label="제품유형" v-model="search.com_value" :options="comValueOptions">
          </SearchDropdown>

          <!-- 납기일 (범위) -->
          <SearchDateBetween label="등록일자" :from="search.regdate_from" :to="search.regdate_to"
              @update:from="search.regdate_from = $event" @update:to="search.regdate_to = $event">
          </SearchDateBetween>

      </div>

      <!-- 조회/초기화 버튼 영역 -->
      <div class="flex justify-center gap-3" style="margin-top: 1rem;">
          <Button label="초기화" severity="contrast" @click="resetSearch" />
          <Button label="조회" severity="info" @click="fetchOrders" />
      </div>
  </div>
</template>