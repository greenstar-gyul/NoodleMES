<template>
  <Dialog :visible="visible" modal header="주문정보 조회" :style="{ width: '70vw' }" :closable="false">
    <!-- 검색창 -->
    <div class="flex items-center gap-2 mb-4">
      <InputText v-model="searchKeyword" placeholder="주문번호 또는 주문명 또는 거래처를 입력해주세요." class="flex-1" />
      <Button label="검색" severity="info" @click="searchOrders" />
    </div>

    <!-- 주문 테이블 -->
    <DataTable
      :value="items"
      selectionMode="single"
      v-model:selection="selectedItem"
      :dataKey="dataKey"
      showGridlines
      scrollable
      scrollHeight="300px"
    >
    <Column selectionMode="single" headerStyle="width: 3rem" />

    <Column
      v-for="item in singlePopupItems"
      :key="item"
      :field="item"
      :header="mapper[item] ?? item"
    />

    <!-- <Column field="ord_code" header="주문번호" />
    <Column field="ord_date" header="주문일자" />
    <Column field="ord_name" header="주문명" />
    <Column field="client" header="거래처" />
    <Column field="delivery_date" header="납기일" />
    <Column field="priority" header="우선순위" /> -->
    </DataTable>

    <!-- 버튼 영역 -->
    <div class="flex justify-center gap-3 mt-4">
      <Button label="취소" severity="contrast" @click="cancel" />
      <Button label="확인" severity="warning" @click="confirm" />
    </div>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

// props 및 emits
const props = defineProps({
  visible: Boolean,
  items: {
      type: Array,
      required: true
  },
  dataKey: {
        type: String,
        default: 'id'
    },
  mapper: {
      type: Array,
      required: true
  }
});
const emit = defineEmits(['update:visible', 'confirm']);

const selectedItem = ref(null);
const searchKeyword = ref('');

const singlePopupItems = ref();

// 데이터가 바뀔 때마다 열 추출
watch(
    () => props.items,
    (newVal) => {
        if (newVal?.length > 0) {
            singlePopupItems.value = Object.keys(newVal[0]);
        } else {
            singlePopupItems.value = [];
        }
    },
    { immediate: true }
);

// visible 상태 양방향 바인딩
watch(() => props.visible, (val) => {
  if (!val) selectedItem.value = null;
});

const cancel = () => {
  emit('update:visible', false);
};

const confirm = () => {
  emit('confirm', selectedItem.value);
  emit('update:visible', false);
};

const searchOrders = () => {
  console.log('검색 실행:', searchKeyword.value);
  // 실제 검색 로직은 부모에서 props로 넘겨도 되고, emit 해도 됨
};
</script>