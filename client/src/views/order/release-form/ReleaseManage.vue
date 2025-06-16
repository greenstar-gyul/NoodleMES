<script setup>
import { ref } from 'vue';
import ReleaseManageSearch from './release-manage-sub/ReleaseManageSearch.vue';
import ReleaseManageProduct from './release-manage-sub/ReleaseManageProduct.vue';

/* ===== 중앙 상태 관리 ===== */
const ord_code = ref({});
const ord_date = ref({});
const selectedClient = ref({});
const empCode = ref({});
const note = ref({});
</script>

<template>
  <!-- ===== 기본정보 영역 ===== -->
  <ReleaseManageSearch
    :ord-code="ord_code"
    :ord-date="ord_date"
    :selected-client="selectedClient"
    :emp-code="empCode"
    :note="note"
  />

  <!-- ===== 제품 영역 ===== -->
  <ReleaseManageProduct />
</template>
