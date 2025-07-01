<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import Button from 'primevue/button';
import SearchText from '@/components/search-bar/SearchText.vue';
import SearchDateBetween from '@/components/search-bar/SearchDateBetween.vue';
import moment from 'moment';
import LabeledSelect from '../../../components/registration-bar/LabeledSelect.vue';
import SearchDropdown from '../../../components/search-bar/SearchDropdown.vue';

// 검색 조건
const searchOption = ref({
    eq_ma_code: '',
    eq_name: '',
    act_result: 'all',
    m_emp_name: '',
    fix_emp_name: '',
    start_date: null,
    end_date: null,
    fail_cause: ''
});

const emit = defineEmits(['search', 'resetSearch']);

const fetchSearch = () => {
    const searchParams = {
        eq_ma_code: searchOption.value.eq_ma_code,
        eq_name: searchOption.value.eq_name,
        act_result: searchOption.value.act_result === 'all' ? '' : searchOption.value.act_result,
        m_emp_name: searchOption.value.m_emp_name,
        fix_emp_name: searchOption.value.fix_emp_name,
        start_date: searchOption.value.start_date ?
            moment(searchOption.value.start_date).format('YYYY-MM-DD') : null,
        end_date: searchOption.value.end_date ?
            moment(searchOption.value.end_date).format('YYYY-MM-DD') : null,
        fail_cause: searchOption.value.fail_cause
    };

    emit('search', searchParams);
};

// 조치결과 옵션들
const actResultOptions = [
    { label: '조치중', value: 'g1' },
    { label: '조치완료', value: 'g2' },
    { label: '전체', value: 'all' }
];

// 초기화
const resetSearchOption = () => {
    searchOption.value = {
        eq_ma_code: '',
        eq_name: '',
        act_result: 'all',
        m_emp_name: '',
        fix_emp_name: '',
        start_date: null,
        end_date: null,
        fail_cause: ''
    };
};

const handleReset = () => {
    resetSearchOption();
    emit('resetSearch');
};

defineExpose({
    resetSearchOption,
    resetSearch: handleReset
});

</script>

<template>
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <SearchText v-model="searchOption.eq_ma_code" label="유지보수코드" placeholder="유지보수코드를 입력하세요" />

            <SearchText v-model="searchOption.eq_name" label="설비명" placeholder="설비명을 입력하세요" />

            <SearchDateBetween label="고장일" :from="searchOption.start_date" :to="searchOption.end_date"
                @update:from="searchOption.start_date = $event" @update:to="searchOption.end_date = $event" />

            <SearchDropdown v-model="searchOption.act_result" label="조치결과" :options="actResultOptions"
                defaultValue="전체" />

            <SearchText v-model="searchOption.m_emp_name" label="담당자명" placeholder="담당자명을 입력하세요" />

            <SearchText v-model="searchOption.fix_emp_name" label="수리자명" placeholder="수리자명을 입력하세요" />

            <SearchText v-model="searchOption.fail_cause" label="고장원인" placeholder="고장원인을 입력하세요" />
        </div>

        <div class="flex justify-center gap-3 mt-4">
            <Button label="초기화" severity="contrast" @click="handleReset" />
            <Button label="조회" severity="info" @click="fetchSearch" />
        </div>
    </div>
</template>