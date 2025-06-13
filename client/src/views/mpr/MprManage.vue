<!--
25.06.08 ~ 12
made by KMS
자재구매요청관리
-->

<script setup>
import axios from 'axios';
import MprManageMain from './mpr-manage-sub/MprManageMain.vue';
import MprManageDetail from './mpr-manage-sub/MprManageDetail.vue';
import { onMounted, ref } from 'vue';
import MprMapper from '@/service/MprMapping.js';


// 데이터 및 옵션
const mprdata = ref([]); // 구매요청 데이터 불러올 때, 등록할 때 사용?
const originalData = ref([]);   // 전체 원본 데이터


</script>

<template>
  <MprManageMain @search="handleSearch" @reset="resetSearch"/>
  <MprManageDetail/>
 
  <!-- 조건 미일치 메시지 -->
  <div v-if="mprdata.length === 0" class="text-center text-gray-500 mt-4">
    조건에 맞는 데이터가 없습니다.
  </div>
</template>

