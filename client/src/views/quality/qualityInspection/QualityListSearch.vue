<script setup>
import { onMounted, ref } from 'vue';
import Button from 'primevue/button';
import SearchText from '@/components/search-bar/SearchText.vue';
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue';
import moment from 'moment';

const searchOption = ref({
  qio_code: '',
  prdr_code: '',
  mpr_d_code: '',
  emp_name: '',
  start_date: null,
  end_date: null,
  insp_start_date: null,
  insp_end_date: null
});

const emit = defineEmits(['search', 'resetSearch']);

const fetchSearch = () => {
  const searchParams = {
    qio_code: searchOption.value.qio_code,
    prdr_code: searchOption.value.prdr_code,
    mpr_d_code: searchOption.value.mpr_d_code,
    emp_name: searchOption.value.emp_name,
    start_date: searchOption.value.start_date ?
      moment(searchOption.value.start_date).format('YYYY-MM-DD') : null,
    end_date: searchOption.value.end_date ?
      moment(searchOption.value.end_date).format('YYYY-MM-DD') : null,
    insp_start_date: searchOption.value.insp_start_date ?
      moment(searchOption.value.insp_start_date).format('YYYY-MM-DD') : null,
    insp_end_date: searchOption.value.insp_end_date ?
      moment(searchOption.value.insp_end_date).format('YYYY-MM-DD') : null
  };

  console.log('🔍 검색 조건 전송:', searchParams);
  emit('search', searchParams);
};

const resetSearchOption = () => {
  searchOption.value = {
    qio_code: '',
    prdr_code: '',
    mpr_d_code: '',
    emp_name: '',
    start_date: null,
    end_date: null,
    insp_start_date: null,
    insp_end_date: null
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
      <SearchText v-model="searchOption.qio_code" label="품질검사코드" placeholder="품질검사코드를 입력하세요" />

      <SearchDateBetween label="검사일자" :from="searchOption.start_date" :to="searchOption.end_date"
        @update:from="searchOption.start_date = $event" @update:to="searchOption.end_date = $event" />

      <SearchDateBetween label="검사완료일자" :from="searchOption.insp_start_date" :to="searchOption.insp_end_date"
        @update:from="searchOption.insp_start_date = $event" @update:to="searchOption.insp_end_date = $event" />

      <SearchText v-model="searchOption.prdr_code" label="생산자코드" placeholder="생산자코드를 입력하세요" />

      <SearchText v-model="searchOption.mpr_d_code" label="제조상세코드" placeholder="제조상세코드를 입력하세요" />

      <SearchText v-model="searchOption.emp_name" label="직원명" placeholder="직원명을 입력하세요" />
    </div>

    <div class="flex justify-center gap-3 mt-4">
      <Button label="초기화" severity="contrast" @click="handleReset" />
      <Button label="조회" severity="info" @click="fetchSearch" />
    </div>
  </div>
</template>