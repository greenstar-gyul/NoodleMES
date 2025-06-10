<template>
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <div class="grid grid-cols-1 gap-4">
      <div class="flex justify-between">
        <div>
          <div class="font-semibold text-2xl">설비 기준정보</div>
        </div>
        <div class="flex items-center gap-2 flex-nowrap">
          <Button label="삭제" severity="danger" class="min-w-fit" />
          <Button label="초기화" severity="contrast" class="min-w-fit" />
          <Button label="저장" severity="info" class="min-w-fit" />
          <Button label="점검지시서 불러오기" severity="success" class="min-w-fit whitespace-nowrap"
            @click="dialogVisible = true" />
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledReadonlyInput label="점검결과코드" :value="eqii_code" placeholder="생산계획코드" :disabled="true" />
      <LabeledInput label="설비명" v-model="eq_name" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledReadonlyInput label="설비코드" v-model="eqii_code" />
      <LabeledInput label="지시일자" v-model="chk_cycle" :disabled="true" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="점검지시서코드" v-model="eqii_code" />
      <LabeledInput label="점검유형" v-model="chk_cycle" :disabled="true" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledReadonlyInput label="시작일시" v-model="latest_date" />
      <LabeledReadonlyInput label="종료일시" v-model="latest_date" />
    </div>
  </div>
  <div>
    <EqresTable
      :data="eqiires" :mapper="eqiiMgMapper" :dataKey="'chk_std'" :initialData="inspectionList" @update="handleInspectionTableUpdate" @loadInspectionResults="handleLoadInspectionResults"
      title="점검 결과" scrollHeight="600px" />
  </div>
  <!-- 팝업 -->
  <SinglePopup v-model:visible="dialogVisible" :items="eqiis" @confirm="handleEquipIISelect" :mapper="EquipIIMapping"
    :dataKey="'eqii_code'"></SinglePopup>
  <SinglePopup v-model:visible="dialogVisible2" :items="filteredEqiilist" @confirm="handleInspectionSelect"
    :mapper="eqiiMapper" :dataKey="'eqii_code'" :title="`점검지시서 선택 (${eq_name || '설비 미선택'})`" />
</template>

<script setup>
import LabeledInput from '@/components/registration-bar/LabeledInput.vue';
import LabeledReadonlyInput from '@/components/registration-bar/LabeledReadonlyInput.vue';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import eqMapper from '@/service/EquipmentMapping';
import eqiiMapper from '@/service/EquipSpecInstMapping'
import EqEditableTable from '@/views/equipment/components/EqEditableTable.vue';
import EquipIIMapping from '@/service/EquipIIMapping'
import EqresTable from '@/views/equipment/components/EqresTable.vue'
import eqiiMgMapper from '@/service/EquipIIResMgMapping'
import { ref, computed, onMounted } from 'vue'
import { Button } from 'primevue';


const eq_name = ref('')
const inst_date = ref('')
const inst_emp_code = ref('')
const eq_chk_type = ref('')
const eqii_code = ref('CHK' + Date.now().toString().slice(-6))
const chk_cycle = ref('')
const latest_date = ref('')

// 팝업
const dialogVisible = ref(false);
// 팝업 2
const dialogVisible2 = ref(false);

const inspectionList = ref([
  {
    chk_type: '',
    chk_std: '',
    chk_method: '',
    chk_detail: '',
    chk_result: '',
    note: ''
  }
]);

// 팝업시작
const eqiis = ref([
  { eqii_code: 'EQ001', eq_name: '컨베이어 벨트', eq_model: 'CV-A100', chk_cycle: '30일' },
  { eqii_code: 'EQ002', eq_name: '프레스 기계', eq_model: 'PR-B200', chk_cycle: '15일' },
  { eqii_code: 'EQ003', eq_name: '용접기', eq_model: 'WD-C300', chk_cycle: '60일' },
  { eqii_code: 'EQ004', eq_name: '포장기', eq_model: 'PK-D400', chk_cycle: '45일' },
  { eqii_code: 'EQ005', eq_name: '절단기', eq_model: 'CT-E500', chk_cycle: '20일' },
]);

const eqiires = ref([
  { eqii_code: 'EQ001', chk_type: '', chk_std: 'CHK001', chk_method: '2024-06-01', chk_detail: '정기점검', chk_result: '완료' },
  { eqii_code: 'EQ001', chk_type: '', chk_std: 'CHK002', chk_method: '2024-06-02', chk_detail: '특별점검', chk_result: '진행중' },
  { eqii_code: 'EQ002', chk_type: '', chk_std: 'CHK003', chk_method: '2024-06-03', chk_detail: '긴급점검', chk_result: '대기' },
  { eqii_code: 'EQ003', chk_type: '', chk_std: 'CHK004', chk_method: '2024-06-04', chk_detail: '정기점검', chk_result: '완료' },
  { eqii_code: 'EQ005', chk_type: '', chk_std: 'CHK005', chk_method: '2024-06-05', chk_detail: '안전점검', chk_result: '취소' },
]);

const handleLoadInspectionResults = async () => {
  console.log('🚀 점검결과 불러오기 시작!');
  
  // 설비가 선택되었는지 확인
  if (!eqii_code.value || eqii_code.value.startsWith('CHK')) {
    alert('먼저 설비를 선택해주세요! 😅');
    return;
  }
  
  try {
    // 🔥 실제 API 호출 부분 (주석 해제해서 사용)
    /*
    const response = await fetch(`/api/inspection-results/${eqii_code.value}`);
    if (!response.ok) throw new Error('데이터 불러오기 실패');
    
    const newResults = await response.json();
    eqiires.value = newResults;
    */
    
    // 🎭 임시로 더미 데이터 추가 (테스트용)

    eqiires.value = [];

    const newDummyData = [
      { eqii_code: eqii_code.value, chk_std: 'NEW001', chk_method: '2025-06-10', chk_detail: '최신점검', chk_result: '완료' },
      { eqii_code: eqii_code.value, chk_std: 'NEW002', chk_method: '2025-06-10', chk_detail: '안전점검', chk_result: '진행중' },
      { eqii_code: eqii_code.value, chk_std: 'NEW003', chk_method: '2025-06-10', chk_detail: '품질점검', chk_result: '대기' },
    ];
    
    // 기존 데이터에 새 데이터 추가
    eqiires.value = [...eqiires.value, ...newDummyData];
    
  } catch (error) {
    console.error('점검결과 불러오기 실패:', error);
    alert('점검결과를 불러오는 중 오류가 발생했습니다.');
  }
};

const handleInspectionTableUpdate = (updatedData) => {
  console.log('점검지시서 테이블 업데이트:', updatedData);
  inspectionList.value = updatedData;
}

const handleEquipIISelect = (selectedEquipmentIi) => {
  console.log('선택된 설비:', selectedEquipmentIi);
  eqii_code.value = selectedEquipmentIi.eqii_code;
  eq_name.value = selectedEquipmentIi.eq_name;
  chk_cycle.value = selectedEquipmentIi.chk_cycle;

  dialogVisible.value = false;
}

const selectedOrder = ref(null);
//팝업 끝

const filteredEqreslist = computed(() => {
  if (!eqii_code.value) {
    return []; // 점검지시가 선택되지 않았으면 빈 배열
  }

  return eqiis.value.filter(item => item.eqii_code === eqii_code.value);
});

const filteredEqiilist = computed(() => {
  if (!eqii_code.value) {
    return []; // 점검지시가 선택되지 않았으면 빈 배열
  }

  return eqiires.value.filter(item => item.eqii_code === eqii_code.value);
});

const handleInspectionSelect = (selectedInspection) => {
  console.log('선택된 점검지시서:', selectedInspection);

  // 선택된 점검지시서를 테이블에 추가
  const newRow = {
    eqii_code: selectedInspection.eqii_code,
    inst_date: selectedInspection.inst_date || '',
    inst_emp_code: 'EMP001', // 기본값
    eq_chk_type: selectedInspection.eq_chk_type || '',
    chk_exp_date: '',
    stat: selectedInspection.stat || '대기',
    note: ''
  };

  eqoplist.value.push(newRow);

  // 팝업 닫기
  dialogVisible2.value = false;
}

const resetForm = () => {
  eqii_code.value = '';
  eq_name.value = '';
  eqii_code.value = 'CHK' + Date.now().toString().slice(-6);
  chk_cycle.value = '';
  latest_date.value = '';
  inspectionList.value = [];
  // 🆕 점검결과도 초기화
  eqiires.value = [];
  console.log('🔄 폼 초기화 완료!');
}

const saveData = async () => {
  const formData = {
    // 설비 기본 정보
    equipment: {
      eqii_code: eqii_code.value,
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
    checkItems: filteredEqreslist.value
  };
  
  console.log('💾 저장할 데이터:', formData);
  
  // 🚀 DB 연동 (주석 처리)
  /*
  try {
    // 1. 설비 정보 저장/업데이트
    const equipmentResponse = await api.put(`/equipment/${eqii_code.value}`, formData.equipment);
    
    // 2. 점검지시서 저장
    const inspectionResponse = await api.post('/inspection', formData.inspection);
    
    // 3. 점검항목 연결 (필요시)
    const checkItemsResponse = await api.post('/inspection/check-items', {
      eqii_code: eqii_code.value,
      eqii_code: eqii_code.value,
      items: formData.checkItems
    });
    
    console.log('✅ 저장 성공!', {
      equipment: equipmentResponse.data,
      inspection: inspectionResponse.data,
      checkItems: checkItemsResponse.data
    });
    
    // 성공 메시지 표시
    alert('저장이 완료되었습니다!');
    
  } catch (error) {
    console.error('❌ 저장 실패:', error);
    alert('저장 중 오류가 발생했습니다.');
  }
  */
}

// 🚀 DB 연동 함수들 (주석 처리)
/*
const fetchEquipmentData = async () => {
  try {
    const response = await api.get('/equipment');
    equipments.value = response.data;
    console.log('🏭 설비 데이터 로드 완료');
  } catch (error) {
    console.error('설비 데이터 로드 실패:', error);
  }
};

const fetchInspectionData = async (eqii_code) => {
  try {
    const response = await api.get(`/inspection/${eqii_code}`);
    eqiis.value = response.data;
    console.log('📋 점검지시서 데이터 로드 완료');
  } catch (error) {
    console.error('점검지시서 데이터 로드 실패:', error);
  }
};

const fetchCheckItemsData = async (eqii_code) => {
  try {
    const response = await api.get(`/check-items/${eqii_code}`);
    eqoplist.value = response.data;
    console.log('🔧 점검항목 데이터 로드 완료');
  } catch (error) {
    console.error('점검항목 데이터 로드 실패:', error);
  }
};

onMounted(() => {
  // 페이지 로드 시 기본 데이터 가져오기
  fetchEquipmentData();
});
*/
</script>
