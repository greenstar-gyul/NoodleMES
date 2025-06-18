/*
stores/mprStore.js
자재구매요청관리
*/

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useMprStore = defineStore('mprStore', () => {
  const mprRows = ref([]);
  const mrpRows = ref([]);
  const matRows = ref([]);
  const selectedMpr = ref([]);
  const selectedMrp = ref([]);

  // 목록 데이터 저장
  function setMprRows(data) {
    mprRows.value = data;
  };
  function setMrpRows(data) {
    mrpRows.value = data;
  };

  // 목록을 초기상태로 되돌림
  function resetMprRows() {
    mprRows.value = [];
    selectedMpr.value = [];
    // console.log('리셋 확인');
  };
  function resetMrpRows() {
    mrpRows.value = [];
    selectedMrp.value = [];
  };
  function resetMatRows() {
    matRows.value = [];
  };


  function setSelectedMpr(list){
    selectedMpr.value = list;
  };
  function setSelectedMrp(list){
    selectedMrp.value = list;
  };
  
  return {
    mprRows,
    mrpRows,
    matRows,
    selectedMpr,
    selectedMrp,
    setMprRows,
    setMrpRows,
    resetMprRows,
    resetMrpRows,
    resetMatRows,
    setSelectedMpr,
    setSelectedMrp
  }
}
// , {
//   persist: true // localStorage 기본 사용
// }
)
