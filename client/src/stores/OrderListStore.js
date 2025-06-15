// stores/orderListStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import moment from 'moment';

export const useOrderListStore = defineStore('orderListStore', () => {
  // 주문 목록
  const orders = ref([]);
  // 검색 조건
  const search = ref({
    ord_code: '',
    ord_name: '',
    ord_date_from: null,
    ord_date_to: null,
    client_name: null,
    prod_qtt_from: null,
    prod_qtt_to: null,
    delivery_date_from: null,
    delivery_date_to: null,
    ord_stat: null
  });
  // 거래처 목록
  const clients = ref([]);
  // 주문 상태 목록
  const orderStatuses = ref([]);

  // moment사용으로 날짜 문자열로 변환
  const formatDate = (date) => {
    return moment(date).format('YYYY-MM-DD'); // YYYY-MM-DD 형식으로 변환
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

  function setDefaultDateRange() {
    search.value.ord_date_from = getDateNDaysAgo(7); // 최근 7일 전 날짜
    search.value.ord_date_to = getToday(); // 오늘 날짜
  }

  // 기본 날짜 조건 주문 목록 조회
  async function fetchOrdersByDate() {
    try {
      if (!search.value.ord_date_from || !search.value.ord_date_to) {
        // console.warn('날짜가 설정되지 않았습니다.');
        return;
      }
      const params = {
        ...search.value,
        ord_date_from: safeFormat(search.value.ord_date_from),
        ord_date_to: safeFormat(search.value.ord_date_to),
        delivery_date_from: safeFormat(search.value.delivery_date_from),
        delivery_date_to: safeFormat(search.value.delivery_date_to)
      };
      const res = await axios.get('/api/order/date', { params });
        orders.value = res.data.data.map(order => ({
        ...order,
        ord_date: formatDate(order.ord_date),
        delivery_date: formatDate(order.delivery_date)
      }));
    } catch (err) {
      console.error('주문 목록 조회 실패:', err);
    }
  }

  // 검색 조건 주문 목록 조회
  async function fetchOrdersBySearch() {
  try {
    const params = {
      ...search.value,
      ord_stat: search.value.ord_stat ?? null,
      ord_date_from: safeFormat(search.value.ord_date_from),
      ord_date_to: safeFormat(search.value.ord_date_to),
      delivery_date_from: safeFormat(search.value.delivery_date_from),
      delivery_date_to: safeFormat(search.value.delivery_date_to)
    };
    const res = await axios.get('/api/order/search', { params });
    orders.value = res.data.data.map(order => ({
      ...order,
      ord_date: formatDate(order.ord_date),
      delivery_date: formatDate(order.delivery_date)
    }));
    // console.log("🔍 검색 파라미터 전송 확인:", params);
    console.log("🔍 [디버그] 검색 조건 원본:", search.value);
    // console.log("🧪 [디버그] 날짜 파싱 후 params:", {
    //   ord_date_from: formatDate(search.value.ord_date_from),
    //   ord_date_to: formatDate(search.value.ord_date_to),
    //   delivery_date_from: formatDate(search.value.delivery_date_from),
    //   delivery_date_to: formatDate(search.value.delivery_date_to),
    // });
  } catch (err) {
    console.error('검색 조건 주문 조회 실패:', err);
  }
}

  // 거래처 목록 조회
  async function fetchClients() {
    try {
      const res = await axios.get('/api/order/clients'); 
      clients.value = res.data.data.map(client => ({
        label: client.client_name,
        value: client.client_name
      }));
    } catch (err) {
      console.error('거래처 조회 실패:', err);
    }
  }

  // 주문 상태 목록 조회
  async function fetchOrderStatuses() {
    try {
      const res = await axios.get('/api/order/statuses');
      orderStatuses.value = res.data.data.map(stat => ({
        label: stat.status_name,
        value: stat.status_code
      }));
    } catch (err) {
      console.error('주문상태 조회 실패:', err);
    }
  }

  // 검색 초기화
  function resetSearch() {
    const s = search.value;
    s.ord_code = '';
    s.ord_name = '';
    s.ord_date_from = getDateNDaysAgo(7);
    s.ord_date_to = getToday();
    s.client_name = null;
    s.prod_qtt_from = null;
    s.prod_qtt_to = null;
    s.delivery_date_from = null;
    s.delivery_date_to = null;
    s.ord_stat = null;

    orders.value = []; // 결과 테이블 비우기
  }

  return {
    orders,
    search,
    clients,
    orderStatuses,
    formatDate,
    fetchOrdersByDate,
    fetchOrdersBySearch,
    fetchClients,
    fetchOrderStatuses,
    resetSearch,
    setDefaultDateRange
  };
});
