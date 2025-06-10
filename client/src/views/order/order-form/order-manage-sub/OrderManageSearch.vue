<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
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

//거래처
const clientOptions = ref([]);

//거래처담당자
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
        // 여기서 실제 API 요청 보내기 (예시)
        // await axios.delete(`/api/orders/${ord_code.value}`);

        console.log(`주문 삭제 요청 완료: 주문코드=${ord_code.value}`);

        // 삭제 성공 시 화면 초기화
        handleReset();

        alert('주문이 삭제되었습니다.');
    } catch (error) {
        console.error('주문 삭제 실패:', error);
        alert('주문 삭제 중 오류가 발생했습니다.');
    }
};

//저장
const handleSave = () => {
    const saveData = {
      ord_code: props.ordCode.value,
      ord_name: props.ordName.value,
      ord_date: props.ordDate.value,
      client_name: props.selectedClient.value,
      manager: props.selectedManager.value,
      note: props.note.value,
      products: [] // 제품은 상위에서 받으면 같이 붙이면 됨
    };

    console.log('저장할 데이터:', saveData);

    // 여기서 실제 서버로 저장 요청 보내면 됨 (ex. axios.post('/api/orders', saveData))
};


// 주문정보 팝업 Confirm 핸들러
const handleConfirm = (selectedOrder) => {
    console.log('선택된 주문:', selectedOrder);

    // 제품 정보 조회
    axios.get(`http://localhost:3000/ord_d_tbl?ord_code=${selectedOrder.ord_code}`)
      .then(async (res) => {
        const orderDetails = res.data;

        // 제품 상세 정보까지 조합 (prod_tbl에서 조회)
        const products = await Promise.all(orderDetails.map(async (detail) => {
          const prodRes = await axios.get(`http://localhost:3000/prod_tbl?prod_code=${detail.prod_code}`);
          const prodInfo = prodRes.data[0];
          return {
            ...detail,
            prod_name: prodInfo?.prod_name || '',
            unit: prodInfo?.unit || '',
            spec: prodInfo?.spec || '',
            note: prodInfo?.note || ''
          };
        }));

        props.productRows.value = products;
      });

    // 주문 기본정보 입력
    props.ordCode.value = selectedOrder.ord_code;
    props.ordName.value = selectedOrder.ord_name;
    props.ordDate.value = selectedOrder.ord_date;
    props.note.value = selectedOrder.note || '';

    // 거래처 정보 입력
    axios.get(`http://localhost:3000/client_tbl?client_code=${selectedOrder.client_code}`)
      .then(res => {
        const clientInfo = res.data[0];
        if (clientInfo) {
          props.selectedClient.value = clientInfo.client_code;
          props.selectedManager.value = clientInfo.client_mname;
        }
      });
};   

onMounted(async () => {
  try {
    const orderRes = await axios.get('http://localhost:3000/ord_tbl');
    ordersRef.value = orderRes.data;

    const clientRes = await axios.get('http://localhost:3000/client_tbl');
    const clientList = clientRes.data;

    clientOptions.value = clientList.map(client => ({
      label: client.client_name,
      value: client.client_code
    }));

    managerOptions.value = clientList.map(client => ({
      label: client.client_mname,
      value: client.client_mname  // 또는 client_code로 해도 됨
    }));

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