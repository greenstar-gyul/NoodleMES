<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import performanceTop from './performance-detail-sub/performance-detail-top.vue'
import performanceBottom from './performance-detail-sub/performance-detail-bottom.vue'

const route = useRoute();
const prdr_code = route.params.prdr_code;

// 목록에서 클릭시 상세조회
onMounted(async () => {
  try {
    const res = await axios.get(`/api/prdr/detail?prdr_code=${prdr_code}`);
    prdrDetail.value = res.data;
    console.log('✅ 상세 데이터:', prdrDetail.value);
  } catch (err) {
    console.error('❌ 상세조회 실패:', err);
  }
});

</script>

<template>
    <performanceTop />
    
    <performanceBottom/>
</template>