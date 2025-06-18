<script setup>
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useMprStore } from '@/stores/mprStore';
import SearchText from '@/components/search-bar/SearchText.vue';
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue';

import axios from 'axios';
import moment from 'moment';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import mprMapping from '@/service/MprMapping';

import LabeledTextarea from '@/components/registration-bar/LabeledTextarea.vue';
import LabeledSelect from '@/components/registration-bar/LabeledSelect.vue';
import LabeledInput from '@/components/registration-bar/LabeledInput.vue';
import LabeledInputIcon from '@/components/registration-bar/LabeledInputIcon.vue';
import Button from 'primevue/button';
import LabeledDatePicker from '../../../components/registration-bar/LabeledDatePicker.vue';

// 상위에서 전달받은 props
const mprs = defineProps({
  mprCode: { type: Object, required: true },
  reqDate: { type: Object, required: true },
  deadLine: { type: Object, required: true },
  mrpCode: { type: Object, required: true },
  mCode: { type: Object, required: true },
});

const mrps = {
  mrp_code: ref(''),
  plan_date: ref(''),
  start_date: ref(''),
  prdp_code: ref(''),
  emp_code: ref(''),
  mrp_note: ref('')
};

// pinia
const mprStore = useMprStore();

// 상태는 반응형으로 가져오기
const { mprRows, mrpRows } = storeToRefs(mprStore);
// 순서대로 목록데이터 저장, 초기화, 선택목록 저장
const { setMprRows, setMrpRows, resetMprRows, resetMrpRows, resetMatRows } = mprStore;

/* ===== DATA ===== */ 
// MPP 팝업
const mprPopupVisible = ref(false);

// MPR 데이터
const mprRef = ref([]);

// MRP 팝업
const mrpPopupVisible = ref(false);

// 전체 MRP데이터
const mrpRef = ref([]);


//MRP 셀렉트박스
const mrpCodeOptions = ref([]);



//초기화
const handleReset = () => {
    // mpr 기본정보 초기화
    mprs.mprCode.value = '';
    mprs.reqDate.value = '';
    mprs.deadLine.value = '';
    mprs.mrpCode.value = '';
    mprs.mrpCode.value =''; //필요한가? 일단 추가함 
    mrps.mrp_code.value ='';
    mprs.mCode.value = 'EMP-10001'; // 초기값을 로그인한 유저의 값으로 고정할거임

    // 제품 목록 초기화, store 함수 사용
    resetMprRows();
    resetMrpRows();
    console.log('mpr 기본정보 초기화 완료');
};

//저장
const handleSave = async () => {
  // console.log("등록자 코드 (mCode):", mprs.mCode.value);
  
  if (!mprs.reqDate.value || !mprs.deadLine.value || !mprs.mrpCode.value) {
    alert('요청일자, 납기일자, MRP 계획번호는 필수입니다.');
    console.log('데이터 테스트');
    console.log(mprs.reqDate.value);
    console.log(mprs.deadLine.value);
    console.log(mprs.mrpCode.value);
    return;
  }
  if (mprRows.value.length === 0) {
    alert('제품 목록이 비어 있습니다. 최소 하나의 제품을 추가해주세요.');
    return;
  }

  // mpr 기본정보의 데이터 객체
  const mpr = {
    mpr_code: mprs.mprCode.value,
    reqdate: moment(mprs.reqDate.value).format('YYYY-MM-DD'),
    deadline: moment(mprs.deadLine.value).format('YYYY-MM-DD'),
    mrp_code: mprs.mrpCode.value,
    mcode: mprs.mCode.value,
  };

  const details = mprRows.value.map(item => ({
    mpr_d_code: item.mpr_d_code,
    mat_code: item.mat_code,
    req_qtt: item.req_qtt,
    unit: item.unit,
    mpr_code: item.mpr_code,
    client_name: item.client_name, // 출력용
    mat_sup: item.mat_sup, // 저장용
    note: item.note,
  }));
  // console.log(mpr);
  // console.log(details);
  
  try {
    await axios.post('/api/mpr/insert', { mpr, details });
    alert('자재구매요청이 등록되었습니다.');

    //저장 후 MPR 목록에 바로 보이도록 처리
    const MprRes = await axios.get('/api/mpr/all');
    mprRef.value = MprRes.data.map(mpr => ({
      ...mpr,
      reqdate: moment(mpr.reqdate).format('YYYY-MM-DD'),
      deadline: moment(mpr.deadline).format('YYYY-MM-DD')
    }));

    setMprRows(details); // Pinia에 반영...이 필요한가?
    handleReset();
    // resetMrpRows();
    // mprRows.value = [];

  } catch (err) {
    console.error('자재구매요청 저장 실패:', err);
    alert('자재구매요청 저장 중 오류 발생');
  }
};


//삭제
const handleDelete = async () => {
    if (!mprs.mpr_code.value) {
        alert('mpr 정보가 없습니다. 다시 확인해주세요');
        return;
    }

    const confirmed = confirm('정말로 mpr 정보를 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      await axios.delete(`/api/mpr/${mprs.mprCode.value}`);
      handleReset(); // 초기화 함수 호출
      alert('mpr 정보가 삭제되었습니다.');
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
};

// MPR 팝업 Confirm 핸들러
const handleMprConfirm = async (selectedMpr) => {
  console.log('선택된 MPR:', selectedMpr);

  try {
    // mpr 상세 조회
    const detailRes = await axios.get(`/api/mpr/${selectedMpr.mpr_code}/details`);
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
};

// MRP 팝업 Confirm 핸들러
const handleMRPConfirm = async (selectedMRP) => {
console.log('선택된 MRP:', selectedMRP);

  try {
    // mrp 상세 조회
    const detailRes = await axios.get(`/api/mpr/mrp`);
    const details = detailRes.data.data;//store 함수 사용

    // 각 행에 고유 ID 부여 (반응형 처리 위해 꼭 필요)
    details.forEach((item, idx) => {
      item.mpr_d_code = item.mpr_d_code || `row-${idx}`;
      // item.req_qtt = moment(item.delivery_date).format('YYYY-MM-DD');
    });

    
    // mrp 기본 정보 설정
    mrps.mrp_code.value = selectedMRP.mrp_code;
    mprs.mrpCode.value = selectedMRP.mrp_code;
    mrps.plan_date.value = moment(selectedMRP.plan_date).format("YYYY-MM-DD");
    mrps.start_date.value = moment(selectedMRP.start_date).format("YYYY-MM-DD");
    mrps.prdp_code.value = selectedMRP.prdp_code;
    mrps.emp_code.value = selectedMRP.emp_code;
    mrps.mrp_note.value = selectedMRP.mrp_note;
    
    setMrpRows(details);
    // setMrpRows(mrps);
    
    // console.log('선택 데이터 테스트');
    // console.log('selectedMRP.mrp_code');
    // console.log(selectedMRP.mrp_code);
    // console.log('mrp_code');
    // console.log(mrps.mrp_code);
    // mprs.mCode.value = selectedMRP.emp_code;

  } catch (err) {
    console.error('mrp 상세 조회 실패:', err);
  }
};

// 최초 로딩 시 MPR 목록 조회
onMounted(async () => {
  try {
    // mpr 목록 조회
    const MprRes = await axios.get('/api/mpr/all');

    //moment 패키지 사용
    //map: 기존 배열의 각 요소를 가공해서 새로운 배열을 만들어주는 함수
    console.log(MprRes)
    mprRef.value = MprRes.data.map(mpr => ({
      //기존  객체를 그대로 복사하면서 date 값만 YYYY-MM-DD 포맷으로 변환
      ...mpr,
      reqdate: moment(mpr.reqdate).format('YYYY-MM-DD'),
      deadline: moment(mpr.deadline).format('YYYY-MM-DD')
    }));
    
    // MRP 코드 목록 조회
    const mrpRes = await axios.get('/api/mpr/mrp');
    const mrpList = mrpRes.data.data;
    // 전체 목록 저장
    mrpRef.value = mrpList;
    
    // MRP 셀렉트 박스에 사용될 label + value 구성
    mrpCodeOptions.value = mrpList.map(mrp => ({
      label: mrp.mrp_code,
      value: mrp.mrp_code
    }));

    mrpRef.value = mrpList.map(mrp => ({
      //기존  객체를 그대로 복사하면서 date 값만 YYYY-MM-DD 포맷으로 변환
      ...mrp,
      plan_date: moment(mrp.reqdate).format('YYYY-MM-DD'),
      start_date: moment(mrp.deadline).format('YYYY-MM-DD')
    }));
    
  } catch (err) {
    console.error('데이터 로딩 실패:', err);
  }
});


</script>

<template>  
  <!-- 검색바 영역 -->
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <div class="flex justify-between">
        <div>
            <div class="font-semibold text-2xl">기본정보</div>
        </div>
        <div class="flex items-center gap-2 flex-nowrap">
            <Button label="삭제" severity="danger" class="min-w-fit" @click="handleDelete" />
            <Button label="초기화" severity="contrast" class="min-w-fit" @click="handleReset" />
            <Button label="저장" severity="info" class="min-w-fit" @click="handleSave" />
            <Button
                label="MPR 정보 불러오기"
                severity="success"
                class="min-w-fit whitespace-nowrap"
                @click="mprPopupVisible = true"
            />
        </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 구매요청코드  -->
      <LabeledInput label="요청코드" v-model="mprs.mprCode.value" placeholder="구매요청코드" :disabled="true"/>
      <!-- 요청자 -->
      <LabeledInput label="요청자" v-model="mprs.mCode.value" placeholder="로그인한사람으로 변경예정" readonly/>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 요청일자 -->
      <!-- <LabeledInput label="요청일자" v-model="mprs.reqDate.value" placeholder="요청일자입력"/> -->
      <LabeledDatePicker label="요청일자" v-model="mprs.reqDate.value" />
      <!-- 납기일자 -->
      <!-- <LabeledInput label="납기일자" v-model="mprs.deadLine.value" placeholder="납기일자입력"/> -->
      <LabeledDatePicker label="납기일자" v-model="mprs.deadLine.value" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- MRP 계획번호 -->
      <LabeledInputIcon label="MRP 계획번호" v-model="mrps.mrp_code" @click="mrpPopupVisible = true" placeholder="MRP 계획번호 선택" readonly/>
    </div>
  </div>

    <!-- ===== MPR 정보 팝업 ===== -->
  <SinglePopup
      v-model:visible="mprPopupVisible"
      :items="mprRef"
      @confirm="handleMprConfirm"  
      :mapper="mprMapping.MprMapper"
      :dataKey="'mpr_code'"
  />

  <!-- ===== MRP 정보 팝업 ===== -->
  <SinglePopup
      v-model:visible="mrpPopupVisible"
      :items="mrpRef"
      @confirm="handleMRPConfirm"  
      :mapper="mprMapping.MRPMapper"
      :dataKey="'mrp_code'"
  />

</template>