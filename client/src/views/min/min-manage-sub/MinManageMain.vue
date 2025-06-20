<script setup>
import { ref, nextTick, onMounted } from 'vue';
import { useMinStore } from '@/stores/minStore';
import { storeToRefs } from 'pinia';
import axios from 'axios';
import moment from 'moment';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import minMapping from '@/service/MinMapping';

import Button from 'primevue/button';
import LabeledInput from '@/components/registration-bar/LabeledInput.vue';
import LabeledTextarea from '@/components/registration-bar/LabeledTextarea.vue';
import LabeledDatePicker from '@/components/registration-bar/LabeledDatePicker.vue';
import LabeledDateTimePicker from '@/components/registration-bar/LabeledDateTimePicker.vue';

const emit = defineEmits(['resetList', 'saveData']);

// 상위 props로부터 데이터 전달받기
const mins = defineProps({
  mInBndCode: { type: Object, required: true }, // 자재입고코드
  matCode: { type: Object, required: true }, // 자재코드
  matType: { type: Object, required: true }, // 자재유형(외래키)
  ordQtt: { type: Object, required: true }, // 주문수량
  inbndQtt: { type: Object, required: true }, // 입고수량
  unit: { type: Object, required: true }, // 단위(외래키)
  inbndDate: { type: Object, required: true }, // 입고일자
  matSup: { type: Object, required: true }, // 공급업체
  supName: { type: Object, required: true }, // 공급업체명
  mCode: { type: Object, required: true }, // 담당자
  mName: { type: Object, required: true }, // 담당자명
  qioCode: { type: Object, required: true }, // 검사지시코드
  lotNum: { type: Object, required: true }, // LOT 번호
});

const minStore = useMinStore();

// 자재입고정보 팝업
const minPopupVisible = ref(false);

// 자재입고정보 데이터
const minRef = ref([]);

// 상태는 반응형으로 가져오기
const { minRows } = storeToRefs(minStore);

// 순서대로 목록데이터 저장, 초기화, 선택목록 저장
const { resetMinRows, setMinRows } = minStore;

// 삭제
const handleDelete = async () => {
  if (!mprs.mpr_code.value) {
      alert('자재입고정보가 없습니다. 다시 확인해주세요');
      return;
  }

  const confirmed = confirm('정말로 자재입고정보를 삭제하시겠습니까?');
  if (!confirmed) return;

  try {
    await axios.delete(`/api/min/${mprs.mprCode.value}`);
    handleReset(); // 초기화 함수 호출
    alert('자재입고정보가 삭제되었습니다.');
  } catch (error) {
    console.error('삭제 실패:', error);
    alert('삭제 중 오류가 발생했습니다.');
  }
};

// 초기화
const handleReset = () => {
// 자재입고정보 초기화
  mins.mInBndCode.value = '';
  mins.matCode.value = '';
  mins.matType.value = '';
  mins.ordQtt.value = '';
  mins.inbndQtt.value = '';
  mins.unit.value = '';
  mins.inbndDate.value = '';
  mins.matSup.value = '';
  mins.supName.value = '';
  mins.mCode.value = 'EMP-10001';
  mins.mName.value = '김영업';
  mins.qioCode.value = '';
  mins.lotNum.value = '';
  
// 정보 초기화, store 함수 사용
  resetMinRows();
  console.log('자재입고정보 초기화');
};

// 저장 - 등록
const handleSave = async () => {

};

// Minbun 팝업 Confirm 핸들러
const handleMinbndConfirm = async (selectedMin) => {
  console.log('선택된 Min:', selectedMin);

  try {
    // 전체 minbnd 조회
    const all = await axios.get(`/api/mpr/${selectedMpr.mpr_code}/details`);
    const details = detailRes.data.data;//store 함수 사용

    // 각 행에 고유 ID 부여 (반응형 처리 위해 꼭 필요)
    details.forEach((item, idx) => {
      item.mpr_d_code = item.mpr_d_code || `row-${idx}`;
      // item.req_qtt = moment(item.delivery_date).format('YYYY-MM-DD');
    });

    setMprRows(details);

    // mpr 기본 정보 설정
    mprs.mprCode.value = selectedMpr.mpr_code;
    mprs.reqDate.value = moment(selectedMpr.reqdate).format("YYYY-MM-DD");
    mprs.deadLine.value = moment(selectedMpr.deadline).format("YYYY-MM-DD");
    mrps.mrp_code.value = selectedMpr.mrp_code; // mrp의 정보를 수정하여 사용
    mprs.mrpCode.value = selectedMpr.mrp_code; // 혹시 몰라서 mpr도 같이 수정해서 사용
  } catch (err) {
    console.error('mpr 상세 조회 실패:', err);
  }
}; // end of handleMprConfirm


// 자재입고정보 팝업 Confirm 핸들러
const handleMinConfirm = async (selectedMin) => {
console.log('선택된 Min:', selectedMin);

  try {
    // mrp 상세 조회
    const detailRes = await axios.get(`/api/min/mrp`);
    const details = detailRes.data.data;//store 함수 사용

    // 각 행에 고유 ID 부여 (반응형 처리 위해 꼭 필요)
    details.forEach((item, idx) => {
      item.mpr_d_code = item.mpr_d_code || `row-${idx}`;
      // item.req_qtt = moment(item.delivery_date).format('YYYY-MM-DD');
    });

    
    // 자재입고 정보 초기 설정
    mins.mInBndCode.value = selectedMin.minbnd_code;
    mins.matCode.value = selectedMin.mat_code;
    mins.matType.value = selectedMin.mat_type;
    mins.ordQtt.value = selectedMin.ord_qtt;
    mins.inbndQtt.value = selectedMin.inbnd_qtt;
    mins.unit.value = selectedMin.unit;
    mins.inbndDate.value = moment(selectedMin.inbnd_date).format("YYYY-MM-DD")
    mins.matSup.value = selectedMin.mat_sup;
    mins.supName.value = selectedMin.sup_name;
    mins.mCode.value = selectedMin.emp_code;
    mins.mName.value = selectedMin.emp_name;
    mins.qioCode.value = selectedMin.qio_code;
    mins.lotNum.value = selectedMin.lot_num;
    
    setMrpRows(details);
    // setMrpRows(mrps);

  } catch (err) {
    console.error('mrp 상세 조회 실패:', err);
  }
}; // end of handleMinConfirm

onMounted(async () => {
  try {
    const MinRes = await axios.get('/api/min/all');
    console.log(MinRes)
  } catch(err){
    console.error('데이터 로딩 실패:', err);
  }
});
</script>

<template>
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-12">
    <div class="grid grid-cols-1 gap-4">
      <div class="flex justify-between">
        <div>
          <div class="font-semibold text-2xl"><b>자재 입고 정보</b></div>
        </div>
        <div class="flex items-center gap-2 flex-nowrap">
          <Button label="삭제" severity="danger" class="min-w-fit" @click="deletePlan" />
          <Button label="초기화" severity="contrast" class="min-w-fit" @click="handleReset" />
          <Button label="저장" severity="info" class="min-w-fit" @click="handleSave" />
          <Button
                label="MPR 정보 불러오기"
                severity="success"
                class="min-w-fit whitespace-nowrap"
                @click="minPopupVisible = true"
            />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="자재입고코드" v-model="mins.mInBndCode.value" :disabled="true" placeholder="등록시 생성됩니다" />
      <LabeledInput label="자재코드" v-model="mins.matCode.value" :disabled="true" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="자재유형" v-model="mins.matType.value" />
      <LabeledInput label="단위" v-model="mins.unit.value" />
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="주문수량" v-model="mins.ordQtt.value" />
      <LabeledInput label="입고수량" v-model="mins.inbndQtt.value" />
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledDateTimePicker label="입고일자" v-model="mins.inbndDate.value" />
      <LabeledInput label="담당자(로그인)" v-model="mins.mCode.value" />
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="검사지시코드(검색)" v-model="mins.qioCode.value" />
      <LabeledInput label="공급업체" v-model="mins.matSup.value" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="LOT번호" v-model="mins.lotNum.value" placeholder="등록시 생성됩니다"/>
    </div>
  </div>
  <!-- ===== 자재입고정보 팝업 ===== -->
  <SinglePopup
      v-model:visible="minPopupVisible"
      :items="minRef"
      @confirm="handleMinConfirm"  
      :mapper="minMapping.MinMapper"
      :dataKey="'minbnd_code'"
  />
</template>
