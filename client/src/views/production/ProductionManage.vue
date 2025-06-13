
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
  console.log(`조회된 계획 코드: ${planCode}`);
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
    // 상단 컴포넌트에서 production 데이터 가져오기
    const production = topRef.value?.getFormData();

    // 하단 컴포넌트에서 상세 데이터 가져오기 (하단 컴포넌트에 getDetails 메서드 구현 필요)
    const details = bottomRef.value?.getDetails();

    console.log('저장할 production:', production);
    console.log('저장할 details:', details);

    const prdpCode = production.prdp_code;
    const method = prdpCode ? 'put' : 'post';
    const url = prdpCode ? `/api/prdp/${prdpCode}` : '/api/prdp';

    const response = await axios({
      method,
      url,
      data: { production, details }
    });

    if (response.data.success) {
      alert('저장 성공!');
    } else {
      alert('저장 실패: 서버에서 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error('저장 실패:', error);
    alert('저장 중 오류가 발생했습니다.');
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
