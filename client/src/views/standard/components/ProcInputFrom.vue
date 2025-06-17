<script setup>
import { ref, watch, defineExpose, computed } from 'vue'
import axios from 'axios';
import moment from 'moment'
import Button from 'primevue/button'
import LabeledInput from '@/components/common/LabeledInput.vue'
import LabeledInputIcon from '@/components/common/LabeledInputIcon.vue'
import LabeledDropdown from '@/components/common/LabeledDropdown.vue'
import LabeledDatePicker from '@/components/common/LabeledDatePicker.vue'
import LabeledTextarea from '@/components/common/LabeledTextarea.vue'
import SinglePopup from '@/components/popup/SinglePopup.vue'
import productMapping from '../../../service/ProductMapping'

// 옵션 정의
const poOptions = [
  { label: '정형', value: 'p2' },
]


// 📦 팝업 제어 및 제품 목록
const prodVisible = ref(false)
const products = ref([])


const today = moment().format('YYYY-MM-DD')

// 폼 상태값
const prod_proc_code = ref('')
const po_name = ref('')
const prod_code = ref(null)
const prod_name = ref(null)
const po_type = ref('')
const reg = ref('EMP-10001')
const reg_date = ref(today)
const note = ref('')

// ✅ 외부에서 set할 수 있게
const setFormData = (data) => {
  if (!data) return;

  prod_proc_code.value = data.prod_proc_code ?? ''
  po_name.value = data.po_name ?? ''
  prod_code.value = data.prod_code ?? null
  prod_name.value = data.prod_name ?? null
  po_type.value = data.po_type ?? 'p2'
  reg.value = data.reg ?? ''
  reg_date.value = data.reg_date ?? ''
  note.value = data.note ?? ''
}

// ✅ 외부에서 get할 수 있게
const getFormData = () => ({
  prod_proc_code: prod_proc_code.value,
  po_name: po_name.value,
  prod_code: prod_code.value,
  prod_name: prod_name.value,
  po_type: po_type.value,
  reg: reg.value,
  reg_date: reg_date.value,
  note: note.value
})

// 리셋 부분
const resetForm = () => {
  prod_proc_code.value = ''
  po_name.value = ''
  prod_code.value = null
  prod_name.value = null
  po_type.value = 'p2'
  reg.value = 'EMP-1001'
  reg_date.value = today
  note.value = ''
}

// 👉 제품 목록 조회 (팝업 열릴 때)
watch(prodVisible, async (visible) => {
  if (visible) {
    try {
      const response = await axios.get('/api/proc/product')
      products.value = response.data
    } catch (error) {
      console.error('❌ 제품 목록 조회 실패:', error)
    }
  }
})

// 제품코드 클릭시 오픈 함수
const handleProductClick = () => {
  prodVisible.value = true;
};

// 팝업 확인시 데이터 넣는 부분
const handleOrderConfirm = (selected) => {
  prod_code.value = selected.prod_code;
  prod_name.value = selected.prod_name;
  prodVisible.value = false;
};

defineExpose({ setFormData, getFormData, resetForm  })
</script>

<template>
  <div class="card space-y-4 p-6" style="width: 40%; height: 63vh">
    <!-- 타이틀 + 버튼 -->
    <div class="grid grid-cols-1 gap-4 mb-4">
      <div class="flex justify-between">
        <div class="font-semibold text-2xl">기준 정보</div>
        <div class="flex items-center gap-2">
          <Button label="수정" severity="info" outlined />
          <Button label="등록" severity="success" @click="$emit('register')" outlined />
        </div>
      </div>
    </div>

    <!-- 제품공정흐름도코드 / 제품흐름도명 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <LabeledInput v-model="prod_proc_code" label="제품공정흐름도코드" placeholder="제품코드" :disabled="true" />
      <LabeledInput v-model="po_name" label="제품흐름도명"/>
    </div>

    <!-- 제품코드 / 제품명 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <LabeledInputIcon v-model="prod_code" label="제품코드" placeholder="검색" @click="handleProductClick" />
      <LabeledInput v-model="prod_name" label="제품명" :disabled="true" />
    </div>

    <!-- 규격 / 등록자 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <LabeledDropdown v-model="po_type" label="공정분류" :options="poOptions" />
      <LabeledInput v-model="reg" label="등록자" :disabled="true" />
    </div>

    <!-- 총중량 / 유통기한 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <LabeledDatePicker v-model="reg_date" label="등록일자" placeholder="자동으로 입력" :disabled="true" />
    </div>

    <!-- 비고 -->
    <LabeledTextarea v-model="note" label="비고" placeholder="특이사항 입력" :rows="3" :autoResize="true" />
    <!-- 제품 목록 선택 팝업 -->
    <SinglePopup v-model:visible="prodVisible" :items="products" :mapper="productMapping" :dataKey="'prod_code'"
        placeholder="제품명 또는 제품코드 검색" @confirm="handleOrderConfirm" />
  </div>
</template>
