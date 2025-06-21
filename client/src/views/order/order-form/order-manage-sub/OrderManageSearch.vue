<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useOrderProductStore } from '@/stores/orderProductStore';

import axios from 'axios';
import moment from 'moment';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import orderMapping from '@/service/OrderMapping';
import productMapping from '@/service/ProductMapping.js';
import clientMapping from '@/service/ClientMapping.js';

import LabeledInput from '@/components/registration-bar/LabeledInput.vue';
import LabeledInputIcon from '@/components/registration-bar/LabeledInputIcon.vue';
import LabeledTextarea from '@/components/registration-bar/LabeledTextarea.vue';
import LabeledSelect from '@/components/registration-bar/LabeledSelect.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';
import { Select } from 'primevue';

// 상위 컴포넌트에서 전달받은 props
const props = defineProps({
  ordCode: { type: Object, required: true },
  ordName: { type: Object, required: true },
  ordDate: { type: Object, required: true },
  selectedClient: { type: Object, required: true },
  empCode: { type: Object, required: true },
  note: { type: Object, required: true },
});

// 피니아
// const { productRows, selectedProducts, setProductRows, resetProductRows, setSelectedProducts } = useOrderProductStore();
const prodStore = useOrderProductStore();
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

// 거래처 팝업
const clientPopupVisible = ref(false);

// 주문 데이터
const ordersRef = ref([]);

// 전체 거래처 목록
const allClients = ref([]);

//거래처 셀렉트박스
// const clientOptions = ref([]);

//거래처담당자 셀렉트박스
// const managerOptions = ref([]);


/* ===== FUNCTIONS ===== */

//초기화
const handleReset = () => {
    // 주문 기본정보 초기화
    props.ordCode.value = '';
    props.ordName.value = '';
    props.ordDate.value = '';
    props.note.value = '';
    props.selectedClient.value = null;
    props.empCode.value = 'EMP-10001';

    // 제품 목록 초기화, store 함수 사용
    resetProductRows();
    console.log('초기화 완료 (주문 + 제품 목록)');
};

//삭제
const handleDelete = async () => {
    if (!props.ordCode.value) {
        alert('주문코드가 없습니다. 삭제할 주문을 먼저 선택하세요!');
        return;
    }

    const confirmed = confirm('정말로 이 주문을 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      await axios.delete(`/api/order/${props.ordCode.value}`);
      handleReset(); // 초기화 함수 호출
      alert('주문이 삭제되었습니다.');
    } catch (error) {
      console.error('주문 삭제 실패:', error);
      alert('주문 삭제 중 오류가 발생했습니다.');
    }
};

//저장
const handleSave = async () => {
  console.log("등록자 코드 (mcode):", props.empCode.value);
  
  if (!props.ordName.value || !props.selectedClient.value) {
    alert('주문명과 거래처는 필수입니다.');
    return;
  }
  if (productRows.value.length === 0) {
    alert('제품 목록이 비어 있습니다. 최소 하나의 제품을 추가해주세요.');
    return;
  }

  // 주문 본문의 데이터 객체
  const order = {
    ord_name: props.ordName.value,
    ord_date: moment().format('YYYY-MM-DD'),
    ord_stat: 'a1',
    note: props.note.value,
    mcode: props.empCode.value,
    client_code: props.selectedClient.value
  };

  const details = productRows.value.map(item => ({
    unit: item.unit,
    spec: item.spec,
    ord_amount: item.ord_amount,
    prod_price: item.prod_price,
    delivery_date:moment(item.delivery_date).format("YYYY-MM-DD"),
    ord_priority: item.ord_priority,
    total_price: item.total_price,
    prod_code: item.prod_code
  }));

  try {
    await axios.post('/api/order', { order, details });
    alert('주문이 등록되었습니다.');
    handleReset();
  } catch (err) {
    console.error('주문 저장 실패:', err);
    alert('주문 저장 중 오류 발생');
  }
};


// 주문정보 팝업 Confirm 핸들러
const handleConfirm = async (selectedOrder) => {
  console.log('선택된 주문:', selectedOrder);

  try {
    // 주문 상세 조회
    // 서버에서 JOIN으로 prod_name, unit 등도 같이 내려줘야 함
    const detailRes = await axios.get(`/api/order/${selectedOrder.ord_code}/details`);
    const details = detailRes.data.data;//store 함수 사용

    // 각 행에 고유 ID 부여 (반응형 처리 위해 꼭 필요)
    details.forEach((item, idx) => {
      item.ord_d_code = item.ord_d_code || `row-${idx}`;
      item.delivery_date = moment(item.delivery_date).format('YYYY-MM-DD');
      // item.prod_amount = item.ord_amount;
    });

    setProductRows(details);

    // 주문 기본 정보 설정
    props.ordCode.value = selectedOrder.ord_code;
    props.ordName.value = selectedOrder.ord_name;
    props.ordDate.value = moment(selectedOrder.ord_date).format("YYYY-MM-DD");
    props.note.value = selectedOrder.note || '';
    props.selectedClient.value = selectedOrder.client_code;
    props.empCode.value= selectedOrder.mcode;
  } catch (err) {
    console.error('주문 상세 조회 실패:', err);
  }
};

// 거래처정보 팝업 Confirm 핸들러
const clientConfirm = selectedClient => {
  props.selectedClient.value = selectedClient.client_code;
};

// 최초 로딩 시 주문 목록과 거래처 목록 조회
onMounted(async () => {
  try {
    // 주문 목록 조회
    const res = await axios.get('/api/order/all');
    //ordersRef.value = res.data;

    //moment 패키지 사용
    //map: 기존 배열의 각 요소를 가공해서 새로운 배열을 만들어주는 함수
    ordersRef.value = res.data.data.map(order => ({
      //기존 order 객체를 그대로 복사하면서 ord_date 값만 YYYY-MM-DD 포맷으로 변환해서 덮어쓰기
      ...order,
      ord_date: moment(order.ord_date).format('YYYY-MM-DD')
    }));

    // 전체 거래처 목록 조회
    const clientRes = await axios.get('/api/order/clients');
    const clientList = clientRes.data.data;

    // 전체 목록 저장
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
              </div>
          </div>
      </div>

      <!-- 입력 폼 영역 1 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LabeledInput label="주문코드" v-model="props.ordCode.value" placeholder="주문코드" :disabled="true" />
          <LabeledInput label="주문명" v-model="props.ordName.value" />
      </div>

      <!-- 입력 폼 영역 2 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LabeledInput label="주문일자" v-model="props.ordDate.value" :disabled="true"/>
          <!-- <LabeledSelect
              label="거래처"
              v-model="props.selectedClient.value"
              :options="clientOptions"
              placeholder="거래처를 선택해주세요"
          /> -->
          <LabeledInputIcon label="거래처" v-model="props.selectedClient.value" placeholder="거래처를 선택해주세요" @click="clientPopupVisible = true"></LabeledInputIcon>
      </div>

      <!-- 입력 폼 영역 3 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LabeledInput label="등록자" v-model="props.empCode.value" :disabled="true"/>
          <LabeledTextarea
              label="비고"
              v-model="props.note.value"
              placeholder="특이사항 입력"
          />
      </div>
  </div>
  <!-- ===== 주문정보 팝업 ===== -->
  <SinglePopup
      v-model:visible="orderPopupVisible"
      :items="ordersRef"
      @confirm="handleConfirm"
      :mapper="orderMapping"
      :dataKey="'ord_code'"
  />

  <!-- ===== 거래처정보 팝업 ===== -->
  <SinglePopup
      v-model:visible="clientPopupVisible"
      :items="allClients"
      @confirm="clientConfirm"
      :mapper="clientMapping"
      :dataKey="'client_code'"
  />
</template>