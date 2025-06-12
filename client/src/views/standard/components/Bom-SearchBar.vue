<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import SearchText from '@/components/search-bar/SearchText.vue'
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue'
import SearchDropdown from '@/components/search-bar/SearchDropdown.vue'

// 🔍 검색조건 상태 (v-model)
const search = ref({
  bom_code: '',
  prod_code: '',
  prod_name: '',
  regdate_from: null,
  regdate_to: null,
  com_value: ''
})

// 외부에서 꺼내기 위한 메서드
const getSearchParams = () => search.value

// 외부에서 초기화하기 위한 메서드
const resetSearch = () => {
  search.value = {
    bom_code: '',
    prod_code: '',
    prod_name: '',
    regdate_from: null,
    regdate_to: null,
    com_value: ''
  }
}

// 외부에서 접근 가능하도록 expose
defineExpose({ getSearchParams, resetSearch })


</script>

<template>
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <!-- 검색 조건 영역 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      <SearchText v-model="search.bom_code" label="BOM코드" />
      <SearchText v-model="search.prod_code" label="제품코드" />
      <SearchText v-model="search.prod_name" label="제품명" />
      <SearchDropdown label="제품유형" v-model="search.com_value" :options="comValueOptions" />
      <SearchDateBetween
        label="등록일자"
        :from="search.regdate_from"
        :to="search.regdate_to"
        @update:from="search.regdate_from = $event"
        @update:to="search.regdate_to = $event"
      />
    </div>

    <!-- 버튼 영역 -->
    <div class="flex justify-center gap-3 mt-4">
      <Button label="초기화" severity="contrast" @click="resetSearch" />
      <Button label="조회" severity="info" @click="$emit('search')" />
    </div>
  </div>
</template>
