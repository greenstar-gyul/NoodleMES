<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

import workDetailTop from './Work-sub/work-detail-top.vue';
import workDetailBottom from './Work-sub/work-detail-bottom.vue';

const route = useRoute();
console.log('📦 쿼리 파라미터:', route.query);
const wko_code = route.params.wko_code;
const eq_code = route.params.eq_code;
console.log('🧩 wko_code:', wko_code, '| eq_code:', eq_code);

const workDetail = ref(null); // 처음에는 null

// 상세 데이터 조회
onMounted(async () => {
  try {
    const res = await axios.get(`/api/work/detail/one`, {
      params: { wko_code, eq_code }
    });
    workDetail.value = res.data;
    console.log('✅ 상세 데이터:', workDetail.value);
  } catch (err) {
    console.error('❌ 상세조회 실패:', err);
  }
});
</script>

<template>
  <div>
    <div v-if="workDetail">
      <workDetailTop :detail="workDetail" />
      <workDetailBottom :detail="workDetail" />
    </div>
    <div v-else class="text-center text-gray-500 py-10">
      ⏳ 상세 데이터를 불러오는 중입니다...
    </div>
  </div>
</template>
