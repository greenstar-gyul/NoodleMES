<script setup>
import { ref } from 'vue';
import OrderManageSearch from './order-manage-sub/OrderManageSearch.vue';
import OrderManageProduct from './order-manage-sub/OrderManageProduct.vue';

/* ===== 중앙 상태 관리 ===== */
const ord_code = ref({});
const ord_name = ref({});
const ord_date = ref({});
const selectedClient = ref({});
const selectedManager = ref({});
const note = ref({});
const productRows = ref([]);
const selectedProducts = ref([]);
</script>

<template>
  <!-- ===== 기본정보 영역 ===== -->
  <OrderManageSearch
    :ord-code="ord_code"
    :ord-name="ord_name"
    :ord-date="ord_date"
    :selected-client="selectedClient"
    :selected-manager="selectedManager"
    :note="note"
    :product-rows="productRows"
  />

  <!-- ===== 제품 영역 ===== -->
  <OrderManageProduct
    :product-rows="productRows"
    :selected-products="selectedProducts"
  />
</template>
