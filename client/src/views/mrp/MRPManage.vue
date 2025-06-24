<script setup>
import { onMounted, ref, watch } from 'vue';
import MultiplePopup from '@/components/popup/MultiplePopup.vue';
import TableWithAddDel from '@/components/form/TableWithAddDel.vue';
import mrpMapping from '@/service/MRPMapping';
import MRPManageSearch from './mrp-sub/MRPManageSearch.vue';
import bomSubMapping from '@/service/BOMSubMapping';
import axios from 'axios';
import MRPManageTable from './mrp-sub/MRPManageTable.vue';

const prdpCode = ref(null);

onMounted(() => {
    // popupMats.value = MRPService.popupMats;
    // mats.value = MRPService.mats;
});

const saveData = async () => {
    if (!confirm('MRP 정보를 저장하시겠습니까?')) {
        alert('저장을 취소했습니다.');
        return;
    }

    const data = {};
    data.mrpData = mrpInfo.value;
    data.detailData = mrpDetailList.value;
    
    if (data.mrpData.mrp_code === '') {
        const response = await axios.post(`/api/mrp/create`, data);
        const result = response.data;
        if (result.result_code === "SUCCESS") {
            alert('저장에 성공했습니다.');
            resetData();
        }
        else {
            alert('저장에 실패했습니다. 다시 시도해주세요.');
        }
    }
    else {
        const response = await axios.put(`/api/mrp/${data.mrpData.mrp_code}`, data);
        const result = response.data;
        if (result.result_code === "SUCCESS") {
            alert('수정에 성공했습니다.');
            resetData();
        }
        else {
            alert('수정에 실패했습니다. 다시 시도해주세요.');
        }
    }
}

const updatePrdpCode = (value) => {
    prdpCode.value = value;
}

const resetData = () => {
    mrpDetailList.value = [];
    mrpInfo.value = {
        prdp_code: '',
        reg: '김영업',
        prdp_date: '',
        start_date: '',
        mrp_code: '',
        note: '',
        emp_code: 'EMP-10001',
    };
    prdpCode.value = '';
}

const loadMrpDetail = async (mrpCode) => {
    // mrp_code가 없다는 것은.. 등록된 mrp가 아님..
    if (mrpCode != undefined && mrpCode != null && mrpCode != '') {
        const result = await axios.get(`/api/mrp/detail/${mrpCode}`);
        mrpDetailList.value = await result.data.data;
    }
    else {
        mrpDetailList.value = [];
    }
}

// 현재 MRP 정보
const mrpInfo = defineModel('data');
mrpInfo.value = {
    prdp_code: '',
    reg: '김영업',
    prdp_date: '',
    start_date: '',
    mrp_code: '',
    note: '',
    emp_code: 'EMP-10001',
};

// mrp 정보가 바뀌면 하위 자재 갱신하기..
watch(() => mrpInfo.value, (newVal) => {
    // loadMrpInfo();
    prdpCode.value = mrpInfo.value.prdp_code;
    loadMrpDetail(mrpInfo.value.mrp_code);
})

// 현재 MRP 상세(하위 자재) 정보
const mrpDetailList = defineModel('subData');

watch(() => mrpDetailList.value, (newVal) => {
    let idx = 1;
    mrpDetailList.value.forEach(element => {
        element.mrp_d_id = idx++;
    });
})

</script>

<template>
    <div>
        <MRPManageSearch v-model:data="mrpInfo" @reset-list="resetData" @save-data="saveData"></MRPManageSearch>
        <MRPManageTable v-model:subData="mrpDetailList" v-model:prdp="prdpCode" :dataKey="'mrp_d_id'" :columns="['mat_name','req_qtt', 'unit','cur_qtt','stock_unit']" title="자재"></MRPManageTable>
    </div>

    <!-- 팝업 -->
    
    <!-- 팝업 끝 -->
</template>
