<script setup>
import { onMounted, ref } from 'vue';
import Button from 'primevue/button';
import SearchText from '@/components/search-bar/SearchText.vue';
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue';
import moment from 'moment';
import LabeledSelect from '../../../components/registration-bar/LabeledSelect.vue';



// 품질 관련 검색 파라미터로 변경
const searchOption = ref({
    qio_code: '',        // 지시코드
    selectedInsp: '',    // 지시자명 (검사자, 담당자 등)
    po_code: '',         // 공정코드
    start_date: null,    // 지시일자 시작
    end_date: null,      // 지시일자 종료
    note: ''             // 비고
});

const emit = defineEmits(['search', 'resetSearch']);

// 검색 함수
const fetchSearch = () => {
  const { qio_code, selectedInsp, po_code, start_date, end_date, note } = searchOption.value;

  const searchParams = {
    qio_code,
    selectedInsp,
    po_code,
    start_date: start_date ? moment(start_date).format('YYYY-MM-DD') : null,
    end_date: end_date ? moment(end_date).format('YYYY-MM-DD') : null,
    note
  };

  console.log('🔍 검색 조건 전송:', searchParams);
  emit('search', searchParams);
};

// 초기화 함수
const resetSearchOption = () => {
  searchOption.value = {
    qio_code: '',
    selectedInsp: '',
    po_code: '',
    start_date: null,
    end_date: null,
    note: ''
  };
};

const handleReset = () => {
  resetSearchOption();
  emit('resetSearch');
};

defineExpose({ resetSearchOption });
</script>

<template>
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      <SearchText v-model="searchOption.qio_code" label="지시코드" placeholder="지시코드를 입력하세요" />
      <SearchDateBetween
        label="지시일자"
        :from="searchOption.start_date"
        :to="searchOption.end_date"
        @update:from="searchOption.start_date = $event"
        @update:to="searchOption.end_date = $event"
      />
      <SearchText v-model="searchOption.selectedInsp" label="지시자명" placeholder="지시자명을 입력하세요" />
      <SearchText v-model="searchOption.po_code" label="공정코드" placeholder="공정코드를 입력하세요" />
      <SearchText v-model="searchOption.note" label="비고" placeholder="비고를 입력하세요" />
    </div>

    <div class="flex justify-center gap-3 mt-4">
      <Button label="초기화" severity="contrast" @click="handleReset" />
      <Button label="조회" severity="info" @click="fetchSearch" />
    </div>
  </div>
</template>
