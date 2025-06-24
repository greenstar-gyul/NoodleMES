/*
stores/moutStore.js
자재출고
*/

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useMoutStore = defineStore('mout Store', () => {
  const moutRows = ref([]);
  const selectedMout = ref([]);

  // 목록 데이터 저장
  function setMoutRows(data) {
    moutRows.value = data;
  };
  // 선택상태
  function setSelectedMout(list){
    selectedMout.value = list;
  };
  // 목록을 초기상태로 되돌림
  function resetMoutRows() {
    moutRows.value = [];
    selectedMout.value = [];
    // console.log('리셋 확인');
  };
  
  return {
    moutRows,
    selectedMout,
    setMoutRows,
    setSelectedMout,
    resetMoutRows,
  }
}
// , {
//   persist: true // localStorage 기본 사용
// }
)
