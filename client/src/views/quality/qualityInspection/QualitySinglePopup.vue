<script setup>
import { ref, watch, computed } from 'vue';

// Props & Emits
const props = defineProps({
  visible: Boolean,
  items: {
    type: Array,
    required: true,
    default: () => []
  },
  dataKey: {
    type: String,
    default: 'id',
  },
  mapper: {
    type: Object,
    default: () => ({}),
  },
  title: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  columns: {
    type: Array,
    default: [],
  },
  selectedHeader: {
    type: Array,
    default: [],
  }
});

const emit = defineEmits(['update:visible', 'confirm']);

// 내부 상태
const selectedItem = ref(null);
const searchKeyword = ref('');
const visibleFields = ref([]);

// 검색 기능 추가! - 모든 필드에서 검색어 찾기
const filteredItems = computed(() => {
  if (!searchKeyword.value.trim()) {
    return props.items;
  }
  
  const keyword = searchKeyword.value.toLowerCase();
  
  return props.items.filter(item => {
    // 객체의 모든 값들을 문자열로 변환해서 검색어 포함 여부 체크
    return Object.values(item).some(value => {
      if (value == null) return false;
      return String(value).toLowerCase().includes(keyword);
    });
  });
});

// 테이블 컬럼 자동 추출
watch(
  () => props.items,
  (newVal) => {
    if (props.selectedHeader.length > 0) return; // selectedHeader가 있을 경우 watch 종료.

    if (Array.isArray(newVal) && newVal.length > 0) {
      visibleFields.value = Object.keys(newVal[0]);
    } else {
      visibleFields.value = [];
    }
  },
  { immediate: true }
);

watch(
  () => props.selectedHeader,
  (newVal) => {
    if (newVal.length > 0) {
      visibleFields.value = newVal;
    } else if (Array.isArray(props.items) && props.items.length > 0) {
      visibleFields.value = Object.keys(props.items[0]);
    } else {
      visibleFields.value = [];
    }
  },
  { immediate: true }
);

// 팝업 닫힐 때 선택 초기화
watch(
  () => props.visible,
  (val) => {
    if (!val) {
      selectedItem.value = null;
      searchKeyword.value = ''; // 팝업 닫힐 때 검색어도 초기화
    }
  }
);

// 버튼 핸들러
const cancel = () => {
  emit('update:visible', false);
};

const confirm = () => {
  if (selectedItem.value) {
    emit('confirm', selectedItem.value);
    emit('update:visible', false);
  }
};

// 검색 버튼은 이제 필요없지만 혹시 몰라서 남겨둠
const searchOrders = () => {
  // 실시간 검색
  console.log('검색어:', searchKeyword.value);
};

const rowClass = (data) => {
  return data.disabled ? 'p-disabled-row' : '';
};

const handleRowSelect = (event) => {
  if (event.data.disabled) {
    // 선택 취소
    selectedItem.value = null;
  }
};
</script>

<template>
  <Dialog :visible="visible" modal :header="title" :style="{ width: '50vw', minWidth: '400px', maxWidth: '800px' }"
    :closable="false">
    <!-- 검색창 -->
    <div class="flex items-center gap-2 mb-4">
      <InputText v-model="searchKeyword" :placeholder="props.placeholder || '검색어를 입력하세요.'" class="flex-1" 
        @input="selectedItem = null" />
      <Button label="검색" severity="info" @click="searchOrders" />
    </div>

    <!-- 검색 결과 표시 -->
    <div v-if="searchKeyword.trim() && filteredItems.length === 0" class="text-center py-4 text-gray-500">
      검색 결과가 없어요 ㅠㅠ
    </div>

    <!-- 데이터 테이블 - filteredItems 사용! -->
    <DataTable :value="filteredItems" v-model:selection="selectedItem" selectionMode="single" :dataKey="dataKey" showGridlines
      scrollable scrollHeight="300px" :rowClass="rowClass" @rowSelect="handleRowSelect">
      <Column selectionMode="single" headerStyle="width: 3rem" />
      <Column v-for="field in visibleFields" :key="field" :field="field" :header="mapper[field] ?? field">
        <template #body="slotProps">
          {{ slotProps.field.toLowerCase().includes('date')
            ? slotProps.data[slotProps.field]?.substring(0, 10)
            : slotProps.data[slotProps.field] }}
        </template>
      </Column>
    </DataTable>

    <!-- 버튼 영역 -->
    <div class="flex justify-center gap-3 mt-4">
      <Button label="취소" severity="contrast" @click="cancel" />
      <Button label="확인" severity="warning" :disabled="!selectedItem" @click="confirm" />
    </div>
  </Dialog>
</template>

<style scoped>
.p-disabled-row {
  pointer-events: none;
  opacity: 0.5;
}
</style>