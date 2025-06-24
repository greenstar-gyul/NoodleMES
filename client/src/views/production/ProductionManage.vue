
<script setup>
import { ref } from 'vue';
import axios from 'axios';
import ProductionTopzone from './production-manage-sub/Production-topzone.vue';
import ProductionBottomzone from './production-manage-sub/Production-bottomzone.vue';

const prdp_code = ref('');      // 선택된 생산계획 코드
const topRef = ref(null);       // 상단 컴포넌트 ref
const bottomRef = ref(null);    // 하단 컴포넌트 ref

// 상단 컴포넌트에서 생산계획 코드 선택 시 호출
const loadPlaned = (planCode) => {
  prdp_code.value = planCode;
};

// 초기화 시 상단, 하단 컴포넌트 모두 초기화
const handleReset = () => {
  topRef.value?.resetForm();    // 상단 컴포넌트의 resetForm 메서드 호출
  bottomRef.value?.resetAll();  // 하단 컴포넌트 resetAll (하단에서 구현되어야 함)
};

// 저장 버튼 클릭 시 처리
const handleSave = async () => {
  try {
    const production = topRef.value?.getFormData();
    const details = bottomRef.value?.getDetails();

    const payload = {
      prdpData: production,
      detailData: details
    };

    const response = await axios.post('/api/prdp/register', payload);

    if (response.data.success || response.status === 200) {
      alert('등록 완료되었습니다!');
      handleReset(); // 등록 후 초기화
    } else {
      alert('등록 실패: 서버 응답 오류');
    }
  } catch (error) {
    alert('등록 중 오류 발생');
  }
};

</script>
<template>
  <!-- 상단 영역: 생산계획 조회 및 초기화 등을 담당하는 컴포넌트 -->
  <ProductionTopzone
    @load-planed="loadPlaned"
    @reset="handleReset"
    @save="handleSave"
    ref="topRef"
  />

  <!-- 하단 영역: 제품 및 생산라인 입력을 담당하는 컴포넌트 -->
  <ProductionBottomzone :prdp="prdp_code" ref="bottomRef" />
</template>
