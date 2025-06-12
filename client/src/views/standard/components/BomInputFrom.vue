<script setup>
import { ref, watch, defineExpose } from 'vue'
import Button from 'primevue/button'
import LabeledCheckbox from '@/components/common/LabeledCheckbox.vue'
import LabeledInput from '@/components/common/LabeledInput.vue'
import LabeledDropdown from '@/components/common/LabeledDropdown.vue'
import LabeledDatePicker from '@/components/common/LabeledDatePicker.vue'
import LabeledTextarea from '@/components/common/LabeledTextarea.vue'

// 옵션 정의
const productTypeOptions = [
  { label: '반제품', value: '반제품' },
  { label: '완제품', value: '완제품' }
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
const prod_weight = ref('')
const is_used = ref(false)
const edate = ref('')
const regdate = ref(today)
const note = ref('')

// ✅ 자동 옵션 조정
watch([prod_type, com_value], ([type, value]) => {
  if (type === '반제품') {
    specOptions.value = [{ label: '-', value: '-' }]
    unitOptions.value = [{ label: 'EA', value: 'EA' }]
    spec.value = '-'
    unit.value = 'EA'
  } else if (type === '완제품') {
    unit.value = 'BOX'
    unitOptions.value = [{ label: 'BOX', value: 'BOX' }]

    if (value === 'J1') { // 봉지라면
      specOptions.value = [
        { label: '40', value: '40' },
        { label: '20', value: '20' }
      ]
      spec.value = '20'
    } else if (value === 'J2') { // 컵라면(대)
      specOptions.value = [
        { label: '16', value: '16' },
        { label: '8', value: '8' }
      ]
      spec.value = '16'
    } else if (value === 'J3') { // 컵라면(소)
      specOptions.value = [
        { label: '12', value: '12' },
        { label: '6', value: '6' }
      ]
      spec.value = '12'
    } else {
      specOptions.value = []
    }
  }
})

// ✅ 외부에서 set할 수 있게
const setFormData = (data) => {
  prod_code.value = data.prod_code ?? ''
  prod_name.value = data.prod_name ?? ''
  prod_type.value = data.prod_type ?? ''
  com_value.value = data.com_value ?? ''
  unit.value = data.unit ?? ''
  spec.value = data.spec ?? ''
  prod_weight.value = data.prod_weight ?? ''
  is_used.value = data.is_used === 'Y'
  edate.value = data.edate ?? ''
  regdate.value = data.regdate ?? ''
  note.value = data.note ?? ''
}

// ✅ 외부에서 get할 수 있게
const getFormData = () => ({
  prod_code: prod_code.value,
  prod_name: prod_name.value,
  prod_type: prod_type.value,
  com_value: com_value.value,
  unit: unit.value,
  spec: spec.value,
  prod_weight: prod_weight.value,
  is_used: is_used.value ? 'Y' : 'N',
  edate: edate.value,
  regdate: regdate.value,
  note: note.value
})

defineExpose({ setFormData, getFormData })
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
      <LabeledInput v-model="prod_weight" label="총중량" />
      <LabeledInput v-model="edate" label="유통기한" />
    </div>

    <!-- 등록일자 / 사용여부 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <LabeledDatePicker v-model="regdate" label="등록일자" placeholder="자동으로 입력" :disabled="true" />
      <LabeledCheckbox label="사용안함" v-model="is_used" />
    </div>

    <!-- 비고 -->
    <LabeledTextarea v-model="note" label="비고" placeholder="특이사항 입력" :rows="3" :autoResize="true" />
  </div>
</template>
