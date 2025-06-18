// stores/releaseListStore.js
import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
import moment from 'moment';

// 출고요청 목록 관리를 위한 Pinia Store 정의
export const useReleaseListStore = defineStore('releaseList', () => {
  
  // 출고요청 목록 데이터 저장 상태
  const releases = ref([]);

  // 검색 조건
  const search = ref({
    out_req_code: '',
    out_req_date_from: getDateNDaysAgo(7),
    out_req_date_to: getToday(),
    client_name: null,
    mcode: null,
    prod_name: '',
    outbnd_qtt_from: null,
    outbnd_qtt_to: null
  });

  // 날짜 포맷 함수
  const formatDate = (date) => {
    return moment(date).format('YYYY-MM-DD');
  };

  // 날짜를 안전하게 포맷팅하는 함수
  // null이나 undefined인 경우 그대로 반환
  const safeFormat = (date) => {
    if (!date) return null; // null 그대로 유지
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

  // 기본 날짜 범위 설정 (최근 7일)
  const setDefaultDateRange = () => {
    search.value.out_req_date_from = getDateNDaysAgo(7);
    search.value.out_req_date_to = getToday();
  };

  // 출고요청 목록 조회 (기본: 날짜 기준)
  const fetchReleasesByDate = async () => {
    try {
      const params = {
        ...search.value,
        out_req_date_from: safeFormat(search.value.out_req_date_from),
        out_req_date_to: safeFormat(search.value.out_req_date_to),
      };

      const res = await axios.get('/api/order/releaseData', { params });

      releases.value = res.data.data.map(release => ({
        ...release,
        out_req_date: formatDate(release.out_req_date)
      }));
    } catch (err) {
      console.error('출고요청 목록 조회 실패:', err);
    }
  };

  // 검색 초기화 (최근 7일로)
  const resetSearch = () => {
    search.value = {
      out_req_code: '',
      out_req_date_from: getDateNDaysAgo(7),
      out_req_date_to: getToday(),
      client_name: null,
      mcode: null,
    };
  };

  // 컴포넌트에서 사용할 상태와 함수들을 export
  return {
    releases,
    search,
    fetchReleasesByDate,
    resetSearch,
    setDefaultDateRange
  };
});
