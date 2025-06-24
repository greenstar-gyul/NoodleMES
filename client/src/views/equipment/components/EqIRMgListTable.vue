<script setup>
import { onMounted, defineProps, defineEmits, computed, ref } from 'vue';
import moment from 'moment';
import EqTableWithExcel from '../components/EqTableWithExcel.vue';

const props = defineProps({
    eqmadata: Array,
    required: true,
});

const pickedEqMa = ref(null); // 선택된 설비 유지보수 데이터
const emit = defineEmits(['initData', 'update:data']);

// 조치결과 옵션들
const actResultOptions = [
    { label: '조치중', value: 'g1' },
    { label: '조치완료', value: 'g2' }
];

const getActResultLabel = (actValue) => {
    if (!actValue) return '';
    const option = actResultOptions.find(opt => opt.value === actValue);
    return option ? option.label : actValue;
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    return moment(dateString).format('YYYY-MM-DD');
};

const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return moment(dateString).format('YYYY-MM-DD HH:mm');
};

const formattedEqMaData = computed(() => {
    if (!props.eqmadata || !Array.isArray(props.eqmadata)) return [];

    return props.eqmadata.map(item => ({
        ...item,
        fail_date: formatDate(item.fail_date),
        start_date: formatDateTime(item.start_date),
        end_date: formatDateTime(item.end_date),
        re_chk_exp_date: formatDate(item.re_chk_exp_date),
        act_result: getActResultLabel(item.act_result),
        regdate: formatDateTime(item.regdate)
    }));
});

const handleEqMaSelect = (eqMa) => {
    pickedEqMa.value = eqMa;
    emit('update:data', eqMa);
};

onMounted(() => {
    emit('initData');
});
</script>

<template>
    <EqTableWithExcel :data="formattedEqMaData" :dataKey="'eq_ma_code'"
        :columns="['eq_ma_code', 'eq_name', 'fail_date', 'fail_cause', 'act_result', 'start_date', 'end_date', 'm_emp_name', 'fix_emp_name']"
        :mapper="{
            eq_ma_code: '유지보수코드',
            eq_name: '설비명',
            fail_date: '고장일',
            fail_cause: '고장원인',
            act_result: '조치결과',
            start_date: '조치시작일시',
            end_date: '조치종료일시',
            m_emp_name: '담당자명',
            fix_emp_name: '수리자명'
        }" title="설비 유지보수 목록" @crctEqii="handleEqMaSelect" />
</template>