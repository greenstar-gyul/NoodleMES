<script setup>

</script>

<template>
  <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
    <div class="grid grid-cols-1 gap-4">
      <div class="flex justify-between">
        <div>
          <div class="font-semibold text-2xl">생산실적</div>
        </div>
        <div class="flex items-center gap-2 flex-nowrap">
          <Button label="삭제" severity="danger" class="min-w-fit" />
          <Button label="초기화" severity="contrast" class="min-w-fit" @click="emit('reset')" />
          <Button label="저장" severity="info" class="min-w-fit" @click="emit('save')"/>
          <Button label="생산실적 불러오기" severity="success" class="min-w-fit whitespace-nowrap"
            @click="dialogVisible = true" />
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="생산실적코드" v-model="prdr_code" placeholder="생산실적코드" :disabled="true" />
      <LabeledInput label="계획명" v-model="prdp_name" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInput label="공정유형" v-model="process_type" :disabled="true" />
      <LabeledInput label="작업자" v-model="emp_code" placeholder="작업자명" :disabled="true" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledDatePicker label="시작시간" v-model="start_date" />
      <LabeledDatePicker label="완료시간" v-model="end_date" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledInputIcon label="소요시간"  v-model="total_time"/>
      <LabeledInputIcon label="종료 예정시간"  v-model="goal_time"/>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LabeledTextarea label="비고" v-model="note" placeholder="특이사항 입력" />
    </div>
  </div>
  <!-- 주문정보 조회 팝업 -->
  <SinglePopup v-model:visible="orderVisible" :items="orders" :mapper="orderListMapping" :dataKey="'ord_code'" placeholder="주문코드 또는 주문명 검색"
      @confirm="handleOrderConfirm" />
  <!-- 생산계획 조회 팝업 -->
  <SinglePopup v-model:visible="dialogVisible" :items="products" :mapper="productionMapping" :dataKey="'prdp_code'" placeholder="생산계획코드 또는 계획명 검색"
      @confirm="handleConfirm" />

</template>