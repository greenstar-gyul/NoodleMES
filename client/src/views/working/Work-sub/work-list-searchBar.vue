<script setup>
import { ref, reactive } from 'vue';
import Button from 'primevue/button';
import moment from 'moment';
import SearchText from '@/components/search-bar/SearchText.vue';
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue';


const emit = defineEmits(['search', 'reset']);

//  오늘 기준 월의 1일과 말일 계산
const firstDay = moment().startOf('month').format('YYYY-MM-DD');
const lastDay = moment().endOf('month').format('YYYY-MM-DD');

// 검색 조건을 저장할 반응형 객체
const search = reactive({
    wko_code: '',
    wko_name: '',
    prod_code: '',
    prod_name: '',
    line_code: '',
    reg_date_from: firstDay,
    reg_date_to: lastDay, 
});

// 조회 버튼 클릭 시 emit
const fetchPrdps = () => {
  emit('search', search);
};

// 초기화 버튼 클릭 시 emit
const resetSearch = () => {
    search.wko_code = '';
    search.wko_name = '';
    search.prod_code = '';
    search.prod_name = '',
    search.line_code = '';
    search.reg_date_from =  moment().startOf('month').format('YYYY-MM-DD');
    search.reg_date_to = moment().endOf('month').format('YYYY-MM-DD');
  emit('reset'); // 필요 시
};

</script>



<template>
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <SearchText v-model="search.wko_code" label="작업지시코드" />
            <SearchText v-model="search.wko_name" label="작업지시명" />
            <SearchText v-model="search.prod_name" label="제품명" />
            <SearchText v-model="search.line_code" label="라인코드" />
            <SearchDateBetween label="등록일자" 
            :from="search.reg_date_from" 
            :to="search.reg_date_to" 
            @update:from="search.reg_date_from = $event" 
            @update:to="search.reg_date_to = $event" />
        </div>

        <div class="flex justify-center gap-3 mt-4">
            <Button label="초기화" severity="contrast" @click="resetSearch" />
            <Button label="조회" severity="info" @click="fetchPrdps" />
        </div>
    </div>
</template>
