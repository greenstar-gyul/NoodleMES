<script setup>
import { onMounted, ref, watch } from 'vue';
import axios from 'axios';
import WKOManageSearch from './wko-sub/WKOManageSearch.vue';
import WKOManageTable from './wko-sub/WKOManageTable.vue';

onMounted(() => {
    // 초기화 로직
});

const saveData = async () => {
    if (!confirm('작업 지시서 정보를 저장하시겠습니까?')) {
        alert('저장을 취소했습니다.');
        return;
    }

    console.log('저장할 작업지시서 정보:', wkoInfo.value);

    try {
        if (wkoInfo.value.wko_code === '' || wkoInfo.value.wko_code === undefined) {
            // 신규 등록
            const response = await axios.post(`/api/wko/create`, wkoInfo.value);
            const result = response.data;
            if (result.result_code === "SUCCESS") {
                wkoInfo.value.wko_code = result.data.wko_code;
                alert('작업지시서 등록에 성공했습니다.');
                // 공정 목록 새로고침
                await loadWKO(wkoInfo.value.wko_code);
                await loadProcessList();
            } else {
                alert('등록에 실패했습니다.');
            }
        } else {
            // 수정
            const response = await axios.put(`/api/wko/${wkoInfo.value.wko_code}`, wkoInfo.value);
            const result = response.data;
            if (result.result_code === "SUCCESS") {
                alert('작업지시서 수정에 성공했습니다.');
            } else {
                alert('수정에 실패했습니다.');
            }
        }
    } catch (error) {
        console.error('저장 실패:', error);
        alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
}

const resetData = () => {
    processList.value = [];
    wkoInfo.value = {
        wko_code: '',
        reg_date: '',
        stat: 'v4',
        note: '',
        prdp_code: '',
        prod_code: '',
        prod_name: '',
        emp_code: '',
        emp_name: '',
        reg_code: 'EMP-10001',
        reg_name: '김영업',
        wko_qtt: 0,
        reg_date: '',
        line_code: '',
        line_name: '',
    };
}

const loadWKO = async (wkoCode) => {
    if (wkoCode && wkoCode !== '') {
        try {
            const result = await axios.get(`/api/wko/${wkoCode}`);
            const wkoData = result.data.data[0];
            console.log('로딩된 작업 지시서', wkoData);
            if (wkoData) {
                wkoInfo.value = { ...wkoData };
                await loadProcessList();
            }
        } catch (error) {
            console.error('작업지시서 로딩 실패:', error);
        }
    }
}

const loadProcessList = async () => {
    if (wkoInfo.value.line_code) {
        try {
            const result = await axios.get(`/api/wko/processes/${wkoInfo.value.line_code}`);
            processList.value = result.data.data || [];

            console.log('로드된 공정 목록', processList.value);
            
            // 공정 목록에 ID 추가
            processList.value.forEach((process, index) => {
                process.process_id = `${process.line_code}_${process.pp_code}_${index}`;
            });
        } catch (error) {
            console.error('공정 목록 로딩 실패:', error);
            processList.value = [];
        }
    } else {
        processList.value = [];
    }
}

// 생산계획과 제품이 선택되었을 때 공정 목록 로드
const onProdPlanSelected = (prdpCode, prodCode) => {
    wkoInfo.value.prdp_code = prdpCode;
    wkoInfo.value.prod_code = prodCode;
    loadProcessList();
}

// 현재 작업지시서 정보
const wkoInfo = defineModel('data');
wkoInfo.value = {
    wko_code: '',
    reg_date: '',
    stat: 'v4',
    note: '',
    prdp_code: '',
    prod_code: '',
    prod_name: '',
    emp_code: '',
    emp_name: '',
    reg_code: 'EMP-10001',
    reg_name: '김영업',
    wko_qtt: 0,
    reg_date: '',
    line_code: '',
    line_name: '',
};

// 작업지시서 정보가 바뀔 때 공정 목록 갱신
watch(() => wkoInfo.value.line_code, 
    (newLineCode) => {
        if (newLineCode) {
            loadProcessList();
        }
    }
);

// 현재 작업지시서의 공정 목록
const processList = defineModel('subData');

</script>

<template>
    <div>
        <WKOManageSearch 
            v-model:data="wkoInfo" 
            @reset-list="resetData" 
            @save-data="saveData"
            @prod-plan-selected="onProdPlanSelected"
            @load-wko="loadWKO">
        </WKOManageSearch>
        
        <WKOManageTable 
            v-model:subData="processList" 
            :dataKey="'process_id'" 
            :columns="['line_name','process_name', 'eq_name','eq_stat']" 
            title="공정 목록">
        </WKOManageTable>
    </div>
</template>