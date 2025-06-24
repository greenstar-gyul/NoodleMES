<script setup>
import { onMounted, ref } from 'vue';
import Button from 'primevue/button';
import SearchText from '@/components/search-bar/SearchText.vue';
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue';
import moment from 'moment';
import LabeledSelect from '../../../components/registration-bar/LabeledSelect.vue';

const searchOption = ref({
  eqii_code: '',
  stat: 'all',
  inst_emp_name: '',
  start_date: null,
  end_date: null,
  note: ''
});

const emit = defineEmits(['search', 'resetSearch']);

const fetchSearch = () => {
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
  emit('search', searchParams);
};

const eqiiOption = [
  { label: '전체', value: 'all' },
  { label: '점검중', value: 'u1' },
  { label: '점검완료', value: 'u2' },
  { label: '지시전달', value: 'u3' }
]

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
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      <SearchText v-model="searchOption.eqii_code" label="점검지시코드" placeholder="점검지시코드를 입력하세요" />

      <SearchDateBetween label="지시일자" :from="searchOption.start_date" :to="searchOption.end_date"
        @update:from="searchOption.start_date = $event" @update:to="searchOption.end_date = $event" />

      <LabeledSelect v-model="searchOption.stat" label="상태" :options="eqiiOption" defaultValue="전체" />

      <SearchText v-model="searchOption.inst_emp_name" label="지시자명" placeholder="지시자명을 입력하세요" />
    </div>

    <div class="flex justify-center gap-3 mt-4">
      <Button label="초기화" severity="contrast" @click="handleReset" />
      <Button label="조회" severity="info" @click="fetchSearch" />
    </div>
  </div>
</template>