<script setup>
import { ref, onMounted, defineProps } from 'vue';
import axios from 'axios';

const equipmentList = ref([]);

const props = defineProps({
  detail: {
    type: Object,
    required: true
  }
});

onMounted(async () => {
  try {
    const res = await axios.get('/api/prdr/equipment', {
      params: { prdr_code: props.detail.prdr_code }
    });
    equipmentList.value = res.data;
  } catch (err) {
    alert('오류가 발생했습니다. 다시 시도해주세요.');
  }
});
</script>

<template>
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6 mt-6">
    <div class="font-semibold text-2xl">사용설비</div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="eq in equipmentList"
        :key="eq.code"
        class="bg-yellow-100 text-center rounded-lg p-4 shadow-sm"
      >
        <div class="font-semibold text-md">{{ eq.eq_code }}</div>
        <div class="text-sm text-gray-600">{{ eq.eq_name }}</div>
      </div>
    </div>
  </div>
</template>
