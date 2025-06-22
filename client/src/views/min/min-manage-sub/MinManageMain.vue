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
import LabeledInputIcon from '../../../components/registration-bar/LabeledInputIcon.vue';

const emit = defineEmits(['resetList', 'saveData']);

// 상위 props로부터 데이터 전달받기
const mins = defineProps({
  mInBndCode: { type: Object, required: true }, // 자재입고코드
  matCode: { type: Object, required: true }, // 자재코드
  matType: { type: Object, required: true }, // 자재유형코드
  commMatType: { type: Object, required: true }, // 자재유형
  ordQtt: { type: Object, required: true }, // 주문수량
  inbndQtt: { type: Object, required: true }, // 입고수량
  unit: { type: Object, required: true }, // 단위코드
  commUnit: { type: Object, required: true }, // 단위
  inbndDate: { type: Object, required: true }, // 입고일자
  matSup: { type: Object, required: true }, // 공급업체
  supName: { type: Object, required: true }, // 공급업체명
  mCode: { type: Object, required: true }, // 담당자
  mName: { type: Object, required: true }, // 담당자명
  qioCode: { type: Object, required: true }, // 검사지시코드
  lotNum: { type: Object, required: true }, // LOT 번호
});

const mats = {
  mat_code: ref(''),
  mat_name: ref(''),
  unit: ref(''),
  mat_type: ref(''),
  sup_name: ref(''),
};

// pinia
const minStore = useMinStore();

// 상태는 반응형으로 가져오기
const { minRows } = storeToRefs(minStore);

// set: 목록데이터 저장,  reset: 초기화
const { setMinRows, resetMinRows,  } = minStore;

// 자재입고정보 팝업
const minPopupVisible = ref(false);

// 자재정보 팝업
const matPopupVisible = ref(false);

// 품질검사정보 팝업
const qioPopupVisible = ref(false);

// 자재입고정보 데이터
const minRef = ref([]);

// 자재기준정보 데이터
const matRef = ref([]);

// 품질검사정보 데이터
const qioRef = ref([]);

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
  mins.commMatType.value = '';
  mins.ordQtt.value = '';
  mins.inbndQtt.value = '';
  mins.unit.value = '';
  mins.commUnit.value = '';
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
  if (!mins.matCode.value || !mins.ordQtt.value || !mins.inbndQtt.value || !mins.inbndDate.value || !mins.qioCode.value) {
    alert('입력하지 않은 정보가 있습니다..');
    return;
  }

    const min = {
    mpr_code: mprs.mprCode.value,
    mpr_code: mprs.mprCode.value,
    deadline: moment(mprs.deadLine.value).format('YYYY-MM-DD'),
    mrp_code: mprs.mrpCode.value,
    mcode: mprs.mCode.value,
  };
}; // end of handleSave

// 자재입고정보 팝업 Confirm 핸들러
const handleMinbndConfirm = async (selectedMin) => {
  // console.log('체크 포인트', selectedMin);
  // console.log(selectedMin);
  
  try {
    // 전체 자재입고정보 조회
    const minBunRes = await axios.get(`/api/min/all`);
    const minBunList = minBunRes.data;//store 함수 사용
    
    // 각 행에 고유 ID 부여 (반응형 처리 위해 꼭 필요)
    minBunList.forEach((item, idx) => {
      item.min_bnd_num_code = item.min_bnd_num_code || `row-${idx}`;
    });
    
   console.log('선택 입고정보 확인');
   console.log(selectedMin);

    // 자재입고 정보 초기 설정
    mins.mInBndCode.value = selectedMin.minbnd_code;
    mins.matCode.value = selectedMin.mat_code;
    mins.matType.value = selectedMin.mat_type;
    mins.commMatType.value = selectedMin.comm_mat_type;
    mins.ordQtt.value = selectedMin.ord_qtt;
    mins.inbndQtt.value = selectedMin.inbnd_qtt;
    mins.unit.value = selectedMin.unit;
    mins.commUnit.value = selectedMin.comm_unit;
    mins.inbndDate.value = moment(selectedMin.inbnd_date).format("YYYY-MM-DD")
    mins.matSup.value = selectedMin.mat_sup;
    mins.supName.value = selectedMin.sup_name;
    mins.mCode.value = selectedMin.emp_code;
    mins.mName.value = selectedMin.emp_name;
    mins.qioCode.value = selectedMin.qio_code;
    mins.lotNum.value = selectedMin.lot_num;
    
    setMinRows(minBunList);
  } catch (err) {
    console.error('자재입고정보 조회 실패:', err);
  }
}; // end of handleMinbndConfirm

// 자재선택 팝업 Confirm 핸들러
const handleMatbndConfirm = async (selectedMat) => {
  try {
    // 전체 자재입고정보 조회
    const matRes = await axios.get(`/api/min/mat`);
    const matList = matRes.data.data;//store 함수 사용
    
    // 각 행에 고유 ID 부여 (반응형 처리 위해 꼭 필요)
    matList.forEach((item, idx) => {
      item.mat_num_code = item.mat_num_code || `row-${idx}`;
    });
    
    // 자재입고 정보 초기 설정
    mins.matCode.value = selectedMat.mat_code;
    mins.commUnit.value = selectedMat.unit;
    mins.commMatType.value = selectedMat.mat_type;
    mins.supName.value = selectedMat.sup_name;
  } catch (err){
    console.error('자재 기본정보 조회 실패:', err);
  }
}; // end of handleMatbndConfirm

// 품질검사 팝업 Confirm 핸들러
const handleqioConfirm = async (selectedQio) => {
  try {
    // 전체 자재입고정보 조회
    const qioRes = await axios.get(`/api/min/qio`);
    const qioList = qioRes.data.data;//store 함수 사용
    
    // 각 행에 고유 ID 부여 (반응형 처리 위해 꼭 필요)
    qioList.forEach((item, idx) => {
      item.qio_num_code = item.qio_num_code || `row-${idx}`;
    });
    
    // 자재입고 정보 초기 설정
    mins.qioCode.value = selectedQio.qio_code;
  } catch (err){
    console.error('자재 기본정보 조회 실패:', err);
  }

}; // end of handleMinConfirm

// 최초 로딩시 자재입고 정보, 자재기본정보 조회
onMounted(async () => {
  try {
    // 전체 자재입고정보 조회
    const MinRes = await axios.get('/api/min/all');
    console.log('자재입고정보')
    console.log(MinRes)
    minRef.value = MinRes.data.map(min => ({
      //기존  객체를 그대로 복사하면서 date 값만 YYYY-MM-DD 포맷으로 변환
      ...min,
      inbnd_date: moment(min.inbndDate).format('YYYY-MM-DD'),
    }));
    
    // 자재기준정보 조회
    const MatRes = await axios.get('/api/min/mat');
    console.log('자재기준정보')
    console.log(MatRes);
    matRef.value = MatRes.data.data.map(mat => ({
      //기존 객체를 그대로 복사
      ...mat,
    }));

    // 품질검사정보 조회
    const QioRes = await axios.get('/api/min/qio');
    console.log('품질검사정보')
    console.log(QioRes);
    qioRef.value = QioRes.data.data.map(qio => ({
    //기존 객체를 그대로 복사하면서 date 값만 YYYY-MM-DD 포맷으로 변환
      ...qio,
      qio_date: moment(qio.qio_date).format('YYYY-MM-DD'),
    }));
    console.log('테스트');
    console.log(minRef.value);
    // console.log(matRef.value);
    // console.log(qioRef.value);
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
                label="자재입고 정보 불러오기"
                severity="success"
                class="min-w-fit whitespace-nowrap"
                @click="minPopupVisible = true"
            />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="자재입고코드" v-model="mins.mInBndCode.value" :disabled="true" placeholder="등록 시 생성" />
      <LabeledInputIcon label="자재코드" v-model="mins.matCode.value" @click="matPopupVisible = true" placeholder="자재정보선택" readonly/>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="주문수량" v-model="mins.ordQtt.value" />
      <LabeledInput label="입고수량" v-model="mins.inbndQtt.value" />
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="단위" v-model="mins.commUnit.value" placeholder="자재선택 시 자동입력" readonly/>
      <LabeledInput label="자재유형" v-model="mins.commMatType.value" placeholder="자재선택 시 자동입력" readonly/>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledDatePicker label="입고일자" v-model="mins.inbndDate.value" />
      <LabeledInput label="담당자" v-model="mins.mCode.value" placeholder="로그인한 유저" readonly/>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInputIcon label="검사지시코드" v-model="mins.qioCode.value" @click="qioPopupVisible = true" placeholder="검사지시코드 선택" readonly/>
      <LabeledInput label="공급업체명" v-model="mins.supName.value" placeholder="자재선택 시 자동입력" readonly/>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="LOT번호" v-model="mins.lotNum.value" :disabled="true" placeholder="등록 시 생성"/>
    </div>
  </div>
  <!-- ===== 자재입고정보 팝업 ===== -->
  <SinglePopup
      v-model:visible="minPopupVisible"
      :items="minRef"
      @confirm="handleMinbndConfirm"  
      :mapper="minMapping.minbndMapping"
      :dataKey="'minbnd_code'"
  />
  <!-- ===== 자재정보 팝업 ===== -->
  <SinglePopup
      v-model:visible="matPopupVisible"
      :items="matRef"
      @confirm="handleMatbndConfirm"  
      :mapper="minMapping.matMapping"
      :dataKey="'mat_code'"
  />
  <!-- ===== 품질검사정보 팝업 ===== -->
  <SinglePopup
      v-model:visible="qioPopupVisible"
      :items="qioRef"
      @confirm="handleqioConfirm"  
      :mapper="minMapping.qioMapping"
      :dataKey="'qio_code'"
  />
</template>
