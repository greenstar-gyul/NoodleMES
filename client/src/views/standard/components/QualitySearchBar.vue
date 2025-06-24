<script setup>
import { ref, onMounted, defineExpose  } from 'vue'
import axios from 'axios';
import Button from 'primevue/button'
import SearchText from '@/components/search-bar/SearchText.vue'
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue'
import SearchDropdown from '@/components/search-bar/SearchDropdown.vue'

const emit = defineEmits(['search', 'reset'])


// 검색조건 상태 (v-model)
const search = ref({
  qcr_code: '',
  inspection_item: '',
  com_value: '',
  regdate_from: null,
  regdate_to: null,
})

const TypeOptions = [
  { label: '완제품' , value: 'i1'},
  { label: '부자재' , value: 'i3'},
  { label: '원자재' , value: 'i4'},
]

// 검색 조건 getter
const getSearchParams = () => {
  const result = { ...search.value }
  Object.keys(result).forEach((key) => {
    if (result[key] === '') result[key] = null
  })
  return result
}

// 검색 조건 초기화
const resetSearch = () => {
  search.value = {
    qcr_code: '',
    inspection_item: '',
    com_value: '',
    regdate_from: null,
    regdate_to: null,
  }
}


// 초기화 버튼 클릭 시 내부 리셋 + 부모 알림
const handleResetClick = () => {
  resetSearch()
  emit('reset')
}

// ✅ 외부에서 접근할 수 있도록 메서드 공개
defineExpose({ getSearchParams, resetSearch })


</script>

<template>
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <!-- 검색 조건 영역 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      <SearchText v-model="search.qcr_code" label="품질기준코드" />
      <SearchText v-model="search.inspection_item" label="검사항목명" />
      <SearchDropdown v-model="search.com_value" label="품목유형" :options="TypeOptions" />
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
      <Button label="초기화" severity="contrast" @click="handleResetClick" />
      <Button label="조회" severity="info" @click="$emit('search')" />
    </div>
  </div>
</template>
