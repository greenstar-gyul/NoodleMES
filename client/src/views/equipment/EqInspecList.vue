<script setup>
import { onMounted, ref, watch } from 'vue';
import EqiiManageSearch from './components/EqiiManageSearch.vue';
import EqiiManageTable from './components/EqiiManageTable.vue';
import axios from 'axios';

const eqiiCode = ref(null);

onMounted(() => {
    // popupMats.value = MRPService.popupMats;
    // mats.value = MRPService.mats;
});

const saveData = async () => {
    if (!confirm('설비점검지시 정보를 저장하시겠습니까?')) {
        alert('저장을 취소했습니다.');
        return;
    }

    const data = {};
    data.eqiiData = eqiiInfo.value;
    data.detailData = eqirList.value;
    // console.log(data);

    if (data.eqiiData.eqii_code === '') {
        // console.log(data);
        const response = await axios.post(`/api/mrp/create`, data);
        const result = response.data;
        console.log(result);
        if (result.result_code === "SUCCESS") {
            alert('저장에 성공했습니다.');
        }
        else {
            alert('저장에 실패했습니다. 다시 시도해주세요.');
        }
    }
    else {
        // console.log(data.eqiiData.eqii_code);
        const response = await axios.put(`/api/mrp/${data.eqiiData.eqii_code}`, data);
        const result = response.data;
        console.log(result);
        if (result.result_code === "SUCCESS") {
            alert('저장에 성공했습니다.');
        }
        else {
            alert('저장에 실패했습니다. 다시 시도해주세요.');
        }
    }
}

const updateeqiiCode = (value) => {
    eqiiCode.value = value;
}

const formatDateForDB = (date) => {
    if (!date) return null;
    if (date instanceof Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    return null;
};

const resetData = () => {
    eqirList.value = [];
    eqiiInfo.value = {
        eqii_code: '',
        inst_date: '',
        chk_exp_date: '',
        stat: '',
        note: '',
        inst_emp_code: 'EMP-10001'
    };
    eqiiCode.value = '';
}

const loadeqirInfo = async (eqiiCode) => {
    // eqii_code가 없다는 것은.. 등록된 mrp가 아님..
    if (eqiiCode != undefined && eqiiCode != null && eqiiCode != '') {
        // console.log(mrpCode);
        const result = await axios.get(`/api/eq/eqirall/${eqiiCode}`);
        eqirList.value = await result.data.data;
    }
    else {
        eqirList.value = [];
    }
}


// 현재 MRP 정보
const eqiiInfo = defineModel('data');
eqiiInfo.value = {
    eqii_code: '',
    inst_date: null,
    chk_exp_date: null,
    stat: '',
    note: '',
    inst_emp_code: 'EMP-10001'
};

// mrp 정보가 바뀌면 하위 자재 갱신하기..
watch(() => eqiiInfo.value, (newVal) => {
    // loadeqiiInfo();
    eqiiCode.value = eqiiInfo.value.eqii_code;
    // console.log(eqiiInfo.value);
    loadeqirInfo(eqiiInfo.value.eqii_code);
})

// 현재 MRP 상세(하위 자재) 정보
const eqirList = defineModel('subData');

watch(() => eqirList.value, (newVal) => {
    let idx = 1;
    eqirList.value.forEach(element => {
        element.eqir_code = idx++;
    });
})

</script>

<template>
    <div>
        <EqiiManageSearch v-model:data="eqiiInfo" @reset-list="resetData" @save-data="saveData"></EqiiManageSearch>
        <EqiiManageTable v-model:subData="eqirList" v-model:eqii="eqiiCode" :dataKey="'eqir_code'" :columns="['eqir_code','eq_name', 'chk_start_date','chk_end_date','chk_detail','note','chk_result','eqi_stat']" title="설비점검항목"></EqiiManageTable>
    </div>

    <!-- 팝업 -->
    
    <!-- 팝업 끝 -->
</template>
