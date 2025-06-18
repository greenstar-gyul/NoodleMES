<script setup>
import { ref, reactive } from 'vue';
import Button from 'primevue/button';
import moment from 'moment';
import SearchText from '@/components/search-bar/SearchText.vue';
import SearchDate from '@/components/search-bar/SearchDate.vue';


const emit = defineEmits(['search', 'reset']);

//  오늘 기준 월의 1일과 말일 계산
const firstDay = moment().startOf('month').format('YYYY-MM-DD');
const lastDay = moment().endOf('month').format('YYYY-MM-DD');
const totalTime = moment().format('HH-MM-DD');

// 검색 조건을 저장할 반응형 객체
const search = reactive({
    prdr_code: '',
    prod_code: '',
    line_code: '',
    wko_code: '',
    start_date: firstDay,
    end_date: lastDay, 
});

// 조회 버튼 클릭 시 emit
const fetchPrdps = () => {
  emit('search', search);
};

// 초기화 버튼 클릭 시 emit
const resetSearch = () => {
    search.prdr_code = '';
    search.prod_code = '';
    search.line_code = '';
    search.wko_code = '';
    search.start_date =  moment().startOf('month').format('YYYY-MM-DD');
    search.end_date = moment().endOf('month').format('YYYY-MM-DD');
  emit('reset'); // 필요 시
};

</script>



<template>
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <SearchText v-model="search.prdr_code" label="생산실적코드" />
            <SearchText v-model="search.prod_name" label="제품명" />
            <SearchText v-model="search.work_order_code" label="작업지시코드" />
            <!-- 시작일자 범위 -->
            <SearchDate v-model="search.start_date" label="시작일자" />
            <!-- 종료일자 범위 -->
            <SearchDate v-model="search.end_date" label="종료일자" />

        </div>

        <div class="flex justify-center gap-3 mt-4">
            <Button label="초기화" severity="contrast" @click="resetSearch" />
            <Button label="조회" severity="info" @click="fetchPrdps" />
        </div>
    </div>
</template>
