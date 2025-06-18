<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useReleaseProductStore } from '@/stores/releaseProductStore';

import axios from 'axios';
import moment from 'moment';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import orderMapping from '@/service/OrderMapping';
import releaseMapping from '@/service/ReleaseMapping';

import LabeledInput from '@/components/registration-bar/LabeledInput.vue';
import LabeledTextarea from '@/components/registration-bar/LabeledTextarea.vue';
import Button from 'primevue/button';

// 상위 컴포넌트에서 전달받은 props
const props = defineProps({
  ordCode: { type: Object, required: true },
  ordDate: { type: Object, required: true },
  empCode: { type: Object, required: true }, // 사용자가 입력
  note: { type: Object, required: true }, // 사용자가 입력
  releaseCode: { type: Object, required: true },
  releaseDate: { type: Object, required: true }
});

// 피니아
const prodStore = useReleaseProductStore();
// Store에서 프로퍼티를 추출하면서 반응성을 유지하려면 storeToRefs()를 사용해야 한다.
// storeToRefs()는 Pinia 스토어의 "상태!"를 반응형으로 변환해준다.
// 따라서, storeToRefs()를 사용하여 상태를 추출하는 것이 좋다.

// 상태는 반응형으로 가져오기
const { productRows } = storeToRefs(prodStore);
// 함수는 그대로 가져오기
const { setProductRows, resetProductRows, setSelectedProducts } = prodStore;


/* ===== DATA ===== */
// 주문 팝업
const orderPopupVisible = ref(false);

// 출고 팝업
const releasePopupVisible = ref(false);

// 주문 데이터
const ordersRef = ref([]);

// 전체 거래처 목록
const allClients = ref([]);

// 출고 정보 목록
const releaseList = ref([]);

// 거래처명
const clientLabel = ref('');

// 거래처 코드
const clientCode = ref('');


/* ===== FUNCTIONS ===== */
//초기화
const handleReset = () => {
  // 주문/출고 기본 정보 초기화
  props.ordCode.value = '';
  props.ordDate.value = '';
  props.releaseCode.value = '';
  props.releaseDate.value = '';
  props.empCode.value = 'EMP-10001';
  props.note.value = '';

  // 거래처 관련
  clientLabel.value = '';
  clientCode.value = '';

  // 제품 목록 초기화
  resetProductRows();

  console.log('초기화 완료 (출고 + 주문정보 + 거래처 + 제품 목록)');
};

//삭제
const handleDelete = async () => {
    if (!props.ordCode.value) {
        alert('출고코드가 없습니다. 삭제할 출고를 먼저 선택하세요!');
        return;
    }

    const confirmed = confirm('정말로 이 출고를 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      await axios.delete(`/api/order/${props.ordCode.value}`);
      handleReset(); // 초기화 함수 호출
      alert('출고가 삭제되었습니다.');
    } catch (error) {
      console.error('출고 삭제 실패:', error);
      alert('출고 삭제 중 오류가 발생했습니다.');
    }
};

//저장
const handleSave = async () => {
  if (productRows.value.length === 0) {
    alert('제품 목록이 비어 있습니다. 최소 하나의 제품을 추가해주세요.');
    return;
  }

  const confirmed = confirm('출고 정보를 저장하시겠습니까?');
  if (!confirmed) return;

  try {
    // 전체 출고 제품 목록 데이터 구성
    const details = productRows.value.map(row => {
      const req_qtt = Number(row.ord_amount);
      const outbnd_qtt = Number(row.outbnd_qtt);
      const ord_amount = Number(row.ord_amount);
      const com_value = row.com_value_code;
      const outbound_request_code = row.outbound_request_code;

      if (outbnd_qtt > req_qtt) {
        throw new Error(`제품 ${row.prod_name}의 출고수량이 주문수량보다 많습니다.`);
      }

      return {
        poutbnd_code: row.poutbnd_code || '', // 수정 시 사용
        prod_code: row.prod_code,
        prod_name: row.prod_name,
        req_qtt,
        outbnd_qtt,
        delivery_date: row.delivery_date,
        client_code: clientCode.value || productRows.value[0]?.client_code,
        mcode: props.empCode.value ?? 'EMP-10001',
        note: props.note.value,
        outbound_request_code,
        com_value: row.com_value_code,
        ord_amount
      };
    });

    // 등록 vs 수정 구분
    const isAllNew = details.every(d => !d.poutbnd_code);

    if (isAllNew) {
      // 전체 등록
      const payload = {
        ord_code: props.ordCode.value,
        release_date: moment().format("YYYY-MM-DD"),
        client_code: clientCode.value,
        mcode: props.empCode.value ?? 'EMP-10001',
        note: props.note.value,
        details
      };
      await axios.post('/api/order/releases', payload);
    } else {
      // 전체 수정
      const poutbnd_code = details[0].poutbnd_code;
      await axios.put(`/api/order/releases/${poutbnd_code}`, { details });
    }

    alert('출고 정보가 저장되었습니다.');
    handleReset();
  } catch (err) {
    console.error('출고 저장 실패:', err);
    alert(err.message || '출고 저장 중 오류 발생');
  }
};



// 주문정보 팝업 Confirm 핸들러
const orderHandleConfirm = async (selectedOrder) => {
  console.log('선택된 주문:', selectedOrder);

  try {
    // 주문 상세 조회
    // 서버에서 JOIN으로 prod_name, unit 등도 같이 내려줘야 함
    const detailRes = await axios.get(`/api/order/${selectedOrder.ord_code}/details`);
    const details = detailRes.data.data;//store 함수 사용

    // 제품행 고유 ID와 날짜 포맷 지정 (반응형 처리 위해 꼭 필요)
    details.forEach((item, idx) => {
      item.ord_d_code = item.ord_d_code || `row-${idx}`;
      item.delivery_date = moment(item.delivery_date).format('YYYY-MM-DD');
      item.outbound_request_code = props.ordCode.value;
      item.com_value_code = item.com_value_code || '';  // DB 저장용 코드 유지
      item.com_value = item.com_value || '';
      item.req_qtt = item.ord_amount; 
    });

    setProductRows(details);

    // 주문 기본 정보 설정
    props.ordCode.value = selectedOrder.ord_code;
    props.ordDate.value = moment(selectedOrder.ord_date).format("YYYY-MM-DD");

    const client = allClients.value.find(c => c.client_code === selectedOrder.client_code);
    clientLabel.value = client ? client.client_name : '';
    clientCode.value = selectedOrder.client_code;
    clientLabel.value = client ? client.client_name : '';

    console.log('선택된 거래처 코드:', selectedOrder.client_code);
    console.log('전체 거래처 목록:', allClients.value);
    console.log('매핑된 거래처 이름:', client?.client_name);
  } catch (err) {
    console.error('주문 상세 조회 실패:', err);
  }
};

// 출고정보 팝업 Confirm 핸들러
const releaseHandleConfirm = async (selectedRelease) => {
  try {
    const out_req_code = selectedRelease.out_req_code;

    // 출고 상세 조회
    const res = await axios.get(`/api/order/releases/recode/${out_req_code}`);
    const { productList } = res.data.data;

    // 포맷 처리
    productList.forEach((item, idx) => {
      item.ord_d_code = item.ord_d_code || `row-${idx}`;
      item.delivery_date = moment(item.delivery_date).format("YYYY-MM-DD");
    });

    // 제품 목록 저장
    setProductRows(productList);

    // 출고 기본 정보 설정
    props.releaseCode.value = out_req_code;
    props.releaseDate.value = moment().format("YYYY-MM-DD"); // 출고일자 설정 필요시 수정

    // 주문 기본정보 설정
    props.ordCode.value = selectedRelease.ord_code;
    props.ordDate.value = moment().format("YYYY-MM-DD"); // 출고일자 설정 필요시 수정

    // 거래처 이름 매핑
    clientLabel.value = selectedRelease.client_name;
    // clientCode.value = productList[0].client_code || '';
    clientCode.value = productList[0].client_code || selectedRelease.client_code || '';

    // 등록자 설정
    props.empCode.value = productList[0].mcode || 'EMP-10001'; // 기본값 설정

    // 비고 설정
    props.note.value = selectedRelease.note || '';

  } catch (err) {
    console.error("출고 상세 조회 실패:", err);
    alert("출고 상세정보 불러오기에 실패했습니다.");
  }
};


// 최초 로딩 시 주문 목록과 거래처 목록 조회
onMounted(async () => {
  try {
    // 주문 목록 조회
    const res = await axios.get('/api/order/all');

    //moment 패키지 사용
    //map: 기존 배열의 각 요소를 가공해서 새로운 배열을 만들어주는 함수
    ordersRef.value = res.data.data.map(order => ({
      //기존 order 객체를 그대로 복사하면서 ord_date 값만 YYYY-MM-DD 포맷으로 변환해서 덮어쓰기
      ...order,
      ord_date: moment(order.ord_date).format('YYYY-MM-DD')
    }));

    // 출고 정보 목록 조회
    // 출고 정보 목록은 팝업에서 사용하기 위해 별도로 조회
    const releaseRes = await axios.get('/api/order/releases/popup');
    releaseList.value = releaseRes.data.data.map(release => ({
      ...release,
      out_req_date: moment(release.out_req_date).format('YYYY-MM-DD')
    }));

    // 거래처 목록 조회
    const clientRes = await axios.get('/api/order/clients');
    const clientList = clientRes.data.data;
    allClients.value = clientList;

  } catch (err) {
    console.error('데이터 로딩 실패:', err);
  }
});
</script>

<template>
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
      <!-- 헤더 영역 -->
      <div class="grid grid-cols-1 gap-4">
          <div class="flex justify-between">
              <div>
                  <div class="font-semibold text-2xl">기본정보</div>
              </div>
              <div class="flex items-center gap-2 flex-nowrap">
                  <Button label="삭제" severity="danger" class="min-w-fit" @click="handleDelete" />
                  <Button label="초기화" severity="contrast" class="min-w-fit" @click="handleReset" />
                  <Button label="저장" severity="info" class="min-w-fit" @click="handleSave" />
                  <Button
                      label="주문정보 불러오기"
                      severity="success"
                      class="min-w-fit whitespace-nowrap"
                      @click="orderPopupVisible = true"
                  />
                  <Button
                      label="출고정보 불러오기"
                      severity="success"
                      class="min-w-fit whitespace-nowrap"
                      @click="releasePopupVisible = true"
                  />
              </div>
          </div>
      </div>

      <!-- 입력 폼 영역 1 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LabeledInput label="출고코드" v-model="props.releaseCode.value" placeholder="출고코드" :disabled="true" />
          <LabeledInput label="주문코드" v-model="props.ordCode.value" placeholder="주문코드" :disabled="true" />
      </div>

      <!-- 입력 폼 영역 2 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LabeledInput label="출고일자" v-model="props.releaseDate.value" :disabled="true"/>
          <LabeledInput label="주문일자" v-model="props.ordDate.value" :disabled="true"/>
      </div>

      <!-- 입력 폼 영역 3 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LabeledInput label="거래처" v-model="clientLabel" :disabled="true"/>
          <LabeledInput label="등록자" v-model="props.empCode.value" :disabled="true"/>
          
      </div>

      <!-- 입력 폼 영역 3 -->
      <div class="grid grid-cols-1 md:grid-cols-1 gap-4">          
          <LabeledTextarea label="비고" v-model="props.note.value" placeholder="특이사항 입력"/>         
      </div>
  </div>
  <!-- ===== 주문정보 팝업 ===== -->
  <SinglePopup v-model:visible="orderPopupVisible" :items="ordersRef" @confirm="orderHandleConfirm" :mapper="orderMapping" :dataKey="'ord_code'" />

  <!-- ===== 출고정보 팝업 ===== -->
   <SinglePopup
      v-model:visible="releasePopupVisible"
      :selectedHeader = "['out_req_code', 'total_order_qtt', 'total_release_qtt', 'ord_code', 'client_name', 'mcode', 'out_req_date']"
      :items="releaseList"
      @confirm="releaseHandleConfirm"
      :mapper="releaseMapping"
      :dataKey="'out_req_code'"
  />
</template>