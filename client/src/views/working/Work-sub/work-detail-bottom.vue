<script setup>
import { ref, onMounted, defineProps } from 'vue';
import axios from 'axios';


const props = defineProps({
  detail: {
    type: Object,
    required: true
  }
});

const equipmentList = ref([]);
const currentEqCode = props.detail.eq_code;

onMounted(async () => {
  try {
    const res = await axios.get('/api/work/eqList', {
      params: { wko_code: props.detail.wko_code }
    });
    equipmentList.value = res.data;
  } catch (err) {
    alert('오류가 발생했습니다. 다시 시도해주세요.');
  }
});

equipmentList.value.forEach(eq => {
});
</script>

<template>
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6 mt-6">
    <div class="font-semibold text-2xl">사용중인 설비</div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="eq in equipmentList"
        :key="eq.eq_code"
        :class="[
          'text-center rounded-lg p-4 shadow-sm transition',
          eq.eq_code === props.detail.eq_code
            ? 'bg-yellow-300 border-2 border-yellow-600 font-bold'
            : 'bg-white border border-gray-200'
        ]"
      >
        <div class="font-semibold text-md">{{ eq.eq_code }}</div>
        <div class="text-sm text-gray-600">{{ eq.eq_name }}</div>

        <div v-if="eq.eq_code === props.detail.eq_code" class="text-xs text-yellow-700">
        </div>
      </div>
    </div>
  </div>
</template>
