<script setup>
  import { ref, watch } from 'vue';
  import axios from 'axios';
  import Button from 'primevue/button';
  import LabeledInput from '@/components/registration-bar/LabeledInput.vue';
  import LabeledDatePicker from '@/components/registration-bar/LabeledDatePicker.vue';
  import LabeledTextarea from '@/components/registration-bar/LabeledTextarea.vue';
  import productionMapping from '@/service/ProductionMapping';
  import SinglePopup from '@/components/popup/SinglePopup.vue';


  // 부모 컴포넌트에 이벤트 전송을 위한 emit 정의
  const emit = defineEmits(['load-planed', 'reset']);

  // 오늘 날짜를 기본값으로 설정 (ISO 포맷 → 'YYYY-MM-DD')
  const today = new Date().toISOString().slice(0, 10);

  // 📌 폼 데이터 (생산계획 정보)
  const prdp_code = ref('');     // 생산계획코드
  const prdp_name = ref('');     // 계획명
  const prdp_date = ref(today);  // 계획일자 (기본값: 오늘)
  const due_date = ref('');      // 납기일자
  const reg = ref('');           // 작성자
  const note = ref('');          // 비고
  const start_date = ref('');    // 계획시작일
  const end_date = ref('');      // 계획종료일

  // 📦 팝업 제어 변수
  const dialogVisible = ref(false);  // 팝업 열림 여부
  const products = ref([]);          // 팝업에서 보여줄 생산계획 리스트

  // 🔍 팝업이 열릴 때 데이터 조회
  watch(dialogVisible, async (visible) => {
  if (visible) {
    try {
      const response = await axios.get('/api/prdp/all');

      products.value = response.data.map(item => ({
        prdp_code: item.prdp_code,
        prdp_name: item.prdp_name,
        prdp_date: item.prdp_date,
        start_date: item.start_date,
        end_date: item.end_date,
        due_date: item.due_date,
        note: item.note,
        reg: item.reg,
        // ✅ 이미 선택된 코드와 같다면 비활성화 처리
        disabled: item.prdp_code === prdp_code.value
      }));
    } catch (error) {
      console.error('생산계획 목록 조회 실패:', error);
    }
  }
});

  // ✅ 팝업에서 항목 선택 시 해당 데이터를 입력폼에 바인딩
  const handleConfirm = async (selectedItem) => {
    prdp_code.value = selectedItem.prdp_code;
    prdp_name.value = selectedItem.prdp_name;
    prdp_date.value = selectedItem.prdp_date;
    reg.value = selectedItem.reg;
    start_date.value = selectedItem.start_date;
    end_date.value = selectedItem.end_date;
    due_date.value = selectedItem.due_date;
    note.value = selectedItem.note;

    // 부모에게 선택된 생산계획 코드 전달
    emit('load-planed', selectedItem.prdp_code);
  };

  // 🔄 초기화 버튼 클릭 시 실행
  const resetForm = () => {
    prdp_code.value = '';
    prdp_name.value = '';
    prdp_date.value = today;
    due_date.value = '';
    reg.value = '';
    note.value = '';
    start_date.value = '';
    end_date.value = '';
    emit('reset');  // 부모 컴포넌트에도 초기화 알림
  };
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
          <Button label="저장" severity="info" class="min-w-fit" @click=""/>
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