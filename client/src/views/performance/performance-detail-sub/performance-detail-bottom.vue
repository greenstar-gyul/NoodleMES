<script setup>
const equipmentList = [
  { code: 'EQ001', name: '배합기' },
  { code: 'EQ002', name: '숙성기' },
  { code: 'EQ003', name: '압연기' },
  { code: 'EQ004', name: '포장기' },
  { code: 'EQ005', name: '절단기' },
  { code: 'EQ006', name: '성형기' },
  { code: 'EQ007', name: '스팀터널' },
  { code: 'EQ008', name: '튀김기' },
  { code: 'EQ009', name: '건조기' },
  { code: 'EQ010', name: '냉각기' },
  { code: 'EQ011', name: '스프계량기' },
  { code: 'EQ012', name: '충전기' },
];
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
        <div class="font-semibold text-md">{{ eq.code }}</div>
        <div class="text-sm text-gray-600">{{ eq.name }}</div>
      </div>
    </div>
  </div>
</template>


