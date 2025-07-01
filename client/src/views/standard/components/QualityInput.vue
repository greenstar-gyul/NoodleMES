<script setup>
import { ref,defineExpose } from 'vue'
import moment from 'moment'
import Button from 'primevue/button'
import LabeledInput from '@/components/common/LabeledInput.vue'
import LabeledDropdown from '@/components/common/LabeledDropdown.vue'
import LabeledDatePicker from '@/components/common/LabeledDatePicker.vue'
import LabeledTextarea from '@/components/common/LabeledTextarea.vue'

const unitOptions = [
  { label: 'mg' , value: 'hb'},
  { label: 'g' , value: 'h6'},
  { label: 'mm' , value: 'h7'},
  { label: 'cm' , value: 'h9'},
  { label: 'N' , value: 'ha'},
  { label: '%' , value: 'h8'},
]
const TypeOptions = [
  { label: '완제품' , value: 'i1'},
  { label: '부자재' , value: 'i3'},
  { label: '원자재' , value: 'i4'},
]

const checkOptions = [
  { label: '자동' , value: '자동'},
  { label: '수동' , value: '수동'},
]
const today = moment().format('YYYY-MM-DD HH:mm')

// 폼 상태값
const qcr_code = ref('')
const inspection_item = ref('')
const range_top = ref('')
const range_bot = ref('')
const unit = ref('')
const com_value = ref('')
const reg = ref('')
const regdate = ref(today)
const check_method = ref('');
const note = ref('')

// 외부에서 set할 수 있게
const setFormData = (data) => {
  qcr_code.value = data.qcr_code ?? ''
  inspection_item.value = data.inspection_item ?? ''
  range_top.value = data.range_top ?? ''
  range_bot.value = data.range_bot ?? ''
  unit.value = data.unit ?? ''
  com_value.value = data.com_value ?? ''
  reg.value = data.reg ?? ''
  regdate.value = data.regdate ?? ''
  check_method.value = data.check_method ?? ''
  note.value = data.note ?? ''
}

// 외부에서 get할 수 있게
const getFormData = () => ({
  qcr_code: qcr_code.value,
  inspection_item: inspection_item.value,
  range_top: range_top.value,
  range_bot: range_bot.value,
  unit: unit.value,
  com_value: com_value.value,
  reg: reg.value,
  regdate: regdate.value,
  check_method: check_method.value,
  note: note.value
})

// 리셋 부분
const resetForm = () => {
  qcr_code.value = ''
  inspection_item.value = ''
  range_top.value = ''
  range_bot.value = ''
  unit.value = ''
  com_value.value = ''
  reg.value = ''
  regdate.value = today
  check_method.value = ''
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

    <!-- 품질기준코드 / 제품명 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <LabeledInput v-model="qcr_code" label="품질기준코드" placeholder="품질기준코드" :disabled="true" />
      <LabeledInput v-model="inspection_item" label="검사항목명"  />
    </div>

    <!-- 제품구분 / 제품유형 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <LabeledInput v-model="range_top" label="기준값(상한)" />
      <LabeledInput v-model="range_bot" label="기준값(하한)" />
    </div>

    <!-- 규격 / 단위 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <LabeledDropdown v-model="unit" label="단위" :options="unitOptions" />
      <LabeledDropdown v-model="com_value" label="품목유형" :options="TypeOptions" />
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <LabeledDropdown v-model="check_method" label="판정방식" :options="checkOptions" />
      <LabeledDatePicker v-model="regdate" label="등록일자" placeholder="자동으로 입력" :disabled="true" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    </div>

    <!-- 비고 -->
    <LabeledTextarea v-model="note" label="비고" placeholder="특이사항 입력" :rows="4" :autoResize="true" />
  </div>
</template>
