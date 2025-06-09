<script setup>
import { ref } from 'vue';
import Button  from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';

// Props
const props = defineProps({
  fields: {
    type: Array,
    required: true
  },
  mapper: {
    type: Object,
    default: () => ({})
  },
  dataKey: {
    type: String,
    default: 'id'
  },
  title: {
    type: String,
    default: ''
  },
  scrollHeight: {
    type: String,
    default: '400px' // 기본값 지정
  }
})

// Emits
const emit = defineEmits(['update'])

// 상태 관리
const rows = ref([]) // 전체 데이터
const selectedRows = ref([]) // 선택된 행

// 새 행 추가
const addRow = () => {
  const newRow = Object.fromEntries(props.fields.map(f => [f, '']))
  newRow[props.dataKey] = Date.now() // 간단한 고유 ID
  rows.value.push(newRow)
  emit('update', rows.value)
}

// 선택된 행 삭제
const deleteSelected = () => {
  rows.value = rows.value.filter(row => !selectedRows.value.includes(row))
  selectedRows.value = []
  emit('update', rows.value)
}
</script>

<template>
    <div class="card">
        <div class="flex flex-col gap-4">
            <!-- 🔽 타이틀 표시 -->
            <div class="grid grid-cols-1 gap-4">
                <div class="flex justify-between">
                    <div>
                        <div class="font-semibold text-2xl">{{ title }}</div>
                    </div>
                    <div class="flex justify-end gap-2">
                        <Button label="선택 삭제" icon="pi pi-trash" severity="danger" @click="deleteSelected" />
                        <Button label="행 추가" icon="pi pi-plus" @click="addRow" />
                    </div>
                </div>
            </div>
            <DataTable v-model:selection="selectedRows" :value="rows" :dataKey="dataKey" selectionMode="multiple"
                showGridlines scrollable :scrollHeight="scrollHeight" tableStyle="min-width: 50rem">
                <Column selectionMode="multiple" headerStyle="width: 3rem" />

                <Column v-for="field in fields" :key="field" :field="field" :header="mapper?.[field] ?? field">
                    <template #body="slotProps">
                        <InputText v-model="slotProps.data[field]" class="w-full" placeholder="입력" />
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>


