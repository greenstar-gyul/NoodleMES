<script setup>
import { onMounted, defineProps, defineEmits, computed, ref } from 'vue';
import moment from 'moment';
import QualityTableWithExcel from './QualityTableWithExcel.vue';

const props = defineProps({
  qiodata: Array,
  required: true,
});

const pickedQio = ref(null); // 선택된 Qio 데이터
const emit = defineEmits(['initData', 'update:data']);

const formatDate = (dateString) => {
  if (!dateString) return '';
  return moment(dateString).format('YYYY-MM-DD HH:mm');
};

const formattedQioData = computed(() => {
  if (!props.qiodata || !Array.isArray(props.qiodata)) return [];
  
  return props.qiodata.map(item => ({
    ...item,
    qio_date: formatDate(item.qio_date),
    insp_date: formatDate(item.insp_date)
  }));
});

// EqTableWithExcel에서 crctQio를 받아온 것을 부모로 전달하는 함수
const handleQioSelect = (qio) => {
  pickedQio.value = qio;
  console.log('선택된 Qio:', qio);
  emit('update:data', qio); // 부모 컴포넌트로 선택된 Qio 데이터 전달
};

onMounted(() => {
  emit('initData');
});
</script>

<template>
  <QualityTableWithExcel 
    :data="formattedQioData" 
    :dataKey="'qio_code'" 
    :columns="['qio_code', 'qio_date', 'insp_date', 'prdr_code', 'mpr_d_code', 'emp_name']"
    :mapper="{
      qio_code: '품질검사코드', 
      qio_date: '검사일자', 
      insp_date: '검사완료일자', 
      prdr_code: '생산실적코드',
      mpr_d_code: '구매요청코드',
      emp_name: '직원명'
    }"
    title="검색결과" 
    @crctQio="handleQioSelect"
  />
</template>