<template>
    <div class="card mt-6">
        <div class="grid grid-cols-1 gap-4 mb-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">{{ title }}</div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button label="점검결과 불러오기" severity="success" class="min-w-fit whitespace-nowrap" @click="loadInspectionResults" />
                </div>
            </div>
        </div>

        <DataTable
            v-model:selection="selectedWE"
            :value="data"
            :dataKey="dataKey"
            showGridlines
            scrollable
            scrollHeight="400px"
            tableStyle="min-width: 50rem"
        >
            <Column
                v-for="item in itemsWE"
                :key="item"
                :field="item"
                :header="mapper[item] ?? item"
            />
        </DataTable>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const props = defineProps({
    data: {
        type: Array,
        required: true
    },
    dataKey: {
        type: String,
        default: 'id'
    },
    mapper: {
        type: Object,
        required: true
    },
    title: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['loadInspectionResults']);

const itemsWE = ref([]);

watch(
    () => props.data,
    (newVal) => {
        if (newVal?.length > 0) {
            itemsWE.value = Object.keys(newVal[0]);
        } else {
            itemsWE.value = [];
        }
    },
    { immediate: true }
);

const selectedWE = ref();

const loadInspectionResults = () => {
    emit('loadInspectionResults');
}

</script>

<style scoped>
/* 필요시 커스텀 스타일 여기에 추가 */
</style>
