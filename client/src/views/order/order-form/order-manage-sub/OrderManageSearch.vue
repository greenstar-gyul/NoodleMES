<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import moment from 'moment';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import orderMapping from '@/service/OrderMapping';
import productMapping from '@/service/ProductMapping.js';

import LabeledInput from '@/components/registration-bar/LabeledInput.vue';
import LabeledTextarea from '@/components/registration-bar/LabeledTextarea.vue';
import LabeledSelect from '@/components/registration-bar/LabeledSelect.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';
import { Select } from 'primevue';

const props = defineProps({
  productRows: { type: Array, required: true },
  ordCode: { type: Object, required: true },
  ordName: { type: Object, required: true },
  ordDate: { type: Object, required: true },
  selectedClient: { type: Object, required: true },
  selectedManager: { type: Object, required: true },
  note: { type: Object, required: true },
});

/* ===== DATA ===== */
// 주문 팝업
const orderPopupVisible = ref(false);

// 주문 데이터
const ordersRef = ref([]);

// 전체 거래처 목록
const allClients = ref([]);

//거래처 셀렉트박스
const clientOptions = ref([]);

//거래처담당자 셀렉트박스
const managerOptions = ref([]);


/* ===== FUNCTIONS ===== */

//초기화
const handleReset = () => {
    // 주문 기본정보 초기화
    props.ordCode.value = '';
    props.ordName.value = '';
    props.ordDate.value = '';
    props.note.value = '';
    props.selectedClient.value = null;
    props.selectedManager.value = null;

    // 제품 목록 초기화
    props.productRows.value = [];

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
  if (!props.ordName.value || !props.selectedClient.value) {
    alert('주문명과 거래처는 필수입니다.');
    return;
  }
  if (props.productRows.value.length === 0) {
    alert('제품 목록이 비어 있습니다. 최소 하나의 제품을 추가해주세요.');
    return;
  }

  // 주문 본문의 데이터 객체
  const order = {
    ord_code: props.ordCode.value,
    ord_name: props.ordName.value,
    ord_date: moment().format('YYYY-MM-DD'),
    ord_stat: 'a1',
    note: props.note.value,
    mcode: props.selectedManager.value,
    client_code: props.selectedClient.value
  };

  const details = props.productRows.value.map(item => ({
    ord_code: item.ord_code,
    prod_code: item.prod_code,
    prod_amount: item.prod_amount,
    prod_price: item.prod_price,
    delivery_date: item.delivery_date,
    ord_priority: item.ord_priority,
    total_price: item.total_price
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
    props.productRows.value = detailRes.data.data;

    // 주문 기본 정보 설정
    props.ordCode.value = selectedOrder.ord_code;
    props.ordName.value = selectedOrder.ord_name;
    props.ordDate.value = moment(selectedOrder.ord_date).format("YYYY.MM.DD");
    props.note.value = selectedOrder.note || '';
    props.selectedClient.value = selectedOrder.client_code;
    props.selectedManager.value = selectedOrder.mcode;
  } catch (err) {
    console.error('주문 상세 조회 실패:', err);
  }
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
    const clientRes = await axios.get('/api/order/orders/clients');
    const clientList = clientRes.data.data;

    // 전체 목록 저장
    allClients.value = clientList;

    // 거래처 셀렉트 박스에 사용될 label + value 구성
    clientOptions.value = clientList.map(client => ({
      label: client.client_name,
      value: client.client_code
    }));

    // 거래처 담당자 셀렉트 박스도 따로 구성 (담당자 이름만 쓰는 구조면 이렇게)
    managerOptions.value = clientList.map(client => ({
      label: client.client_mname,
      value: client.client_mname
    }));

  } catch (err) {
    console.error('데이터 로딩 실패:', err);
  }
});

// 거래처 변경 시 담당자 목록 업데이트
watch(() => props.selectedClient.value, (newClientCode) => {
  const target = allClients.value.find(c => c.client_code === newClientCode);

  if (target) {
    managerOptions.value = [{
      label: target.client_mname,
      value: target.client_mname
    }];
    props.selectedManager.value = target.client_mname;
  } else {
    managerOptions.value = [];
    props.selectedManager.value = null;
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
          <LabeledSelect
              label="거래처"
              v-model="props.selectedClient.value"
              :options="clientOptions"
              placeholder="거래처를 선택해주세요"
          />
      </div>

      <!-- 입력 폼 영역 3 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LabeledSelect
              label="거래처 담당자"
              v-model="props.selectedManager.value"
              :options="managerOptions"
              placeholder="거래처 담당자를 선택해주세요"
          />
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
</template>