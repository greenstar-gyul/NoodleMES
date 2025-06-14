<script setup>
import OrderListSearch from './order-list-sub/OrderListSearch.vue';
import OrderTable from './order-list-sub/OrderTable.vue';
</script>

<template>
    <!-- ===== 검색바 영역 ===== -->
    <OrderListSearch></OrderListSearch>

    <!-- ===== 검색조회 영역 ===== -->
    <OrderTable></OrderTable>    
</template>