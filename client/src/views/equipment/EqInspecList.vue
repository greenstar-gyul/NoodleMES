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
      <LabeledInput label="설비코드" v-model="eq_name" />
      <LabeledInput label="점검주기" v-model="chk_cycle" placeholder="작성자명" :disabled="true" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledReadonlyInput label="최근 점검일" v-model="latest_date" />
    </div>
  </div>
  <div>
    <EditableTable :fields="['eqii_code', 'inst_date', 'inst_emp_code', 'eq_chk_type', 'chk_exp_date', 'stat', 'note']"
      :mapper="{ eqii_code: '점검지시서코드', inst_date: '지시일자', inst_emp_code: '지시자', eq_chk_type: '점검유형', chk_exp_date: '점검예정일자', stat: '상태', note: '비고' }"
      dataKey="id" @update="handleUpdate" @loadEquipment="dialogVisible2 = true" title="설비 점검 지시서 정보"
      scrollHeight="600px" />
  </div>
  <div>
    <!-- DataTable (PrimeVue) -->
        <DataTable
            v-model:selection="selectedWE"
            :value="data"
            :dataKey="dataKey"
            showGridlines
            scrollable
            scrollHeight="400px"
            tableStyle="min-width: 50rem"
        >

            <!-- 동적 컬럼 생성 -->
            <Column
                v-for="item in itemsWE"
                :key="item"
                :field="item"
                :header="mapper[item] ?? item"
            />
        </DataTable>
    
  </div>
  <!-- 팝업 -->
  <SinglePopup v-model:visible="dialogVisible" :items="equipments" @confirm="handleConfirm" :mapper="eqMapper"
    :dataKey="'eq_code'"></SinglePopup>
  <SinglePopup v-model:visible="dialogVisible2" :items="eqiis" @confirm="handleConfirm" :mapper="eqiiMapper"
    :dataKey="'eq_code'"></SinglePopup>
</template>

<script setup>
import LabeledInput from '@/components/registration-bar/LabeledInput.vue';
import LabeledDatePicker from '@/components/registration-bar/LabeledDatePicker.vue';
import LabeledReadonlyInput from '@/components/registration-bar/LabeledReadonlyInput.vue';
import LabeledTextarea from '@/components/registration-bar/LabeledTextarea.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import eqMapper from '@/service/EquipmentMapping';
import eqiiMapper from '@/service/EquipSpecInstMapping'
import EditableTable from '@/views/equipment/components/EqEditableTable.vue';
import { ref } from 'vue'
import { Button } from 'primevue';


const eq_code = ref('')
const eqii_code = ref('')
const inst_date = ref('')
const inst_emp_code = ref('')       // 문자열 or Date 객체에 맞게 처리
const eq_chk_type = ref(null)
const chk_exp_date = ref(null)
const stat = ref(null)
const note = ref('')
const openPopup = () => {
  dialogVisible.value = true;
}

// 팝업
const dialogVisible = ref(false);
// 팝업 2
const dialogVisible2 = ref(false);

// 팝업시작
const equipments = ref([
  { eq_code: 'PLN0001', eq_name: '2026-06 1차 계획', eq_model: '2025-06-01', chk_cycle: '2025-06-11' },
  { eq_code: 'PLN0002', eq_name: '2026-06 2차 계획', eq_model: '2025-06-02', chk_cycle: '2025-06-12' },
  { eq_code: 'PLN0003', eq_name: '2026-06 3차 계획', eq_model: '2025-06-03', chk_cycle: '2025-06-14' },
  { eq_code: 'PLN0004', eq_name: '2026-06 4차 계획', eq_model: '2025-06-04', chk_cycle: '2025-06-15' },
  { eq_code: 'PLN0005', eq_name: '2026-06 5차 계획', eq_model: '2025-06-05', chk_cycle: '2025-06-18' },
]);

const eqiis = ref([
  { eqii_code: 'PLN0001', eq_name: '2026-06 1차 계획', eq_model: '2025-06-01', chk_cycle: '2025-06-11' },
  { eqii_code: 'PLN0002', eq_name: '2026-06 2차 계획', eq_model: '2025-06-02', chk_cycle: '2025-06-12' },
  { eqii_code: 'PLN0003', eq_name: '2026-06 3차 계획', eq_model: '2025-06-03', chk_cycle: '2025-06-14' },
  { eqii_code: 'PLN0004', eq_name: '2026-06 4차 계획', eq_model: '2025-06-04', chk_cycle: '2025-06-15' },
  { eqii_code: 'PLN0005', eq_name: '2026-06 5차 계획', eq_model: '2025-06-05', chk_cycle: '2025-06-18' },
]);

const eqoplist = ref([
  { eqii_code: 'PLN0001', eq_name: '2026-06 1차 계획', eq_model: '2025-06-01', chk_cycle: '2025-06-11' },
  { eqii_code: 'PLN0002', eq_name: '2026-06 2차 계획', eq_model: '2025-06-02', chk_cycle: '2025-06-12' },
  { eqii_code: 'PLN0003', eq_name: '2026-06 3차 계획', eq_model: '2025-06-03', chk_cycle: '2025-06-14' },
  { eqii_code: 'PLN0004', eq_name: '2026-06 4차 계획', eq_model: '2025-06-04', chk_cycle: '2025-06-15' },
  { eqii_code: 'PLN0005', eq_name: '2026-06 5차 계획', eq_model: '2025-06-05', chk_cycle: '2025-06-18' },
]);





const handleUpdate = (updatedData) => {
  console.log('업데이트된 테이블 데이터:', updatedData)
}

const selectedOrder = ref(null);
//팝업 끝
</script>
