<script setup>
import { ref, watch, defineExpose } from 'vue';
import axios from 'axios';
import Button from 'primevue/button';
import LabeledInput from '@/components/registration-bar/LabeledInput.vue';
import LabeledDatePicker from '@/components/registration-bar/LabeledDatePicker.vue';
import LabeledTextarea from '@/components/registration-bar/LabeledTextarea.vue';
import productionMapping from '@/service/ProductionMapping';
import SinglePopup from '@/components/popup/SinglePopup.vue';


// 이벤트 정의
const emit = defineEmits(['load-planed']);

// 오늘 날짜
const today = new Date().toISOString().slice(0, 10);

// ✅ ref 기반 폼 항목 정의
const prdp_code = ref('');
const prdp_name = ref('');
const prdp_date = ref(today);
const due_date = ref('');
const reg = ref('권민준');
const note = ref('');
const start_date = ref('');
const end_date = ref('');

// 📦 팝업 제어 및 리스트
const dialogVisible = ref(false);
const products = ref([]);

// 팝업 열릴 때 생산계획 목록 조회
watch(dialogVisible, async (visible) => {
  if (visible) {
    try {
      const response = await axios.get('/api/prdp/all');
      products.value = response.data.map(item => ({
        ...item,
        disabled: item.prdp_code === prdp_code.value
      }));
    } catch (error) {
      console.error('생산계획 목록 조회 실패:', error);
    }
  }
});

// ✅ 팝업에서 선택 시 입력 필드에 반영
const handleConfirm = (selectedItem) => {
  prdp_code.value = selectedItem.prdp_code;
  prdp_name.value = selectedItem.prdp_name;
  prdp_date.value = selectedItem.prdp_date;
  due_date.value = selectedItem.due_date;
  reg.value = selectedItem.reg;
  note.value = selectedItem.note;
  start_date.value = selectedItem.start_date;
  end_date.value = selectedItem.end_date;

  emit('load-planed', prdp_code.value);
};

// 🔄 초기화
const resetForm = () => {
  prdp_code.value = '';
  prdp_name.value = '';
  prdp_date.value = today;
  due_date.value = '';
  reg.value = '';
  note.value = '';
  start_date.value = '';
  end_date.value = '';
};

// 📤 부모 컴포넌트에서 접근 가능하게 노출
defineExpose({
  resetForm,
  getFormData: () => ({
    prdp_code: prdp_code.value,
    prdp_name: prdp_name.value,
    prdp_date: prdp_date.value,
    due_date: due_date.value,
    reg: reg.value,
    note: note.value,
    start_date: start_date.value,
    end_date: end_date.value
  })
});
</script>
<template>
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <div class="grid grid-cols-1 gap-4">
      <div class="flex justify-between">
        <div>
          <div class="font-semibold text-2xl">생산계획</div>
        </div>
        <div class="flex items-center gap-2 flex-nowrap">
          <Button label="삭제" severity="danger" class="min-w-fit" />
          <Button label="초기화" severity="contrast" class="min-w-fit" @click="resetForm"/>
          <Button label="저장" severity="info" class="min-w-fit" @click="emit('save')"/>
          <Button label="생산계획 불러오기" severity="success" class="min-w-fit whitespace-nowrap"
            @click="dialogVisible = true" />
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="생산계획코드" v-model="prdp_code" placeholder="생산계획코드" :disabled="true" />
      <LabeledInput label="계획명" v-model="prdp_name" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="계획일자" v-model="prdp_date" :disabled="true" />
      <LabeledInput label="작성자" v-model="reg" placeholder="작성자명" :disabled="true" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledDatePicker label="계획시작일" v-model="start_date" />
      <LabeledDatePicker label="계획종료일" v-model="end_date" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledDatePicker label="납기일자" v-model="due_date" />
      <LabeledTextarea label="비고" v-model="note" placeholder="특이사항 입력" />
    </div>
  </div>
  <!-- 생산계획 조회 팝업 -->
  <SinglePopup v-model:visible="dialogVisible" :items="products" :mapper="productionMapping" :dataKey="'prdp_code'" placeholder="생산계획코드 또는 계획명 검색"
      @confirm="handleConfirm" />
</template>