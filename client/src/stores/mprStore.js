/*
stores/mprStore.js
자재구매요청관리
*/

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useMprStore = defineStore('mprStore', () => {
  const mprRows = ref([]);
  const selectedMpr = ref([]);

  // 목록 데이터 저장
  function setMprRows(data) {
    productRows.value = data;
  };

  // 목록을 초기상태로 되돌림
  function resetMprRows() {
    productRows.value = [];
  };

  // 선택한 목록을 저장
  function setSelectedMpr(list){
    selectedProducts.value = list;
  };

  return {
    mprRows,
    selectedMpr,
    setMprRows,
    resetMprRows,
    setSelectedMpr
  }
}
// , {
//   persist: true // localStorage 기본 사용
// }
)
