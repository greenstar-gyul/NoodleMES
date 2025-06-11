<script setup>
import { ref, defineEmits } from 'vue';
import TableWDE from '@/components/form/TableWithDelExcel.vue';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import bomMapper from '@/service/BOMMapping.js';
import matMapping from '@/service/MatMapping.js';


const emit = defineEmits(['update:productRows']);

// 제품 리스트
const products = ref([
  { prod_code: 'WH001', prod_name: '신라면', edate: '150일', regdate: '2025.06.06', is_used: '활성' },
  { prod_code: 'WH002', prod_name: '짜파게티', edate: '150일', regdate: '2025.06.07', is_used: '활성' },
  { prod_code: 'WH003', prod_name: '진진라면', edate: '150일', regdate: '2025.06.01', is_used: '비활성' }
]);

// 하위 자재 테이블
const productRows = ref([]);
const selectedProducts = ref([]);
const matPopupVisible = ref(false);
const currentEditingRow = ref(null);

// 자재 목록 및 옵션
const matList = ref([
  { mat_code: 'MAT001', mat_name: '밀가루',  mat_type: '원자재' },
  { mat_code: 'MAT003', mat_name: '고춧가루',  mat_type: '원자재' },
  { mat_code: 'MAT005', mat_name: '표고버섯',  mat_type: '원자재' },
  { mat_code: 'MAT100', mat_name: '비닐포장지',  mat_type: '부자재' },
  { mat_code: 'MAT101', mat_name: '박스',  mat_type: '부자재' }
]);

const matTypeOptions = ref([
  { label: '원자재', value: '원자재' },
  { label: '부자재', value: '부자재' }
]);

// 행 추가
const addRow = () => {
  productRows.value.push({
    id: Date.now(),
    mat_code: '',
    mat_name: '',
    mat_type: '',
    req_qtt: 0,
    unit: '',
    loss_rate: 0
  });
};

// 선택 삭제
const deleteSelected = () => {
  productRows.value = productRows.value.filter(row => !selectedProducts.value.includes(row));
  selectedProducts.value = [];
};

// 팝업 열기
const openMatPopup = (row) => {
  currentEditingRow.value = row;
  matPopupVisible.value = true;
};

// 팝업 확인 후 값 반영
const handleProductConfirm = (selectedItem) => {
  if (!currentEditingRow.value || !selectedItem) return;

  currentEditingRow.value.mat_code = selectedItem.mat_code;
  currentEditingRow.value.mat_name = selectedItem.mat_name;
  currentEditingRow.value.mat_type = selectedItem.mat_type;

  matPopupVisible.value = false;
};
</script>

<template>
  <div class="space-y-4" style="width: 60%">
    <TableWDE :data="products" :dataKey="'prod_code'" :mapper="bomMapper" title="검색결과" />

    <div class="card flex flex-col gap-4">
      <div class="flex justify-between">
        <div class="font-semibold text-2xl">제품</div>
        <div class="flex justify-end gap-2">
          <Button label="선택 삭제" icon="pi pi-trash" severity="danger" @click="deleteSelected" />
          <Button label="행 추가" icon="pi pi-plus" @click="addRow" />
        </div>
      </div>

      <DataTable v-model:selection="selectedProducts" :value="productRows" scrollable scrollHeight="250px" showGridlines
          dataKey="id" class="w-full">
          <!-- 체크박스 -->
          <Column selectionMode="multiple" headerStyle="width: 48px" />

          <!-- 자재코드 -->
          <Column field="mat_code" header="자재코드" style="width: 150px">
              <template #body="slotProps">
                  <div class="flex gap-2">
                      <InputText v-model="slotProps.data.mat_code" readonly style="width: 100%" />
                      <Button icon="pi pi-search" @click="() => openMatPopup(slotProps.data)"
                          style="width: 32px; min-width: 32px;" />
                  </div>
              </template>
          </Column>

          <!-- 자재명 -->
          <Column field="mat_name" header="자재명" style="width: 160px">
              <template #body="slotProps">
                  <InputText v-model="slotProps.data.mat_name" style="width: 100%" :disabled="true"/>
              </template>
          </Column>

          <!-- 자재유형 -->
          <Column field="mat_type" header="자재유형" style="width: 130px">
              <template #body="slotProps">
                  <InputText v-model="slotProps.data.mat_type" style="width: 100%" :disabled="true"/>
              </template>
          </Column>

          <!-- 소요수량 -->
          <Column field="req_qtt" header="소요수량" style="width: 100px">
              <template #body="slotProps">
                  <InputNumber v-model="slotProps.data.req_qtt" :min="0" inputStyle="width: 100%" showButtons/>
              </template>
          </Column>

          <!-- 단위 -->
          <Column field="unit" header="단위" style="width: 100px">
              <template #body="slotProps">
                  <InputText v-model="slotProps.data.unit" style="width: 100%" />
              </template>
          </Column>

          <!-- 손실율(%) -->
          <Column field="loss_rate" header="손실율(%)" style="width: 120px">
              <template #body="slotProps">
                  <InputNumber v-model="slotProps.data.loss_rate" :min="0" inputStyle="width: 100%" />
              </template>
          </Column>
      </DataTable>
    </div>
  </div>

  <SinglePopup
    v-model:visible="matPopupVisible"
    :items="matList"
    :dataKey="'mat_code'"
    :mapper="matMapping"
    @confirm="handleProductConfirm"
    placeholder="자재코드 또는 자재명 또는 자재유형 검색"
  />
</template>
