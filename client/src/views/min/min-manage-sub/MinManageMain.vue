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
  matName: { type: Object, required: true }, // 자재이름
  matType: { type: Object, required: true }, // 자재유형
  ordQtt: { type: Object, required: true }, // 주문수량
  inbndQtt: { type: Object, required: true }, // 입고수량
  unit: { type: Object, required: true }, // 단위
  inbndDate: { type: Object, required: true }, // 입고일자
  supName: { type: Object, required: true }, // 공급업체명
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

// 품질검사정보 팝업
const qioPopupVisible = ref(false);

// 자재입고정보 데이터
const minRef = ref([]);

// 자재기준정보 데이터
const matRef = ref([]);

// 품질검사정보 데이터
const qioRef = ref([]);

// 자재 코드 매핑
const matCodeMap = {
  '밀가루(중력분)': 'MAT-1001',
  '팜유': 'MAT-1002',
  '정제염': 'MAT-1003',
  '대파 분말': 'MAT-1004',
  '양파 분말': 'MAT-1005',
  '고춧가루': 'MAT-1006',
  '간장분말': 'MAT-1007',
  'MSG': 'MAT-1008',
  '봉지라면 포장지': 'MAT-2001',
  '봉지라면 박스(20입)': 'MAT-2002',
  '봉지라면 박스(40입)': 'MAT-2003',
  '컵라면 용기(대)': 'MAT-2004',
  '컵라면 용기(소)': 'MAT-2005',
  '컵라면 뚜껑(대)': 'MAT-2006',
  '컵라면 뚜껑(소)': 'MAT-2007',
  '컵라면 박스(16입)': 'MAT-2008',
  '컵라면 박스(12입)': 'MAT-2009',
};

// 단위 코드 매핑
const unitCodeMap = {
  'kg': 'h1',
  'L': 'h3',
  'ea': 'h4',
};

// 자재유형 매핑
const matTypeMap = {
  '원자재': 't1',
  '원자재': 'i4',
  '부자재': 't2',
  '부자재': 'i3',
};

// 거래처 코드 매핑 (CLIENT-001 ~ CLIENT-011)
const clientMap = {
  '대형마트A': 'CLIENT-001',
  '대형마트B': 'CLIENT-002',
  '편의점체인A': 'CLIENT-003',
  '온라인쇼핑몰A': 'CLIENT-004',
  '밀가루공급사': 'CLIENT-005',
  '팜유공급사': 'CLIENT-006',
  '포장재공급사': 'CLIENT-007',
  '야채공급사': 'CLIENT-008',
  '조미료공급사': 'CLIENT-009',
  '컵용기공급사': 'CLIENT-010',
  '예담마트': 'CLIENT-011',
};

// 직원 코드 매핑
const empMap = {
  '시스템관리자': 'EMP-10000',
  '김영업': 'EMP-10001',
  '이생산': 'EMP-10002',
  '박자재': 'EMP-10003',
  '최설비': 'EMP-10004',
  '정품질': 'EMP-10005',
  '강구매': 'EMP-10006',
  '오영업원': 'EMP-10007',
  '유생산원': 'EMP-10008',
  '송자재원': 'EMP-10009',
  '임설비원': 'EMP-10010',
  '한품질원': 'EMP-10011',
  '서구매원': 'EMP-10012',
};

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
    alert('삭제 중 오류가 발생했습니다.');
  }
};

// 초기화
const handleReset = () => {
// 자재입고정보 초기화
  mins.mInBndCode.value = '';
  mins.matName.value = '';
  mins.matType.value = '';
  mins.ordQtt.value = '';
  mins.inbndQtt.value = '';
  mins.unit.value = '';
  mins.inbndDate.value = '';
  mins.supName.value = '';
  mins.mName.value = '김영업';
  mins.qioCode.value = '';
  mins.lotNum.value = '';
  
// 정보 초기화, store 함수 사용
  resetMinRows();
};

// 저장 - 등록
const handleSave = async () => {
  if (!mins.matName.value || !mins.ordQtt.value || !mins.inbndQtt.value || !mins.inbndDate.value || !mins.qioCode.value) {
    alert('입력하지 않은 정보가 있습니다.');
    return;
  }
  const min = {
  // minbnd_code: mins.mInBndCode.value,
  mat_code: matCodeMap[mins.matName.value],
  mat_type: matTypeMap[mins.matType.value],
  unit: unitCodeMap[mins.unit.value], 
  inbnd_qtt: mins.inbndQtt.value,
  inbnd_date: moment(mins.inbndDate.value).format('YYYY-MM-DD'), 
  ord_qtt: mins.ordQtt.value, 
  qio_code: mins.qioCode.value,
  // lot_num: mins.lotNum.value,
  mat_sup: clientMap[mins.supName.value], 
  mcode: empMap[mins.mName.value],
  };
  console.log('min.mat_code');
  console.log(min.mat_code);
  try {
    await axios.post('/api/min/insert', min)
    alert('자재입고 정보가 등록되었습니다.');

    //저장 후 자재입고 목록에 바로 보이도록 처리
    const MinRes = await axios.get('/api/min/all');
    minRef.value = MinRes.data.map(min => ({
      ...min,
      inbnd_date: moment(min.inbndDate).format('YYYY-MM-DD'),
    }));
  } catch (err) {
    alert('등록 실패: ' + err.message)
  };
}; // end of handleSave


// 자재입고정보 팝업 Confirm 핸들러
const handleMinbndConfirm = async (selectedMin) => {
  
  try {
    // 전체 자재입고정보 조회
    const minBunRes = await axios.get(`/api/min/all`);
    const minBunList = minBunRes.data;//store 함수 사용
    
    // 각 행에 고유 ID 부여 (반응형 처리 위해 꼭 필요)
    minBunList.forEach((item, idx) => {
      item.min_bnd_num_code = item.min_bnd_num_code || `row-${idx}`;
    });

    selectedMin.emp_code = 'EMP-10001';

    // 자재입고 정보 초기 설정
    mins.mInBndCode.value = selectedMin.minbnd_code;
    mins.matName.value = selectedMin.mat_name;
    mins.matType.value = selectedMin.mat_type;
    mins.ordQtt.value = selectedMin.ord_qtt;
    mins.inbndQtt.value = selectedMin.inbnd_qtt;
    mins.unit.value = selectedMin.unit;
    mins.inbndDate.value = moment(selectedMin.inbnd_date).format("YYYY-MM-DD")
    mins.supName.value = selectedMin.client_name;
    // mins.mName.value = empMap[selectedMin.emp_code] ;
    mins.qioCode.value = selectedMin.qio_code;
    mins.lotNum.value = selectedMin.lot_num;

    setMinRows(minBunList);
  } catch (err) {
    throw err;
  }
}; // end of handleMinbndConfirm

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
    
    console.log('이름 테스트');
    console.log(selectedQio.mat_name);
    console.log('코드 테스트');
    console.log(selectedQio.mat_code);

    const matRes = await axios.get('/api/min/selmat', {
      params: { mat_code: selectedQio.mat_code }
    });

    
    // 자재입고 정보 초기 설정
    mins.matName.value = selectedQio.mat_name;
    mins.unit .value = matRes.data.data[0].unit;
    mins.matType.value = matRes.data.data[0].mat_type;
    mins.supName.value = matRes.data.data[0].sup_name;
    mins.qioCode.value = selectedQio.qio_code;

  } catch (err){
      throw err;
  }

}; // end of handleMinConfirm

// 최초 로딩시 자재입고 정보, 자재기본정보, 품질검사정보 조회
onMounted(async () => {
  try {
    // 전체 자재입고정보 조회
    const MinRes = await axios.get('/api/min/all');
    minRef.value = MinRes.data.map(min => ({
      //기존  객체를 그대로 복사하면서 date 값만 YYYY-MM-DD 포맷으로 변환
      ...min,
      inbnd_date: moment(min.inbndDate).format('YYYY-MM-DD'),
    }));
    
    // 자재기준정보 조회
    const MatRes = await axios.get('/api/min/mat');
    matRef.value = MatRes.data.data.map(mat => ({
      //기존 객체를 그대로 복사
      ...mat,
    }));

    // 품질검사정보 조회
    const QioRes = await axios.get('/api/min/qio');

    qioRef.value = QioRes.data.data.map(qio => ({
    //기존 객체를 그대로 복사하면서 date 값만 YYYY-MM-DD 포맷으로 변환
      ...qio,
      qio_date: moment(qio.qio_date).format('YYYY-MM-DD'),
    }));
  } catch(err){
    throw err;
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
      <LabeledInput label="자재이름" v-model="mins.matName.value"  placeholder="자재정보" readonly/>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="주문수량" v-model="mins.ordQtt.value" />
      <LabeledInput label="입고수량" v-model="mins.inbndQtt.value" />
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="단위" v-model="mins.unit.value" placeholder="자재선택 시 자동입력" readonly/>
      <!-- <LabeledInput label="단위코드" v-model="mins.unit.value" style="display: none"/> -->
      <LabeledInput label="자재유형" v-model="mins.matType.value" placeholder="자재선택 시 자동입력" readonly/>
      <!-- <LabeledInput label="자재유형코드" v-model="mins.matType.value" style="display: none"/> -->
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledDatePicker label="입고일자" v-model="mins.inbndDate.value" />
      <LabeledInput label="담당자" v-model="mins.mName.value" placeholder="로그인한 유저" readonly/>
      <!-- <LabeledInput label="담당자코드" v-model="mins.mName.value" style="display: none"/> -->
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInputIcon label="검사지시코드" v-model="mins.qioCode.value" @click="qioPopupVisible = true" placeholder="검사지시코드 선택" readonly/>
      <LabeledInput label="공급업체명" v-model="mins.supName.value" placeholder="자재선택 시 자동입력" readonly/>
      <!-- <LabeledInput label="공급업체코드" v-model="mins.matSup.value" style="display: none" readonly/> -->
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
  <!-- ===== 품질검사정보 팝업 ===== -->
  <SinglePopup
      v-model:visible="qioPopupVisible"
      :items="qioRef"
      @confirm="handleqioConfirm"  
      :mapper="minMapping.qioMapping"
      :dataKey="'qio_code'"
  />
</template>
