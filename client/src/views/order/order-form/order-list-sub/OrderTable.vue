<script setup>
import TableWithExcel from '@/components/form/TableWithExcel.vue';
import orderMapper from '@/service/OrderMapping.js';
import { onMounted, nextTick } from 'vue';
import { useOrderListStore } from '@/stores/orderListStore';
import { storeToRefs } from 'pinia';

// 피니아
// const { productRows, selectedProducts, setProductRows, resetProductRows, setSelectedProducts } = useOrderProductStore();
const ordStore = useOrderListStore();
// Store에서 프로퍼티를 추출하면서 반응성을 유지하려면 storeToRefs()를 사용해야 한다.
// storeToRefs()는 Pinia 스토어의 "상태!"를 반응형으로 변환해준다.
// 따라서, storeToRefs()를 사용하여 상태를 추출하는 것이 좋다.

// 상태는 반응형으로 가져오기
const { orders } = storeToRefs(ordStore);
// 함수는 그대로 가져오기
const { fetchOrdersByDate, setDefaultDateRange } = ordStore;


// 컴포넌트가 마운트될 때 주문 목록을 가져오기
// onMounted(() => {
//   ordStore.setDefaultDateRange();
//   console.log('현재 search 조건:', ordStore.search);
//   fetchOrdersByDate();
// });
onMounted(async () => {
  // 날짜 초기화
  setDefaultDateRange();
  fetchOrdersByDate();
});
</script>

<template>
  <TableWithExcel title="주문서조회" :data="orders" :dataKey="'ord_code'" :mapper="orderMapper"/>
</template>