<script setup>
import { onMounted, defineProps, defineEmits, computed, ref } from 'vue';
import moment from 'moment';
import EditableTable from '../../../components/form/EditableTable.vue';
import QualityMapping from '../../../service/QualityMapping';

const props = defineProps({
  qltdata: Array,
    required: true
});

const pickedEqii = ref(null); // 선택된  qio 데이터
const emit = defineEmits(['initData', 'update:data']);

const formatDate = (dateString) => {
  if (!dateString) return '';
  return moment(dateString).format('YYYY-MM-DD HH:mm');
};

const formattedEqiiData = computed(() => {
  if (!props.qltdata || !Array.isArray(props.qltdata)) return [];

  return props.qltdata.map(item => ({
    ...item,
    ord_date: formatDate(item.ord_date),     
    po_code: item.po_code,
    selectedInsp: item.selectedInsp
    // stat 필드 제거
  }));
});

// 선택된 데이터 부모로 전달
const handleEqiiSelect = (qio) => {
  pickedEqii.value = qio;
  console.log('선택된 qio:', qio);
  emit('update:data', qio);
};

onMounted(() => {
  emit('initData');
});
</script>

<template>
  <EqTableWithExcel 
    :data="formattedEqiiData" 
    :dataKey="'qio_code'" 
    :columns="['qio_code', 'ord_date', 'po_code', 'selectedInsp', 'note']"
    :mapper="{
      qio_code: '지시코드',
      ord_date: '지시일자',
      po_code: '공정코드',
      selectedInsp: '지시자명',
      note: '비고'
    }"
    title="검색결과" 
    @crctEqii="handleEqiiSelect"
  />
</template>
