// stores/orderProductStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useOrderProductStore = defineStore('orderProductStore', () => {
  const productRows = ref([]);
  const selectedProducts = ref([]);

  function setProductRows(data) {
    productRows.value = data;
  };

  function resetProductRows() {
    productRows.value = [];
  };

  function setSelectedProducts(list){
    selectedProducts.value = list;
  };

  return {
    productRows,
    selectedProducts,
    setProductRows,
    resetProductRows,
    setSelectedProducts
  }
}
// , {
//   persist: true // localStorage 기본 사용
// }
)
