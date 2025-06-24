<script setup>
import { ref, onMounted, defineExpose  } from 'vue'
import axios from 'axios';
import Button from 'primevue/button'
import SearchText from '@/components/search-bar/SearchText.vue'
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue'
import SearchDropdown from '@/components/search-bar/SearchDropdown.vue'

const emit = defineEmits(['search', 'reset'])

const comValueOptions = ref([]);

// 검색조건 상태 (v-model)
const search = ref({
  bom_code: '',
  prod_code: '',
  prod_name: '',
  regdate_from: null,
  regdate_to: null,
  com_value: ''
})

// 검색 조건 getter
const getSearchParams = () => search.value

// 검색 조건 초기화
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

// 초기화 버튼 클릭 시 내부 리셋 + 부모 알림
const handleResetClick = () => {
  resetSearch()
  emit('reset')
}

// 외부에서 접근할 수 있도록 메서드 공개
defineExpose({ getSearchParams, resetSearch })

onMounted(async () => {
  try {
    const res = await axios.get('/api/bom/com-values');
    comValueOptions.value = res.data.map(row => ({
      label: row.com_name,     // 사용자에게 보여줄 이름
      value: row.com_value     // 실제 검색에 사용될 코드
    }));
  } catch (err) {
    console.error('❌ 제품유형 옵션 불러오기 실패:', err);
  }
});

</script>

<template>
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <!-- 검색 조건 영역 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      <SearchText v-model="search.bom_code" label="BOM코드" />
      <SearchText v-model="search.prod_code" label="제품코드" />
      <SearchText v-model="search.prod_name" label="제품명" />
      <SearchDropdown
        label="제품유형"
        v-model="search.com_value"
        :options="comValueOptions"
      />
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
