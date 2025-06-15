<script setup>
import { ref, computed } from 'vue';
import OrderManageSearch from './order-manage-sub/OrderManageSearch.vue';
import OrderManageProduct from './order-manage-sub/OrderManageProduct.vue';

/* ===== 중앙 상태 관리 ===== */
const ord_code = ref({});
const ord_name = ref({});
const ord_date = ref({});
const selectedClient = ref({});
const empCode = ref({ value: "EMP-10001" }); // 로그인 후 전역상태에서 받아오기
// const empCode = ref("EMP-10001");
const note = ref({});
</script>

<template>
  <!-- ===== 기본정보 영역 ===== -->
  <OrderManageSearch
    :ord-code="ord_code"
    :ord-name="ord_name"
    :ord-date="ord_date"
    :selected-client="selectedClient"
    :emp-code="empCode"
    :note="note"
  />

  <!-- ===== 제품 영역 ===== -->
  <OrderManageProduct />
</template>
