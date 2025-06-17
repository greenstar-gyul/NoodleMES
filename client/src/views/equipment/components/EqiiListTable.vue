<script setup>
import { onMounted, defineProps, defineEmits, computed, ref } from 'vue';
import moment from 'moment';
import EqTableWithExcel from '../components/EqTableWithExcel.vue';
import eqiiMapping from '../../../service/EquipIIMapping';

const props = defineProps({
  eqiidata: Array,
  required: true,
});

const pickedEqii = ref(null); // 선택된 Eqii 데이터
const emit = defineEmits(['initData', 'update:data']);

const eqiiOption = [
  { label: '전체', value: 'all' },
    { label: '점검중', value: 'u1' },
    { label: '점검완료', value: 'u2' },
    { label: '지시전달', value: 'u3' }
]

const getStatLabel = (statValue) => {
  if (!statValue) return '';
  const option = eqiiOption.find(opt => opt.value === statValue);
  return option ? option.label : statValue; // 못 찾으면 원본 값 반환
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return moment(dateString).format('YYYY-MM-DD HH:mm');
};

const formattedEqiiData = computed(() => {
  if (!props.eqiidata || !Array.isArray(props.eqiidata)) return [];
  
  return props.eqiidata.map(item => ({
    ...item,
    inst_date: formatDate(item.inst_date),
    chk_exp_date: formatDate(item.chk_exp_date),
    stat: getStatLabel(item.stat)
  }));
});

// EqTableWithExcel에서 crctEqii을 받아온 것을 부모로 전달하는 함수
const handleEqiiSelect = (eqii) => {
  pickedEqii.value = eqii;
  console.log('선택된 Eqii:', eqii);
  emit('update:data', eqii); // 부모 컴포넌트로 선택된 Eqii 데이터 전달
};

onMounted(() => {
  emit('initData');
});
</script>

<template>
  <EqTableWithExcel 
    :data="formattedEqiiData" 
    :dataKey="'eqii_code'" 
    :columns="['eqii_code', 'inst_date', 'chk_exp_date', 'stat', 'inst_emp_name', 'note']"
    :mapper="{
      eqii_code: '점검지시코드', 
      inst_date: '지시일자', 
      chk_exp_date: '점검만료일', 
      stat: '상태', 
      inst_emp_name: '지시자명', 
      note: '비고'
    }"
    title="검색결과" 
    @crctEqii="handleEqiiSelect"
  />
</template>