<script setup>
import { defineProps } from 'vue'
import TableWithDelExcelFix from '@/components/form/TableWithDelExcelFix.vue'
import qcrMapping from '@/service/QcrMapping.js'

const emit = defineEmits(['rowSelected'])

const handleProductRowClick = (row) => {
  emit('rowSelected', row)
  console.log('✅ row 클릭:', row)
}

defineProps({
  data: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <div class="space-y-4" style="width: 60%">
    <TableWithDelExcelFix
      :data="data"
      :dataKey="'qcr_code'"
      :mapper="qcrMapping"
      :columns="['qcr_code', 'inspection_item','com_value', 'regdate', 'note']"
      title="품질기준정보"
      scrollHeight="450px"
      @row-click="handleProductRowClick"
    />
  </div>
</template>
