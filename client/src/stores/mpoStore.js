/*
stores/mpoStore.js
발주서
*/

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useMpoStore = defineStore('mpoStore', () => {
  const mpoRows = ref([]);
  const selectedMpo = ref([]);

  // 목록 데이터 저장
  function setMpoRows(data) {
    mpoRows.value = data;
  };
  // 선택상태
  function setSelectedMpo(list){
    selectedMpo.value = list;
  };  
  // 목록을 초기상태로 되돌림
  function resetMpoRows() {
    mpoRows.value = [];
    selectedMpo.value = [];
    // console.log('리셋 확인');
  };
  
  return {
    mpoRows,
    selectedMpo,
    setMpoRows,
    setSelectedMpo,
    resetMpoRows,
  }
}
// , {
//   persist: true // localStorage 기본 사용
// }
)
