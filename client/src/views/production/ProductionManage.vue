<template>
  <!-- 상단 영역: 생산계획 조회 및 초기화 등을 담당하는 컴포넌트 -->
  <!-- 조회된 계획(prdp_code)은 @load-planed 이벤트로 전달 -->
  <!-- 초기화 버튼 클릭 시 @reset 이벤트 발생 -->
  <ProductionTopzone 
    @load-planed="loadPlaned" 
    @reset="handleReset"
  />

  <!-- 하단 영역: 제품 및 생산라인 입력을 담당하는 컴포넌트 -->
  <!-- 상단에서 전달받은 prdp_code를 props로 전달 -->
  <!-- 하단 컴포넌트에 ref를 연결하여 메서드 접근 가능 -->
  <ProductionBottomzone 
    :prdp="prdp_code" 
    ref="bottomRef"
  />
</template>

<script setup>
// 📦 Vue의 ref API 불러오기
import { ref } from 'vue';

// 📂 상단/하단 컴포넌트 import
import ProductionTopzone from './production-manage-sub/Production-topzone.vue';
import ProductionBottomzone from './production-manage-sub/Production-bottomzone.vue';

// 🟡 상단 컴포넌트에서 선택된 생산계획 코드 (prdp_code)를 저장하는 변수
const prdp_code = ref('');

// 🔁 하단 컴포넌트를 제어하기 위한 ref (메서드 호출을 위해 사용)
const bottomRef = ref();

// ✅ 상단에서 계획을 조회했을 때 실행되는 함수
// -> 전달된 생산계획(plan)을 prdp_code에 저장하면,
//    이 값이 ProductionBottomzone으로 전달되고, 하단에서 해당 계획에 맞는 데이터가 조회됨
const loadPlaned = (plan) => {
  console.log(`조회된 계획: ${plan}`);
  prdp_code.value = plan;
};

// 🔄 상단에서 초기화 요청 시 실행되는 함수
// -> 하단 컴포넌트의 resetAll() 메서드를 호출해서 데이터 초기화
const handleReset = () => {
  bottomRef.value?.resetAll();
};
</script>
