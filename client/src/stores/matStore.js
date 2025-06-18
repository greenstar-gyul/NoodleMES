/*
stores/matStore.js
자재입고
*/

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useMatStore = defineStore('matStore', () => {
  const matRows = ref([]);
  const selectedMat = ref([]);

  // 목록 데이터 저장
  function setMatRows(data) {
    matRows.value = data;
  };
  // 선택상태
  function setSelectedMat(list){
    selectedMat.value = list;
  };
  // 목록을 초기상태로 되돌림
  function resetMatRows() {
    matRows.value = [];
    selectedMat.value = [];
    // console.log('리셋 확인');
  };
  
  return {
    matRows,
    selectedMat,
    setMatRows,
    setSelectedMat,
    resetMatRows,
  }
}
// , {
//   persist: true // localStorage 기본 사용
// }
)
