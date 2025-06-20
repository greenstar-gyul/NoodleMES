/*
stores/minStore.js
자재입고
*/

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useMinStore = defineStore('minStore', () => {
  const minRows = ref([]);
  const selectedMin = ref([]);

  // 목록 데이터 저장
  function setMinRows(data) {
    minRows.value = data;
  };
  // 선택상태
  function setSelectedMin(list){
    selectedMin.value = list;
  };
  // 목록을 초기상태로 되돌림
  function resetMinRows() {
    minRows.value = [];
    selectedMin.value = [];
    // console.log('리셋 확인');
  };
  
  return {
    minRows,
    selectedMin,
    setMinRows,
    setSelectedMin,
    resetMinRows,
  }
}
// , {
//   persist: true // localStorage 기본 사용
// }
)
