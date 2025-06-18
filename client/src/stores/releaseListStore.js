// stores/releaseListStore.js
import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';

// 출고요청 목록 관리를 위한 Pinia Store 정의
export const useReleaseListStore = defineStore('releaseList', () => {
  
  // 출고요청 목록 데이터 저장 상태
  const releases = ref([]);

  // 검색 조건 상태 (출고요청코드, 출고요청일자 범위, 거래처명, 담당자)
  const search = ref({
    out_req_code: '',
    out_req_date_from: null,
    out_req_date_to: null,
    client_name: null,
    mcode: null,
  });

  // 기본 날짜 기준으로 출고요청 목록 조회 (초기화 시 실행할 기본 조회)
  const fetchReleasesByDate = async () => {
    const res = await axios.get('/api/order/releaseData', search.value);
    releases.value = res.data.data;
  };

 

  // 검색 조건 초기화 함수
  const resetSearch = () => {
    search.value = {
      out_req_code: '',
      out_req_date_from: '',
      out_req_date_to: '',
      client_name: '',
      mcode: '',
    };
  };

  // 컴포넌트에서 사용할 상태와 함수들을 export
  return {
    releases,
    search,
    fetchReleasesByDate,
    resetSearch,
  };
});
