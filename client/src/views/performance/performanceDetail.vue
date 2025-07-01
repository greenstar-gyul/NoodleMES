<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import performanceTop from './performance-detail-sub/performance-detail-top.vue';
import performanceBottom from './performance-detail-sub/performance-detail-bottom.vue';
const route = useRoute();
const prdr_code = route.params.prdr_code;
const prdrDetail = ref(null); // 처음에는 null
// 상세 데이터 조회
onMounted(async () => {
  try {
    const res = await axios.get(`/api/prdr/detail`, {
      params: { prdr_code }
    });
    prdrDetail.value = res.data;
  } catch (err) {
    alert('오류가 발생했습니다. 다시 시도해주세요.');
  }
});
</script>

<template>
  <div>
    <div v-if="prdrDetail">
      <performanceTop :detail="prdrDetail" />
      <performanceBottom :detail="prdrDetail" />
    </div>
    <div v-else class="text-center text-gray-500 py-10">
      ⏳ 상세 데이터를 불러오는 중입니다...
    </div>
  </div>
</template>
