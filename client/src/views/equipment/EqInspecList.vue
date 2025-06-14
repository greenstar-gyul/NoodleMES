<template>
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <div class="grid grid-cols-1 gap-4">
      <div class="flex justify-between">
        <div>
          <div class="font-semibold text-2xl">설비 점검지시서 정보</div>
        </div>
        <div class="flex items-center gap-2 flex-nowrap">
          <Button label="삭제" severity="danger" class="min-w-fit" />
          <Button label="초기화" severity="contrast" class="min-w-fit" @click="resetForm" />
          <Button label="저장" severity="info" class="min-w-fit" />
          <Button label="점검지시서 불러오기" severity="success" class="min-w-fit whitespace-nowrap" @click="openPopup()" />
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="점검지시서 코드" v-model="selectedOrder.eqii_code" />
      <LabeledDatePicker label="지시일자" :modelValue="formatDate(selectedOrder.inst_date)"
        @update:modelValue="selectedOrder.inst_date = $event" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledDatePicker label="점검 예정일자" :modelValue="formatDate(selectedOrder.chk_exp_date)"
        @update:modelValue="selectedOrder.chk_exp_date = $event" />
      <LabeledSelect label="상태" v-model="selectedOrder.stat" :options="statOptions" optionLabel="label"
        optionValue="value" placeholder="전체" class="flex-1" />
    </div>
  </div>
  <div>
    <EqEditableTable :data="columns" :mapper="eqiiMapper" :dataKey="'eqii_code'" :initialData="equipmentData"
      @update="handleInspectionTableUpdate" @loadEquipment="dialogVisible2 = true" title="지시서 항목 정보"
      scrollHeight="600px" />
  </div>
  <div>
    <EqTable :data="filteredEqoplist" :mapper="eqchkMapper" :dataKey="'eq_code'"
      :title="`점검항목 (${selectedOrder.eq_code || '설비 미선택'})`" />
  </div>
  <!-- 팝업 -->
  <SinglePopup v-model:visible="dialogVisible" :items="eqpops" @confirm="handleInspectionSelect" :mapper="eqiiMapper"
    :dataKey="'eqii_code'"></SinglePopup>
  <SinglePopup v-model:visible="dialogVisible2" :items="filteredEqiilist" @confirm="handleInspectionSelect"
    :mapper="eqiiMapper" :dataKey="'eqii_code'" :title="`점검지시서 선택 (${eq_name || '설비 미선택'})`" />
</template>

<script setup>
import LabeledInput from '@/components/registration-bar/LabeledInput.vue';
import EqTable from '@/views/equipment/components/EqTable.vue'
import SinglePopup from '@/views/equipment/components/EqiiSinglePopup.vue';
import eqMapper from '@/service/EquipmentMapping';
import eqiiMapper from '@/service/EquipSpecInstMapping'
import EqEditableTable from '@/views/equipment/components/EqEditableTable.vue';
import eqchkMapper from '@/service/EqChkListMapping.js'
import axios from 'axios';
import { ref, computed, onMounted } from 'vue'
import { Button } from 'primevue';
import LabeledDatePicker from '../../components/registration-bar/LabeledDatePicker.vue';
import LabeledSelect from '../../components/registration-bar/LabeledSelect.vue';

const columns = ['eqii_code', 'inst_date', 'inst_emp_code', 'eq_chk_type', 'chk_exp_date', 'stat', 'note']

const eqpops = ref([]);

// 팝업
const dialogVisible = ref(false);
// 팝업 2
const dialogVisible2 = ref(false);
const selectedOrder = ref({
  eqii_code: '',
  inst_date: null,
  chk_exp_date: null,
  stat: '',
  note: '',
  inst_emp_code: ''
});

const statOptions = [
  { label: '점검중', value: 'u1' },
  { label: '점검완료', value: 'u2' },
  { label: '지시전달', value: 'u3' }
];

const openPopup = async () => {
  try {
    const response = await axios.get('/api/eq/eqiiall');
    eqpops.value = response.data;
    dialogVisible.value = true;
  } catch (err) {
    console.log('설비 정보 불러오기 실패', err);
  }
}

const handleInspectionTableUpdate = (updatedData) => {
  console.log('점검지시서 테이블 업데이트:', updatedData);
  selectedOrder.value = updatedData;
}

const handleEquipmentSelect = (selectedEquipment) => {
  console.log('선택된 설비:', selectedEquipment);
  eq_code.value = selectedEquipment.eq_code;
  eq_name.value = selectedEquipment.eq_name;
  chk_cycle.value = selectedEquipment.chk_cycle;

  dialogVisible.value = false;
}


//팝업 끝

const filteredEqiilist = computed(() => {
  if (!selectedOrder.eq_code) {
    return []; // 설비가 선택되지 않았으면 빈 배열
  }

  return eqiis.value.filter(item => item.eq_code === eq_code.value);
});

// 데이터 업데이트 처리
const handleUpdate = (updatedData) => {
  equipmentData.value = updatedData
  console.log('데이터 업데이트됨!', updatedData)
}

// 지시정보 불러오기 처리
const handleLoadEquipment = () => {
  console.log('지시정보 불러오기 클릭!')
  // 여기서 API 호출하거나 새 데이터 로드
}

const formatDate = (date) => date?.split('T')[0] || '';

const handleInspectionSelect = (selectedInspection) => {
  console.log('선택된 점검지시서:', selectedInspection);

  // 선택된 점검지시서를 테이블에 추가
  const newRow = {
    eqii_code: selectedInspection.eqii_code,
    inst_date: selectedInspection.inst_date || '',
    inst_emp_code: 'EMP001', // 기본값
    eq_chk_type: selectedInspection.eq_chk_type || '',
    chk_exp_date: selectedInspection.chk_exp_date || '',
    stat: selectedInspection.stat || '대기',
    note: ''
  };

  selectedOrder.value = newRow;

  // 팝업 닫기
  dialogVisible.value = false;
}

const resetForm = () => {
  selectedOrder.value = [];
  console.log('🔄 폼 초기화 완료!');
}

const saveData = async () => {
  const formData = {
    // 설비 기본 정보
    equipment: {
      eq_code: eq_code.value,
      eq_name: eq_name.value,
      chk_cycle: chk_cycle.value,
      latest_date: latest_date.value
    },
    // 점검지시서 정보
    inspection: {
      eqii_code: eqii_code.value,
      inspections: inspectionList.value
    },
    // 선택된 설비의 점검항목들
    checkItems: filteredEqoplist.value
  };

  console.log('💾 저장할 데이터:', formData);
}
</script>