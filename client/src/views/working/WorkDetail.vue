<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

import workDetailTop from './Work-sub/work-detail-top.vue';
import workDetailBottom from './Work-sub/work-detail-bottom.vue';
import { useWebSocketStore } from '../../stores/websocket';
import moment from 'moment';

const wsStore = useWebSocketStore();
const route = useRoute();
const wko_code = route.params.wko_code;
const eq_code = route.params.eq_code;

const workDetail = ref(null); // 처음에는 null

// 상세 데이터 조회
onMounted(() => {
  loadDetail();
});

const loadDetail = async () => {
  try {
    const res = await axios.get(`/api/work/detail/one`, {
      params: { wko_code, eq_code }
    });
    res.data.eq_code = eq_code;
    workDetail.value = res.data;
    workDetail.value.start_date = workDetail.value.start_date ? moment(workDetail.value.start_date).format('YYYY-MM-DD HH:mm:ss') : null;
    workDetail.value.end_date = workDetail.value.end_date ? moment(workDetail.value.end_date).format('YYYY-MM-DD HH:mm:ss') : null;
  } catch (err) {
    alert('오류가 발생했습니다. 다시 시도해주세요.');
  }
}

// 공정 상세 업데이트 받기
watch(() => wsStore.messages, (messages) => {
  const latest = messages[messages.length - 1];
  if (latest?.type === 'PROCESS_UPDATE') {
    // 진행률 업데이트
    console.log('진행률:', latest.progress);
  }
}, { deep: true });
</script>

<template>
  <div>
    <div v-if="workDetail">
      <workDetailTop :detail="workDetail" :wkoCode="wko_code"/>
      <workDetailBottom :detail="workDetail" />
    </div>
    <div v-else class="text-center text-gray-500 py-10">
      ⏳ 상세 데이터를 불러오는 중입니다...
    </div>
  </div>
</template>
