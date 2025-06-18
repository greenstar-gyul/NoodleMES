<script setup>
import { onMounted, ref } from 'vue';
import Button from 'primevue/button';
import SearchText from '@/components/search-bar/SearchText.vue';
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue';
import moment from 'moment';
import LabeledSelect from '../../../components/registration-bar/LabeledSelect.vue';

const searchOption = ref({
  eqii_code: '',         // 점검지시코드
  stat: 'all',              // 상태
  inst_emp_name: '',     // 지시자명
  start_date: null,      // 지시일자 시작
  end_date: null,        // 지시일자 종료
  note: ''               // 비고
});

const emit = defineEmits(['search', 'resetSearch']);

const fetchSearch = () => {
  // 날짜 포맷팅
  const searchParams = {
    eqii_code: searchOption.value.eqii_code,
    stat: searchOption.value.stat === 'all' ? '' : searchOption.value.stat,
    inst_emp_name: searchOption.value.inst_emp_name,
    start_date: searchOption.value.start_date ?
      moment(searchOption.value.start_date).format('YYYY-MM-DD') : null,
    end_date: searchOption.value.end_date ?
      moment(searchOption.value.end_date).format('YYYY-MM-DD') : null,
    note: searchOption.value.note
  };

  console.log('🔍 검색 조건 전송:', searchParams);
  emit('search', searchParams);
};

const eqiiOption = [
  { label: '전체', value: 'all' },
  { label: '점검중', value: 'u1' },
  { label: '점검완료', value: 'u2' },
  { label: '지시전달', value: 'u3' }
]

// 초기화
const resetSearchOption = () => {
  searchOption.value = {
    eqii_code: '',
    stat: 'all',
    inst_emp_name: '',
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
  <!-- 검색바 영역 -->
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      <!-- 점검지시코드 -->
      <SearchText v-model="searchOption.eqii_code" label="점검지시코드" placeholder="점검지시코드를 입력하세요" />

      <!-- 지시일자 범위 -->
      <SearchDateBetween label="지시일자" :from="searchOption.start_date" :to="searchOption.end_date"
        @update:from="searchOption.start_date = $event" @update:to="searchOption.end_date = $event" />

      <!-- 상태 -->
      <LabeledSelect v-model="searchOption.stat" label="상태" :options="eqiiOption" defaultValue="전체" />

      <!-- 지시자명 -->
      <SearchText v-model="searchOption.inst_emp_name" label="지시자명" placeholder="지시자명을 입력하세요" />

      <!-- 비고 -->
      <SearchText v-model="searchOption.note" label="비고" placeholder="비고를 입력하세요" />
    </div>

    <!-- 조회/초기화 버튼 -->
    <div class="flex justify-center gap-3 mt-4">
      <Button label="초기화" severity="contrast" @click="handleReset" />
      <Button label="조회" severity="info" @click="fetchSearch" />
    </div>
  </div>
</template>