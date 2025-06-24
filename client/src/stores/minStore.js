/*
stores/minStore.js
자재입고
*/

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useMinStore = defineStore('minStore', () => {
  // min 목록
  const minRows = ref([]);
    // minList에서 사용할 목록
  const mins = ref([]);

  // 검색조건
  const selectedMin = ref({
    matName: '',
    matType: '',
    inbndDateFrom: null,
    inbndDateTo: null,
    supName: '',
    mName: '',
  });

  // moment사용으로 날짜 문자열로 변환
  const formatDate = (date) => {
    return moment(date).format('YYYY-MM-DD'); // YYYY-MM-DD 형식으로 변환
  };  
  const safeFormat = (date) => {
    if (!date) return null; // null 그대로 유지
    return moment(date).format('YYYY-MM-DD');
  };
  
  // 기본 날짜 조건 주문 목록 조회
  async function fetchMinsSearch() {
    try {
      if (!selectedMin.value.inbndDateFrom || !selectedMin.value.inbndDateTo) {
        // console.warn('날짜가 설정되지 않았습니다.');
        return;
      }
      const params = {
        ...selectedMin.value,
        inbndDateFrom: safeFormat(search.value.inbndDateFrom),
        inbndDateTo: safeFormat(search.value.inbndDateTo),

      };
      const res = await axios.get('/api/min/date', { params });
        orders.value = res.data.data.map(order => ({
        ...order,
        ord_date: formatDate(order.ord_date),
        delivery_date: formatDate(order.delivery_date)
      }));
    } catch (err) {
      console.error('주문 목록 조회 실패:', err);
    }
  }

  function getToday() {
    return new Date(); // 현재 날짜 반환
  }

  // 목록 데이터 저장
  function setMinRows(data) {
    minRows: data;
  };

  // 목록 데이터 저장
  function setMinRows(data) {
    minRows: data;
  };
  // 선택상태
  function setSelectedMin(list){
    selectedMin: list;
  };
  // 목록을 초기상태로 되돌림
  function resetMinRows() {
    minRows: [];
    selectedMin: [];
    // console.log('리셋 확인');
  };
  
  return {
    minRows,
    selectedMin,
    fetchMinsSearch ,
    setMinRows,
    setSelectedMin,
    resetMinRows,
  }
}
// , {
//   persist: true // localStorage 기본 사용
// }
)
