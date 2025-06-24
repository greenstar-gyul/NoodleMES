<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import EqiiManageSearch from './components/EqiiManageSearch.vue';
import EqiiManageTable from './components/EqiiManageTable.vue';
import axios from 'axios';
import moment from 'moment';

const currentEqiiCode = ref('');
const route = useRoute();

const eqiiInfo = ref({
    eqii_code: '',
    inst_date: null,
    chk_exp_date: null,
    stat: '',
    note: '',
    inst_emp_name: 'EMP-10001',
    inst_emp_code: 'EMP-10001'
});

const eqirList = ref([]);

const getEqiiCodeFromRoute = () => {
    const eqiiCodeParam = route.params.eqiiCode;
    return eqiiCodeParam || '';
}

watch(currentEqiiCode, async (newCode, oldCode) => {
    
    if (newCode && newCode !== oldCode) {
        await loadEqirInfo(newCode);
    }
}, { immediate: true });

watch(
    () => eqiiInfo.value.eqii_code, 
    async (newCode) => {
        if (newCode && newCode !== currentEqiiCode.value) {
            currentEqiiCode.value = newCode;
            await loadEqirInfo(newCode);
        }
    },
    { immediate: true }
);

const loadEqiiDataByCode = async (eqiiCodeParam) => {
    if (!eqiiCodeParam) return;

    try {
        const response = await axios.get(`/api/eq/eqii/${eqiiCodeParam}`);

        if (response.data && response.data.data) {
            eqiiInfo.value = {
                ...response.data.data,
                inst_date: response.data.data.inst_date ? new Date(response.data.data.inst_date) : null,
                chk_exp_date: response.data.data.chk_exp_date ? new Date(response.data.data.chk_exp_date) : null
            };
            currentEqiiCode.value = eqiiInfo.value.eqii_code;
        }
    } catch (error) {
        alert('설비점검지시 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
};

onMounted(async () => {
    const eqiiCodeFromRoute = getEqiiCodeFromRoute();

    if (eqiiCodeFromRoute) {
        await loadEqiiDataByCode(eqiiCodeFromRoute);
    }
});

const formatDateForDB = (date) => {
    if (!date) return null;
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

const formatDateTimeForDB = (date) => {
    if (!date) return null;
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

const validateData = () => {
    if (!eqiiInfo.value.inst_date) {
        alert('지시일자를 입력해주세요.');
        return false;
    }
    if (!eqiiInfo.value.chk_exp_date) {
        alert('점검예정일을 입력해주세요.');
        return false;
    }
    if (!eqiiInfo.value.stat) {
        alert('상태를 선택해주세요.');
        return false;
    }

    if (!eqirList.value || eqirList.value.length === 0) {
        alert('점검항목을 추가해주세요.');
        return false;
    }

    for (let i = 0; i < eqirList.value.length; i++) {
        const item = eqirList.value[i];
        if (!item.chk_text || item.chk_text === '항목 선택') {
            alert(`${i + 1}번째 점검항목을 선택해주세요.`);
            return false;
        }
        if (!item.eq_name || item.eq_name === '설비 선택') {
            alert(`${i + 1}번째 설비를 선택해주세요.`);
            return false;
        }
        if (!item.chk_start_date) {
            alert(`${i + 1}번째 점검시작일시를 입력해주세요.`);
            return false;
        }
        if (!item.chk_end_date) {
            alert(`${i + 1}번째 점검종료일시를 입력해주세요.`);
            return false;
        }
    }

    return true;
};

const saveData = async () => {
    if (!confirm('설비점검지시 정보를 저장하시겠습니까?')) {
        alert('저장을 취소했습니다.');
        return;
    }

    if (!validateData()) {
        return;
    }

    try {
        const eqiiDataForServer = {
            ...eqiiInfo.value,
            inst_date: formatDateForDB(eqiiInfo.value.inst_date),
            chk_exp_date: formatDateForDB(eqiiInfo.value.chk_exp_date),
            inst_emp_name: eqiiInfo.value.inst_emp_code || 'EMP-10001'
        };

        const eqirDataForServer = eqirList.value.map(item => ({
            ...item,
            chk_start_date: formatDateTimeForDB(item.chk_start_date),
            chk_end_date: formatDateTimeForDB(item.chk_end_date),
            inst_emp_name: eqiiInfo.value.inst_emp_code || 'EMP-10001',
            eqii_code: eqiiInfo.value.eqii_code
        }));

        const requestData = {
            eqiiData: eqiiDataForServer,
            detailData: eqirDataForServer
        };

        console.log('Saving data:', requestData);

        let response;
        if (!eqiiInfo.value.eqii_code) {
            response = await axios.post(`/api/eq/eqii/save-all`, requestData);
        } else {
            response = await axios.put(`/api/eq/eqii/save-all/${eqiiInfo.value.eqii_code}`, requestData);
        }

        const result = response.data;

        if (result.success && result.data.result_code === "SUCCESS") {
            alert('저장에 성공했습니다.');

            if (result.data.eqii_code && !eqiiInfo.value.eqii_code) {
                eqiiInfo.value.eqii_code = result.data.eqii_code;
                currentEqiiCode.value = result.data.eqii_code;
                await loadEqirInfo(result.data.eqii_code);
            }
        } else {
            alert('저장에 실패했습니다. 다시 시도해주세요.');
        }
    } catch (error) {
        alert('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
};

const resetData = () => {
    eqirList.value = [];
    eqiiInfo.value = {
        eqii_code: '',
        inst_date: null,
        chk_exp_date: null,
        stat: '',
        note: '',
        inst_emp_name: 'EMP-10001',
        inst_emp_code: 'EMP-10001'
    };
    currentEqiiCode.value = '';
};

const loadEqirInfo = async (eqiiCodeParam) => {
    if (eqiiCodeParam && eqiiCodeParam !== '') {
        try {
            const result = await axios.get(`/api/eq/eqirall/${eqiiCodeParam}`);
            eqirList.value = result.data;
        } catch (error) {
            eqirList.value = [];
        }
    } else {
        eqirList.value = [];
    }
};

const updateEqiiInfo = (newData) => {

    const hasChanges = Object.keys(newData).some(key =>
        eqiiInfo.value[key] !== newData[key]
    );

    if (!hasChanges) {
        return;
    }

    eqiiInfo.value = { ...eqiiInfo.value, ...newData };

    if (newData.eqii_code && newData.eqii_code !== currentEqiiCode.value) {
        currentEqiiCode.value = newData.eqii_code;
        loadEqirInfo(newData.eqii_code);
    }
};

const updateEqirList = async (newList) => {
    eqirList.value = newList;
}

</script>


<template>
    <div>
        <EqiiManageSearch :data="eqiiInfo" @update:data="updateEqiiInfo" @reset-list="resetData" @save-data="saveData">
        </EqiiManageSearch>

        <EqiiManageTable
            :subData="eqirList" 
            @update:subData="updateEqirList" 
            :eqii="currentEqiiCode"
            :dataKey="'eqir_code'"
            :columns="['eqir_code', 'eq_name', 'chk_start_date', 'chk_end_date', 'chk_detail', 'note', 'chk_result', 'eqi_stat']"
            title="설비점검항목">
        </EqiiManageTable>
    </div>
</template>