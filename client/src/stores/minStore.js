/*
stores/minStore.js
자재입고
*/

import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import moment from 'moment';

export const useMinStore = defineStore('minStore', () => {
  // min 목록
  const minRows = ref([]);
    // minList에서 사용할 목록
  const mins = ref([]);

  // 검색조건
  const selectedMin = ref({
    matName: '',
    matType: '',
    inbndDateFrom: getDateNDaysAgo(7),
    inbndDateTo: getToday(),
    supName: '',
    mName: '',
  });

  // moment사용으로 날짜 문자열로 변환
  const formatDate = (date) => {
    return moment(date).format('YYYY-MM-DD'); // YYYY-MM-DD 형식으로 변환
  };  
  const safeFormat = (date) => {
    if (!date) return null; // 입력값이 없으면 null처리되도록 설정
    return moment(date).format('YYYY-MM-DD');
  };
  
  function getToday() {
    return new Date(); // 현재 날짜 반환
  }

  function getDateNDaysAgo(n) {
    const d = new Date(); 
    d.setDate(d.getDate() - n); // n일 전 날짜 반환
    return d;
  }
  // 전체 min정보를 불러오는 함수
  async function fetchAllMins() {
    try {
      // const params = {
      //   ...selectedMin.value,
      //   inbndDateFrom: safeFormat(selectedMin.value.inbndDateFrom),
      //   inbndDateTo: safeFormat(selectedMin.value.inbndDateTo),
      // };
      const res = await axios.get('/api/min/all');
        mins.value = res.data.map(min => ({
        ...min,
        inbnd_date: formatDate(min.inbnd_date),
      }));
    } catch (err) {
      throw err;
    }
  }

  // 목록 조회
  async function fetchMinsSearch() {
    try {
      const params = {
        ...selectedMin.value,
        inbndDateFrom: safeFormat(selectedMin.value.inbndDateFrom),
        inbndDateTo: safeFormat(selectedMin.value.inbndDateTo),
      };
      const res = await axios.get('/api/min/all', { params });
        mins.value = res.data.map(min => ({
        ...min,
        inbnd_date_date: formatDate(min.inbnd_date),
      }));
    } catch (err) {
      throw err;
    }
  }

    // 검색 초기화
  function resetSearch() {
    const selMin = selectedMin.value;
    selMin.matName = '';
    selMin.matType = '';
    selMin.inbndDateFrom = getDateNDaysAgo(7);
    selMin.inbndDateTo = getToday();
    selMin.supName = '';
    selMin.mName = '';
    mins.value = []; // 결과 테이블 비우기
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
  };
  
  return {
    minRows,
    selectedMin,
    fetchAllMins,
    fetchMinsSearch,
    setMinRows,
    setSelectedMin,
    resetMinRows,
    resetSearch,
  }
}
// , {
//   persist: true // localStorage 기본 사용
// }
)
