<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useOrderListStore } from '@/stores/orderListStore';
import SearchText from '@/components/search-bar/SearchText.vue';
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue';
import SearchDropdownValue from '../../../../components/search-bar/SearchDropdownValue.vue';
import SearchNumberBetween from '@/components/search-bar/SearchNumberBetween.vue';
import Button from 'primevue/button';


// 피니아
// const { productRows, selectedProducts, setProductRows, resetProductRows, setSelectedProducts } = useOrderProductStore();
const ordStore = useOrderListStore();
// Store에서 프로퍼티를 추출하면서 반응성을 유지하려면 storeToRefs()를 사용해야 한다.
// storeToRefs()는 Pinia 스토어의 "상태!"를 반응형으로 변환해준다.
// 따라서, storeToRefs()를 사용하여 상태를 추출하는 것이 좋다.

// 상태는 반응형으로 가져오기
const { search, clients: clientOptions, orderStatuses: orderStatusOptions } = storeToRefs(ordStore);
// 함수는 그대로 가져오기
const { fetchOrdersByDate, fetchOrdersBySearch, resetSearch, fetchClients, fetchOrderStatuses } = ordStore;

// 컴포넌트 초기화 시 거래처 및 주문 상태 목록 가져오기
onMounted(() => {
  fetchOrdersByDate();
  fetchClients();
  fetchOrderStatuses();
});

// 검색 초기화 함수
const onReset = () => {
  resetSearch();
  fetchOrdersByDate(); // 초기화 후 기본 날짜로 조회
  fetchOrderStatuses();
};

// 검색 실행 함수
const onSearch = () => {
  // ord_code나 client_name 등 하나라도 입력된 조건이 있다면 검색으로 판단
  const values = Object.values(search.value);
  const hasCondition = values.some(v => v !== '' && v !== null);

  if (hasCondition) {
    fetchOrdersBySearch();
  } else {
    fetchOrdersByDate(); // 조건 없으면 기본 날짜 조건 조회
  }
};

</script>

<template>
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <!-- 검색 조건 영역 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      <SearchText v-model="search.ord_code" label="주문코드" placeholder="주문코드를 입력하세요" />
      <SearchText v-model="search.ord_name" label="주문명" placeholder="주문명을 입력하세요" />
      
      <SearchDateBetween
        label="주문일자"
        :from="search.ord_date_from"
        :to="search.ord_date_to"
        @update:from="search.ord_date_from = $event"
        @update:to="search.ord_date_to = $event"
      />

      <SearchDropdownValue label="거래처" v-model="search.client_name" :options="clientOptions" />
      
      <SearchNumberBetween label="수량" v-model:from="search.prod_qtt_from" v-model:to="search.prod_qtt_to" />
      
      <SearchDateBetween
        label="납기일"
        :from="search.delivery_date_from"
        :to="search.delivery_date_to"
        @update:from="search.delivery_date_from = $event"
        @update:to="search.delivery_date_to = $event"
      />

      <!-- <SearchDropdownValue label="상태" v-model="search.ord_stat" :options="orderStatusOptions" /> -->
    </div>

    <!-- 버튼 영역 -->
    <div class="flex justify-center gap-3 mt-4">
      <Button label="초기화" severity="contrast" @click="onReset" />
      <Button label="조회" severity="info" @click="onSearch" />
    </div>
  </div>
</template>
