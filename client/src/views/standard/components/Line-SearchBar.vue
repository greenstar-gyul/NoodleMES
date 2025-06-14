<script setup>
import { ref, onMounted, defineExpose  } from 'vue'
import axios from 'axios';
import Button from 'primevue/button'
import SearchText from '@/components/search-bar/SearchText.vue'
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue'

const emit = defineEmits(['search', 'reset'])

const comValueOptions = ref([]);

// 🔍 검색조건 상태 (v-model)
const search = ref({
  line_code: '',
  line_name: '',
  is_used: '',
  regdate_t_from: null,
  regdate_t_to: null
})

// ✅ 검색 조건 getter
const getSearchParams = () => search.value

// ✅ 검색 조건 초기화
const resetSearch = () => {
  search.value = {
    line_code: '',
    line_name: '',
    is_used: '',
    regdate_t_from: null,
    regdate_t_to: null
  }
}

// ✅ 초기화 버튼 클릭 시 내부 리셋 + 부모 알림
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
      <SearchText v-model="search.line_code" label="라인코드" />
      <SearchText v-model="search.line_name" label="라인명" />
      <SearchText v-model="search.is_used" label="사용여부" />
      <SearchDateBetween
        label="등록일자"
        :from="search.regdate_t_from"
        :to="search.regdate_t_to"
        @update:from="search.regdate_t_from = $event"
        @update:to="search.regdate_t_to = $event"
      />
    </div>

    <!-- 버튼 영역 -->
    <div class="flex justify-center gap-3 mt-4">
      <Button label="초기화" severity="contrast" @click="handleResetClick" />
      <Button label="조회" severity="info" @click="$emit('search')" />
    </div>
  </div>
</template>
