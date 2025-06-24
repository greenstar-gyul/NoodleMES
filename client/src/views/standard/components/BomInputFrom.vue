<script setup>
import { ref, watch, defineExpose, computed } from 'vue'
import Button from 'primevue/button'
import LabeledCheckbox from '@/components/common/LabeledCheckbox.vue'
import LabeledInput from '@/components/common/LabeledInput.vue'
import LabeledDropdown from '@/components/common/LabeledDropdown.vue'
import LabeledDatePicker from '@/components/common/LabeledDatePicker.vue'
import LabeledTextarea from '@/components/common/LabeledTextarea.vue'

// 옵션 정의
const productTypeOptions = [
  { label: '완제품', value: 'i1' },
  { label: '반제품', value: 'i2' }
]

const comValueOptions = [
  { label: '봉지라면', value: 'J1' },
  { label: '컵라면(대)', value: 'J2' },
  { label: '컵라면(소)', value: 'J3' }
];



const unitOptions = ref([])
const specOptions = ref([])

const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

// 폼 상태값
const prod_code = ref('')
const prod_name = ref('')
const prod_type = ref('')
const com_value = ref('')
const unit = ref('')
const spec = ref('')
const is_used = ref('f2') // 기본값: 사용함
const edate = ref('')
const regdate = ref(today)
const note = ref('')

// 사용안함 체크박스용 computed
const isUsedChecked = computed({
  get: () => is_used.value === 'f1',       // 체크되면 사용안함(f1)
  set: (val) => {
    is_used.value = val ? 'f1' : 'f2'      // true → f1, false → f2
  }
})

// 자동 옵션 조정
watch([prod_type, com_value], ([type, value]) => {
  if (type === 'i2') {
    unitOptions.value = [{ label: 'EA', value: 'h4' }]
    unit.value = 'h4'

    if (value === 'J1') {
      specOptions.value = [{ label: '120g', value: 'z1' }]
      spec.value = 'z1'
    } else if (value === 'J2') {
      specOptions.value = [{ label: '110g', value: 'z2' }]
      spec.value = 'z2'
    } else if (value === 'J3') {
      specOptions.value = [{ label: '65g', value: 'z3' }]
      spec.value = 'z3'
    } else {
      specOptions.value = []
      spec.value = ''
    }

  } else if (type === 'i1') {
    unit.value = 'h5'
    unitOptions.value = [{ label: 'BOX', value: 'h5' }]

    if (value === 'J1') { // 봉지라면
      specOptions.value = [
        { label: '20', value: 'o1' },
        { label: '40', value: 'o2' }
      ]
      spec.value = 'o1'
    } else if (value === 'J2') { // 컵라면(대)
      specOptions.value = [
        { label: '16', value: 'x1' },
        { label: '8', value: 'x2' }
      ]
      spec.value = 'x1'
    } else if (value === 'J3') { // 컵라면(소)
      specOptions.value = [
        { label: '12', value: 'y1' },
        { label: '6', value: 'y2' }
      ]
      spec.value = 'y1'
    } else {
      specOptions.value = []
      spec.value = ''
    }
  }
})



// 외부에서 set할 수 있게
const setFormData = (data) => {
  prod_code.value = data.prod_code ?? ''
  prod_name.value = data.prod_name ?? ''
  prod_type.value = data.prod_type ?? ''
  com_value.value = data.com_value ?? ''
  unit.value = data.unit ?? ''
  spec.value = data.spec ?? ''
  is_used.value = data.is_used ?? 'f2'
  edate.value = data.edate ?? ''
  regdate.value = data.regdate ?? ''
  note.value = data.note ?? ''
}

// 외부에서 get할 수 있게
const getFormData = () => ({
  prod_code: prod_code.value,
  prod_name: prod_name.value,
  prod_type: prod_type.value,
  com_value: com_value.value,
  unit: unit.value,
  spec: spec.value,
  is_used: is_used.value,
  edate: edate.value,
  regdate: regdate.value,
  note: note.value
})

// 리셋 부분
const resetForm = () => {
  prod_code.value = ''
  prod_name.value = ''
  prod_type.value = ''
  com_value.value = ''
  unit.value = ''
  spec.value = ''
  is_used.value = 'f2'
  edate.value = ''
  regdate.value = today
  note.value = ''
}

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

    <!-- 제품코드 / 제품명 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <LabeledInput v-model="prod_code" label="제품코드" placeholder="제품코드" :disabled="true" />
      <LabeledInput v-model="prod_name" label="제품명" placeholder="제품명" />
    </div>

    <!-- 제품구분 / 제품유형 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <LabeledDropdown v-model="prod_type" label="제품구분" :options="productTypeOptions" />
      <LabeledDropdown v-model="com_value" label="제품유형" :options="comValueOptions" />
    </div>

    <!-- 규격 / 단위 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <LabeledDropdown v-model="spec" label="규격" :options="specOptions" />
      <LabeledDropdown v-model="unit" label="단위" :options="unitOptions" />
    </div>

    <!-- 총중량 / 유통기한 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <LabeledInput v-model="edate" label="유통기한(일)" />
      <LabeledDatePicker v-model="regdate" label="등록일자" placeholder="자동으로 입력" :disabled="true" />
    </div>

    <!-- 등록일자 / 사용여부 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <LabeledCheckbox label="사용안함" v-model="isUsedChecked" />
    </div>

    <!-- 비고 -->
    <LabeledTextarea v-model="note" label="비고" placeholder="특이사항 입력" :rows="3" :autoResize="true" />
  </div>
</template>
