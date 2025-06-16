<script setup>
import { ref, defineExpose, computed, watch } from 'vue'
import axios from 'axios'
import moment from 'moment'
import Button from 'primevue/button'
import LabeledCheckbox from '@/components/common/LabeledCheckbox.vue'
import LabeledInput from '@/components/common/LabeledInput.vue'
import LabeledInputIcon from '@/components/common/LabeledInputIcon.vue'
import LabeledDropdown from '@/components/common/LabeledDropdown.vue'
import LabeledDateTimePicker from '@/components/common/LabeledDateTimePicker.vue'
import LabeledTextarea from '@/components/common/LabeledTextarea.vue'
import SinglePopup from '@/components/popup/SinglePopup.vue'
import productMapping from '../../../service/ProductMapping'

const emit = defineEmits(['register', 'product-selected'])

// 옵션 정의
const lineTypeOptions = [
  { label: '봉지라면', value: 's1' },
  { label: '컵라면', value: 's2' },
  { label: '제품전용', value: 's3' }
]
const deptOptions = [
  { label: '생산팀', value: 'DEPT-2' },
]

// 📦 팝업 제어 및 제품 목록
const prodVisible = ref(false)
const products = ref([])

// 📦 제품코드 값
const prod_code = ref('')

const today = moment().format('YYYY-MM-DD HH:mm')

// 폼 상태값
const line_code = ref('')
const line_name = ref('')
const line_type = ref('')
const is_used = ref('f2') // 기본값: 사용함
const regdate_t = ref(today)
const note = ref('')
const mdept_code = ref('')

// ✅ 사용안함 체크박스용 computed
const isUsedChecked = computed({
  get: () => is_used.value === 'f1',
  set: (val) => {
    is_used.value = val ? 'f1' : 'f2'
  }
})

// ✅ 외부에서 set할 수 있게
const setFormData = (data) => {
  line_code.value = data.line_code ?? ''
  line_name.value = data.line_name ?? ''
  line_type.value = data.line_type ?? ''
  is_used.value = data.is_used ?? 'f2'
  regdate_t.value = data.regdate_t ?? today
  note.value = data.note ?? ''
  mdept_code.value = data.mdept_code ?? ''
  prod_code.value = data.prod_code ?? ''
}

// ✅ 외부에서 get할 수 있게
const getFormData = () => ({
  line_code: line_code.value,
  line_name: line_name.value,
  line_type: line_type.value,
  is_used: is_used.value,
  regdate_t: regdate_t.value,
  note: note.value,
  mdept_code: mdept_code.value,
  prod_code: prod_code.value
})

// ✅ 리셋
const resetForm = () => {
  line_code.value = ''
  line_name.value = ''
  line_type.value = ''
  is_used.value = 'f2'
  regdate_t.value = today
  note.value = ''
  mdept_code.value = ''
  prod_code.value = ''
}

defineExpose({ setFormData, getFormData, resetForm })

// 👉 제품 목록 조회 (팝업 열릴 때)
watch(prodVisible, async (visible) => {
  if (visible) {
    try {
      const response = await axios.get('/api/line/product')
      products.value = response.data
    } catch (error) {
      console.error('❌ 제품 목록 조회 실패:', error)
    }
  }
})

// 👉 제품전용일 때만 팝업 열기
const handleProductClick = () => {
  if (line_type.value === 's3') {
    prodVisible.value = true
  } else {
    alert('제품전용 라인에서만 제품코드를 선택할 수 있습니다.')
  }
}

// 👉 팝업에서 제품 선택 시
const handleOrderConfirm = (selected) => {
  console.log('✅ 선택된 제품:', selected); // ✅ 확인용 로그
  prod_code.value = selected.prod_code;
  prodVisible.value = false;

  emit('product-selected', selected); // 부모로 emit
};


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

    <!-- 라인코드 / 라인명 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <LabeledInput v-model="line_code" label="라인코드" placeholder="라인코드" :disabled="true" />
      <LabeledInput v-model="line_name" label="라인명" placeholder="라인명" />
    </div>

    <!-- 라인유형 / 제품코드 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <LabeledDropdown v-model="line_type" label="라인유형" :options="lineTypeOptions" />
      <LabeledInputIcon v-model="prod_code" label="제품코드" placeholder="검색" @click="handleProductClick" />
    </div>

    <!-- 담당부서 / 등록일시 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <LabeledDropdown v-model="mdept_code" label="담당부서" :options="deptOptions" />
      <LabeledDateTimePicker v-model="regdate_t" label="등록일시" :disabled="true" />
    </div>

    <!-- 사용여부 / 비고 -->
    <LabeledCheckbox label="사용안함" v-model="isUsedChecked" />
    <LabeledTextarea v-model="note" label="비고" placeholder="특이사항 입력" :rows="4" :autoResize="true" />

    <!-- 제품 목록 선택 팝업 -->
    <SinglePopup
      v-model:visible="prodVisible"
      :items="products"
      :mapper="productMapping"
      :dataKey="'prod_code'"
      placeholder="제품명 또는 제품코드 검색"
      @confirm="handleOrderConfirm"
    />
  </div>
</template>
