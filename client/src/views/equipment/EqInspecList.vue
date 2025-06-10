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
          <Button label="설비정보 불러오기" severity="success" class="min-w-fit whitespace-nowrap"
            @click="dialogVisible = true" />
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="점검지시서코드" :value="eqii_code" placeholder="생산계획코드" :disabled="true" />
      <LabeledInput label="설비명" v-model="eq_name" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="설비코드" v-model="eq_code" />
      <LabeledInput label="점검주기" v-model="chk_cycle" placeholder="작성자명" :disabled="true" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledReadonlyInput label="최근 점검일" v-model="latest_date" />
    </div>
  </div>
  <div>
    <EqEditableTable
      :fields="['eqii_code', 'inst_date', 'inst_emp_code', 'eq_chk_type', 'chk_exp_date', 'stat', 'note']"
      :mapper="eqiiMapper" :dataKey="'eqii_code'" :initialData="inspectionList" @update="handleInspectionTableUpdate"
      @loadEquipment="dialogVisible2 = true" title="설비 점검 지시서 정보" scrollHeight="600px" />
  </div>
  <div>
    <EqTable :data="filteredEqoplist" :mapper="eqchkMapper" :dataKey="'eq_code'"
      :title="`점검항목 (${eq_code || '설비 미선택'})`" />
  </div>
  <!-- 팝업 -->
  <SinglePopup v-model:visible="dialogVisible" :items="equipments" @confirm="handleEquipmentSelect" :mapper="eqMapper"
    :dataKey="'eq_code'"></SinglePopup>
  <SinglePopup v-model:visible="dialogVisible2" :items="filteredEqiilist" @confirm="handleInspectionSelect"
    :mapper="eqiiMapper" :dataKey="'eqii_code'" :title="`점검지시서 선택 (${eq_name || '설비 미선택'})`" />
</template>

<script setup>
import LabeledInput from '@/components/registration-bar/LabeledInput.vue';
import LabeledReadonlyInput from '@/components/registration-bar/LabeledReadonlyInput.vue';
import EqTable from '@/views/equipment/components/EqTable.vue'
import SinglePopup from '@/components/popup/SinglePopup.vue';
import eqMapper from '@/service/EquipmentMapping';
import eqiiMapper from '@/service/EquipSpecInstMapping'
import EqEditableTable from '@/views/equipment/components/EqEditableTable.vue';
import eqchkMapper from '@/service/EqChkListMapping.js'
import { ref, computed, onMounted } from 'vue'
import { Button } from 'primevue';


const eq_code = ref('')
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
    eqii_code: 'CHK001',
    inst_date: '2024-06-10',
    inst_emp_code: 'EMP001',
    eq_chk_type: '정기점검',
    chk_exp_date: '2024-06-15',
    stat: '대기',
    note: '정기 점검 예정'
  }
]);

// 팝업시작
const equipments = ref([
  { eq_code: 'EQ001', eq_name: '컨베이어 벨트', eq_model: 'CV-A100', chk_cycle: '30일' },
  { eq_code: 'EQ002', eq_name: '프레스 기계', eq_model: 'PR-B200', chk_cycle: '15일' },
  { eq_code: 'EQ003', eq_name: '용접기', eq_model: 'WD-C300', chk_cycle: '60일' },
  { eq_code: 'EQ004', eq_name: '포장기', eq_model: 'PK-D400', chk_cycle: '45일' },
  { eq_code: 'EQ005', eq_name: '절단기', eq_model: 'CT-E500', chk_cycle: '20일' },
]);

const eqiis = ref([
  { eq_code: 'EQ001', eqii_code: 'CHK001', inst_date: '2024-06-01', eq_chk_type: '정기점검', stat: '완료' },
  { eq_code: 'EQ001', eqii_code: 'CHK002', inst_date: '2024-06-02', eq_chk_type: '특별점검', stat: '진행중' },
  { eq_code: 'EQ002', eqii_code: 'CHK003', inst_date: '2024-06-03', eq_chk_type: '긴급점검', stat: '대기' },
  { eq_code: 'EQ003', eqii_code: 'CHK004', inst_date: '2024-06-04', eq_chk_type: '정기점검', stat: '완료' },
  { eq_code: 'EQ005', eqii_code: 'CHK005', inst_date: '2024-06-05', eq_chk_type: '안전점검', stat: '취소' },
]);

const eqoplist = ref([
  // 컨베이어 벨트 점검항목들
  { eq_code: 'EQ001', eqop_code: 'OP001', eq_name: '벨트 장력 확인', chk_method: '육안검사', chk_cycle: '일일' },
  { eq_code: 'EQ001', eqop_code: 'OP002', eq_name: '모터 소음 점검', chk_method: '청음검사', chk_cycle: '주간' },
  { eq_code: 'EQ001', eqop_code: 'OP003', eq_name: '베어링 윤활', chk_method: '촉감검사', chk_cycle: '월간' },

  // 프레스 기계 점검항목들
  { eq_code: 'EQ002', eqop_code: 'OP004', eq_name: '유압 압력 확인', chk_method: '계기점검', chk_cycle: '일일' },
  { eq_code: 'EQ002', eqop_code: 'OP005', eq_name: '안전장치 작동', chk_method: '기능검사', chk_cycle: '주간' },
  { eq_code: 'EQ002', eqop_code: 'OP006', eq_name: '오일 누유 점검', chk_method: '육안검사', chk_cycle: '일일' },

  // 용접기 점검항목들
  { eq_code: 'EQ003', eqop_code: 'OP007', eq_name: '전극 마모도 확인', chk_method: '육안검사', chk_cycle: '일일' },
  { eq_code: 'EQ003', eqop_code: 'OP008', eq_name: '가스 압력 점검', chk_method: '계기점검', chk_cycle: '일일' },
  { eq_code: 'EQ003', eqop_code: 'OP009', eq_name: '접지 상태 확인', chk_method: '계기점검', chk_cycle: '월간' },

  // 포장기 점검항목들
  { eq_code: 'EQ004', eqop_code: 'OP010', eq_name: '컨베이어 속도', chk_method: '계기점검', chk_cycle: '일일' },
  { eq_code: 'EQ004', eqop_code: 'OP011', eq_name: '센서 감도 조정', chk_method: '기능검사', chk_cycle: '주간' },

  // 절단기 점검항목들
  { eq_code: 'EQ005', eqop_code: 'OP012', eq_name: '블레이드 마모도', chk_method: '육안검사', chk_cycle: '일일' },
  { eq_code: 'EQ005', eqop_code: 'OP013', eq_name: '냉각수 순환', chk_method: '육안검사', chk_cycle: '일일' },
]);

const handleInspectionTableUpdate = (updatedData) => {
  console.log('📋 점검지시서 테이블 업데이트:', updatedData);
  inspectionList.value = updatedData;
}

const handleEquipmentSelect = (selectedEquipment) => {
  console.log('선택된 설비:', selectedEquipment);
  eq_code.value = selectedEquipment.eq_code;
  eq_name.value = selectedEquipment.eq_name;
  chk_cycle.value = selectedEquipment.chk_cycle;

  dialogVisible.value = false;
}

const selectedOrder = ref(null);
//팝업 끝

const filteredEqoplist = computed(() => {
  if (!eq_code.value) {
    return []; // 설비가 선택되지 않았으면 빈 배열
  }

  return eqoplist.value.filter(item => item.eq_code === eq_code.value);
});

const filteredEqiilist = computed(() => {
  if (!eq_code.value) {
    return []; // 설비가 선택되지 않았으면 빈 배열
  }

  return eqiis.value.filter(item => item.eq_code === eq_code.value);
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
  eq_code.value = '';
  eq_name.value = '';
  eqii_code.value = 'CHK' + Date.now().toString().slice(-6);
  chk_cycle.value = '';
  latest_date.value = '';
  inspectionList.value = [];
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
  
  // 🚀 DB 연동 (주석 처리)
  /*
  try {
    // 1. 설비 정보 저장/업데이트
    const equipmentResponse = await api.put(`/equipment/${eq_code.value}`, formData.equipment);
    
    // 2. 점검지시서 저장
    const inspectionResponse = await api.post('/inspection', formData.inspection);
    
    // 3. 점검항목 연결 (필요시)
    const checkItemsResponse = await api.post('/inspection/check-items', {
      eqii_code: eqii_code.value,
      eq_code: eq_code.value,
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

const fetchInspectionData = async (eq_code) => {
  try {
    const response = await api.get(`/inspection/${eq_code}`);
    eqiis.value = response.data;
    console.log('📋 점검지시서 데이터 로드 완료');
  } catch (error) {
    console.error('점검지시서 데이터 로드 실패:', error);
  }
};

const fetchCheckItemsData = async (eq_code) => {
  try {
    const response = await api.get(`/check-items/${eq_code}`);
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
