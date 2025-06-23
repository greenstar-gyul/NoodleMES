<script setup>
import { ref, defineProps } from 'vue';
import TableWithExcel from '@/components/form/TableWithExcel.vue';

defineProps({
    data: Array,
    mapper: {
        type: Object,
    }
})
</script>

<template>
    <div v-if="data.length !== 0">
        <TableWithExcel :data="data" :mapper="mapper" :dataKey="'mrp_d_code'" title="MRP조회" />
    </div>
    <div v-else class="text-center text-gray-500 mt-4">
        조건에 맞는 데이터가 없습니다.
    </div>
</template>