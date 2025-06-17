<script setup>
import moment from 'moment';
console.log(moment('2025.06.16', 'YYYY.MM.DD').format('YYYY년 MM월 DD일'));
const props = defineProps({
  data: {
    type: Array,
    default: [
      {
        po_name: '원료 배합',
        proc_rate: '10.5',
        eq_code: 'EQ-AAA-0001',
        eq_name: '배합기',
        start_date: moment('2025.06.16-09:33:12', 'YYYY.MM.DD-HH:mm:ss').format('YYYY-MM-DD HH:mm:ss'),
        end_date: '-',
        input_qtt: 8080,
        def_qtt: 10,
        make_qtt: 8070
      }
    ]
  },
  dataKey: {
    type: String,
    default: 'id'
  },
})

const loadProcess = async () => {

}

</script>
<template>
    <!-- 공정 목록 테이블 영역 -->
    <div class="card mt-6">
        <!-- 테이블 상단 -->
        <div class="grid grid-cols-1 gap-4 mb-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">{{ title ?? '작업진행' }}</div>
                </div>
            </div>
        </div>

        <!-- DataTable (PrimeVue) -->
        <DataTable 
            :value="data" 
            :dataKey="dataKey" 
            showGridlines 
            scrollable
            scrollHeight="400px" 
            tableStyle="min-width: 50rem"
            :emptyMessage="data.length === 0 ? '생산계획과 제품을 선택하면 공정 목록이 표시됩니다.' : '공정 정보가 없습니다.'">
            
            <Column field="po_name" header="공정명" style="width: 10%">
                <template #body="slotProps">
                    <span class="font-medium text-gray-800">{{ slotProps.data.po_name }}</span>
                </template>
            </Column>
            
            <Column field="proc_rate" header="진행률" style="width: 24%">
                <template #body="slotProps">
                    <!-- <ProgressBar :value="slotProps.data.proc_rate" class="w-full"></ProgressBar> -->
                    <!-- <div class="w-full bg-gray-300 rounded">
                        <div
                        class="bg-green-500 text-white text-center py-1 rounded"
                        :style="{ width: slotProps.data.proc_rate + '%' }"
                        >
                        {{ slotProps.data.proc_rate }}%
                        </div>
                    </div> -->
                    <div class="relative w-full h-6 bg-gray-300 rounded overflow-hidden">
                        <!-- 중앙 고정 텍스트 -->
                        <div class="absolute inset-0 flex items-center justify-center text-sm font-semibold text-black">
                            {{ slotProps.data.proc_rate }}%
                        </div>

                        <!-- 실제 진행 바 -->
                        <div
                            class="h-full bg-green-500"
                            :style="{ width: slotProps.data.proc_rate + '%' }"
                        ></div>
                    </div>


                </template>
            </Column>

            <Column field="eq_code" header="설비" style="width: 20%">
                <template #body="slotProps">
                    <div class="flex items-center gap-2">
                        <!-- <span class="font-medium text-gray-600" v-on:click="$router.push('//')">{{ slotProps.data.eq_code }} - {{ slotProps.data.eq_name }}</span> -->
                        <Button :label="slotProps.data.eq_code + ' ' + slotProps.data.eq_name" severity="secondary" @click="$router.push('//')" class="flex-1" />
                    </div>
                </template>
            </Column>

            <Column field="start_date" header="시작일시" style="width: 12%">
                <template #body="slotProps">
                    <span class="text-gray-600">{{ slotProps.data.start_date }}</span>
                </template>
            </Column>

            <Column field="start_date" header="종료일시" style="width: 12%">
                <template #body="slotProps">
                    <span class="text-gray-600">{{ slotProps.data.start_date }}</span>
                </template>
            </Column>

            <Column field="input_qtt" header="투입량" style="width: 7%">
                <template #body="slotProps">
                    <span class="text-gray-600">{{ slotProps.data.input_qtt.toLocaleString('ko-KR') }}</span>
                </template>
            </Column>

            <Column field="def_qtt" header="불량량" style="width: 7%">
                <template #body="slotProps">
                    <span class="text-gray-600">{{ slotProps.data.def_qtt.toLocaleString('ko-KR') }}</span>
                </template>
            </Column>

            <Column field="make_qtt" header="생산량" style="width: 7%">
                <template #body="slotProps">
                    <span class="text-gray-600">{{ slotProps.data.make_qtt.toLocaleString('ko-KR') }}</span>
                </template>
            </Column>
        </DataTable>
    </div>
</template>
<style>

</style>