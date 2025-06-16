<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import {} from '@/stores/mprStore';
import Button from 'primevue/button';
import SearchText from '@/components/search-bar/SearchText.vue';
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue';

import MprData from '@/service/MprData.js';
import LabeledInput from '../../../components/registration-bar/LabeledInput.vue';

// 상위에서 전달받은 props
const mprs = defineProps({
  mpr_code: { type: Object, required: true },
  reqdate: { type: Object, required: true },
  deadline: { type: Object, required: true },
  mrp_code: { type: Object, required: true },
  mcode: { type: Object, required: true },
});

// pinia
const mprStore = useMprStore();

// 상태는 반응형으로 가져오기
const { mprRows } = storeToRefs(mprStore);
// 함수는 그대로 가져오기
const { setMprRows, resetMprRows, setSelectedMpr } = mprStore;




//초기화
const handleReset = () => {
    // mpr 기본정보 초기화
    mprs.mpr_code.value = '';
    mprs.reqdate.value = '';
    mprs.deadline.value = '';
    mprs.mrp_code.value = '';
    mprs.mcode.value = null;

    // 제품 목록 초기화, store 함수 사용
    resetMprRows();
    console.log('mpr 기본정보 초기화 완료');
};


//삭제
const handleDelete = async () => {
    if (!mprs.mpr_code.value) {
        alert('mpr 정보가 없습니다. 다시 확인해주세요');
        return;
    }

    const confirmed = confirm('정말로 mpr 정보를 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      await axios.delete(`/api/order/${mprs.ordCode.value}`);
      handleReset(); // 초기화 함수 호출
      alert('mpr 정보가 삭제되었습니다.');
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
};

</script>

<template>
  <!-- 헤더 영역 -->
  <!-- 조회/초기화 버튼
  <div class="flex justify-center gap-3 mt-4">
    <Button label="초기화" severity="contrast" @click="resetSearch" />
    <Button label="조회" severity="info" @click="fetchOrders" />
  </div>
  -->
  
  <!-- 검색바 영역 -->
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <div class="flex justify-between">
        <div>
            <div class="font-semibold text-2xl">기본정보</div>
        </div>
        <div class="flex items-center gap-2 flex-nowrap">
            <Button label="삭제" severity="danger" class="min-w-fit" @click="handleDelete" />
            <Button label="초기화" severity="contrast" class="min-w-fit" @click="handleReset" />
            <Button label="저장" severity="info" class="min-w-fit" @click="handleSave" />
            <Button
                label="주문정보 불러오기"
                severity="success"
                class="min-w-fit whitespace-nowrap"
                @click="orderPopupVisible = true"
            />
        </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      <!-- 구매요청코드 -->
      <LabeledInput label="요청코드" placeholder="readonly로 변경 예정"/>
      
      <!-- 요청일자 -->
      <LabeledInput label="요청일자" placeholder="요청자입력"/>

      <!-- 납기일자 -->
      <LabeledInput label="납기일자" placeholder="납기일자입력"/>

      <!-- MRP 계획번호 -->
      <LabeledInput label="MRP 계획번호" placeholder="MRP 계획번호 입력"/>

      <!-- 요청자 -->
      <LabeledInput label="요청자" placeholder="readonly로 변경 예정"/>
    </div>
  </div>
</template>