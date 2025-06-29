<script setup>
import { ref, watch, nextTick } from 'vue';
import Button from 'primevue/button';
import LabeledTextarea from '../../../components/registration-bar/LabeledTextarea.vue';
import LabeledInput from '../../../components/registration-bar/LabeledInput.vue';
import axios from 'axios';
import eqiiresmgMapping from '@/service/EquipIIResMgMapping.js';
import eqirmgsinglePopup from '@/views/equipment/components/EqirmgSinglePopup.vue';
import LabeledDatePicker from '../../../components/registration-bar/LabeledDatePicker.vue';
import EqirSinglePopup from './EqirSinglePopup.vue';
import LabeledSelect from '../../../components/registration-bar/LabeledSelect.vue';
import moment from 'moment';
import LabeledDateTimePicker from '../../../components/registration-bar/LabeledDateTimePicker.vue';

const emit = defineEmits(['updateList', 'updatePrdp', 'resetList', 'saveData', 'update:data']);
const isInternalUpdate = ref(false);
const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    dataKey: {
        type: String,
        default: 'id'
    }
});

const formatDateForDB = (date) => {
    if (!date) return null;
    return moment(date).format('YYYY-MM-DD HH:mm');
};

const parseDate = (dateString) => {
    if (!dateString) return null;
    if (typeof dateString === 'string') {
        return new Date(dateString);
    }
    return dateString;
};

const currentData = ref({
    eq_ma_code: '',
    eq_name: '',
    fail_date: new Date(),
    fail_cause: '',
    act_detail: '',
    act_result: '',
    start_date: new Date(),
    end_date: new Date(),
    re_chk_exp_date: new Date(),
    eqir_code: '',
    regdate: new Date(),
    note: '',
    m_emp_name: 'EMP-10001',
    fix_emp_name: 'EMP-10001'
});

watch(() => props.data, (newData) => {
    if (newData && !isInternalUpdate.value) {
        currentData.value = {
            eq_ma_code: newData.eq_ma_code || '',
            eq_name: newData.eq_name || '',
            fail_date: newData.fail_date,
            fail_cause: newData.fail_cause || '',
            act_detail: newData.act_detail || '',
            act_result: newData.act_result || '',
            start_date: newData.start_date,
            end_date: newData.end_date,
            re_chk_exp_date: newData.re_chk_exp_date,
            eqir_code: newData.eqir_code || '',
            regdate: newData.regdate,
            note: newData.note || '',
            m_emp_name: newData.m_emp_name || '최설비',
            fix_emp_name: newData.fix_emp_name || '최설비'
        };
    }
}, { immediate: true, deep: true });


const isSameDateValue = (oldVal, newVal) => {
    if (!oldVal && !newVal) return true;
    if (!oldVal || !newVal) return false;

    const oldStr = oldVal instanceof Date ? moment(oldVal).format('YYYY-MM-DD HH:mm') : oldVal;
    const newStr = newVal instanceof Date ? moment(newVal).format('YYYY-MM-DD HH:mm') : newVal;
    return oldStr === newStr;
};

const updateFailDate = (newDate) => {
    if (isSameDateValue(props.data.fail_date, newDate)) {
        return;
    }

    isInternalUpdate.value = true;
    const updatedData = {
        ...props.data,
        fail_date: newDate
    };
    emit('update:data', updatedData);
    nextTick(() => {
        isInternalUpdate.value = false;
    });
};

const updateStartDate = (newDate) => {
    if (isSameDateValue(props.data.start_date, newDate)) {
        return;
    }

    isInternalUpdate.value = true;
    const updatedData = {
        ...props.data,
        start_date: newDate
    };
    emit('update:data', updatedData);
    nextTick(() => {
        isInternalUpdate.value = false;
    });
};

const updateEndDate = (newDate) => {
    if (isSameDateValue(props.data.end_date, newDate)) {
        return;
    }

    isInternalUpdate.value = true;
    const updatedData = {
        ...props.data,
        end_date: newDate
    };
    emit('update:data', updatedData);
    nextTick(() => {
        isInternalUpdate.value = false;
    });
};

const updateReChkExpDate = (newDate) => {
    if (isSameDateValue(props.data.re_chk_exp_date, newDate)) {
        return;
    }

    isInternalUpdate.value = true;
    const updatedData = {
        ...props.data,
        re_chk_exp_date: newDate
    };
    emit('update:data', updatedData);
    nextTick(() => {
        isInternalUpdate.value = false;
    });
};

const updateRegDate = (newDate) => {
    if (isSameDateValue(props.data.regdate, newDate)) {
        return;
    }

    isInternalUpdate.value = true;
    const updatedData = {
        ...props.data,
        regdate: newDate
    };
    emit('update:data', updatedData);
    nextTick(() => {
        isInternalUpdate.value = false;
    });
};

const updateEqName = (newName) => {
    if (props.data.eq_name === newName) {
        return;
    }

    isInternalUpdate.value = true;
    const updatedData = {
        ...props.data,
        eq_name: newName
    };
    emit('update:data', updatedData);
    nextTick(() => {
        isInternalUpdate.value = false;
    });
};

const updateFailCause = (newCause) => {
    if (props.data.fail_cause === newCause) {
        return;
    }
    
    isInternalUpdate.value = true;
    const updatedData = {
        ...props.data,
        fail_cause: newCause
    };
    emit('update:data', updatedData);
    nextTick(() => {
        isInternalUpdate.value = false;
    });
};

const updateActDetail = (newDetail) => {
    if (props.data.act_detail === newDetail) {
        return;
    }
    
    isInternalUpdate.value = true;
    const updatedData = {
        ...props.data,
        act_detail: newDetail
    };
    emit('update:data', updatedData);
    nextTick(() => {
        isInternalUpdate.value = false;
    });
};

const updateActResult = (newResult) => {
    if (props.data.act_result === newResult) {
        return;
    }
    
    isInternalUpdate.value = true;
    const updatedData = {
        ...props.data,
        act_result: newResult
    };
    emit('update:data', updatedData);
    nextTick(() => {
        isInternalUpdate.value = false;
    });
};

const updateEqirCode = (newCode) => {
    if (props.data.eqir_code === newCode) {
        return;
    }
    
    isInternalUpdate.value = true;
    const updatedData = {
        ...props.data,
        eqir_code: newCode
    };
    emit('update:data', updatedData);
    nextTick(() => {
        isInternalUpdate.value = false;
    });
};

const updateNote = (newNote) => {
    if (props.data.note === newNote) {
        return;
    }
    
    isInternalUpdate.value = true;
    const updatedData = {
        ...props.data,
        note: newNote
    };
    emit('update:data', updatedData);
    nextTick(() => {
        isInternalUpdate.value = false;
    });
};

const deletePlan = async () => {
    if (!currentData.value.eq_ma_code) {
        alert('삭제할 지시서가 없습니다.');
        return;
    }

    if (!confirm('정말로 이 지시서를 삭제하시겠습니까?')) {
        return;
    }

    try {
        const response = await axios.delete(`/api/eq/eqirmg/${currentData.value.eq_ma_code}`);

        if (response.data.success) {
            alert('삭제에 성공했습니다.');
            emit('resetList');
        } else {
            alert('삭제에 실패했습니다.');
        }
    } catch (error) {
        alert('삭제 중 오류가 발생했습니다.');
    }
};

const statusOptions = [
    { label: '조치중', value: 'g1' },
    { label: '조치완료', value: 'g2' }
];

const statusMapping = {
    'g1': '조치중',
    'g2': '조치완료'
};

const loadPlansData = async () => {
    try {
        const response = await axios.get(`/api/eq/eqirmg`);

        eqirmgs.value = response.data.map(item => ({
            ...item,
            fail_date: item.fail_date ? moment(item.fail_date).format('YYYY-MM-DD') : null,
            start_date: item.start_date ? moment(item.start_date).format('YYYY-MM-DD HH:mm') : null,
            end_date: item.end_date ? moment(item.end_date).format('YYYY-MM-DD HH:mm') : null,
            re_chk_exp_date: item.re_chk_exp_date ? moment(item.re_chk_exp_date).format('YYYY-MM-DD') : null,
            regdate: item.regdate ? moment(item.regdate).format('YYYY-MM-DD HH:mm') : null,
            act_result: statusMapping[item.act_result] || item.act_result || '미정'
        }));

    } catch (err) {
        alert('조치 결과 데이터를 불러오는 데 실패했습니다.');
    }
};

const loadSelectedPlan = async (value) => {
    if (!value || !value.eq_ma_code) {
        alert('지시서를 선택해주세요.');
        return;
    }

    // 내부 업데이트 플래그 설정
    isInternalUpdate.value = true;

    const newData = {
        eq_ma_code: value.eq_ma_code,
        eq_name: value.eq_name,
        fail_date: formatDateForDB(value.fail_date),
        fail_cause: value.fail_cause || '',
        act_detail: value.act_detail || '',
        act_result: value.act_result || '',
        start_date: formatDateForDB(value.start_date),
        end_date: formatDateForDB(value.end_date),
        re_chk_exp_date: formatDateForDB(value.re_chk_exp_date),
        eqir_code: value.eqir_code || '',
        regdate: formatDateForDB(value.regdate),
        note: value.note || '',
        m_emp_name: value.m_emp_name || 'EMP-10001',
        fix_emp_name: value.fix_emp_name || 'EMP-10001'
    };

    currentData.value = {
        ...currentData.value,
        ...newData,
        fail_date: formatDateForDB(newData.fail_date),
        start_date: formatDateForDB(newData.start_date),
        end_date: formatDateForDB(newData.end_date),
        re_chk_exp_date: formatDateForDB(newData.re_chk_exp_date),
        regdate: formatDateForDB(newData.regdate)
    };

    emit('update:data', newData);

    nextTick(() => {
        isInternalUpdate.value = false;
    });

    eqirmgPopupVisibil.value = false;
};

const loadEqirData = async () => {
    try {
        const response = await axios.get('/api/eq/eqirall');

        if (Array.isArray(response.data)) {
            eqirss.value = response.data.map(item => ({
                ...item,
                chk_start_date: item.chk_start_date ? moment(item.chk_start_date).format('YYYY-MM-DD HH:mm') : null,
                chk_end_date: item.chk_end_date ? moment(item.chk_end_date).format('YYYY-MM-DD HH:mm') : null
            }));
        } else if (response.data && response.data.data) {
            eqirss.value = response.data.data.map(item => ({
                ...item,
                chk_start_date: item.chk_start_date ? moment(item.chk_start_date).format('YYYY-MM-DD HH:mm') : null,
                chk_end_date: item.chk_end_date ? moment(item.chk_end_date).format('YYYY-MM-DD HH:mm') : null
            }));
        }

    } catch (err) {
        alert('점검결과 데이터를 불러오는 데 실패했습니다.');
    }
};


const loadSelectedEqirPlan = async (value) => {
    if (!value || !value.eqir_code) {
        alert('점검 결과를 선택해주세요.');
        return;
    }

    isInternalUpdate.value = true;

    const updatedData = {
        ...props.data,
        eqir_code: value.eqir_code,
        eq_name: value.eq_name || ''
    };

    currentData.value.eqir_code = value.eqir_code;
    currentData.value.eq_name = value.eq_name || '';
    emit('update:data', updatedData);

    nextTick(() => {
        isInternalUpdate.value = false;
    });

    eqirPopupVisibil.value = false;
};


const openPopup = async () => {
    await loadPlansData();
    eqirmgPopupVisibil.value = true;
}

const openEqirPopup = async () => {
    await loadEqirData();
    eqirPopupVisibil.value = true;
};

const saveMRP = async () => {
    emit('saveData');
}

const eqirmgPopupVisibil = ref(false);
const eqirPopupVisibil = ref(false);
const eqirmgs = ref([]);
const eqirss = ref([]);
</script>

<template>
    <div class="p-6 bg-gray-50 shadow-md rounded-md space-y-12">
        <div class="grid grid-cols-1 gap-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl"><b>조치 결과 정보</b></div>
                </div>
                <div class="flex items-center gap-2 flex-nowrap">
                    <Button label="삭제" severity="danger" class="min-w-fit" @click="deletePlan" />
                    <Button label="초기화" severity="contrast" class="min-w-fit" v-on:click="emit('resetList')" />
                    <Button label="저장" severity="info" class="min-w-fit" v-on:click="saveMRP" />
                    <Button label="조치결과 불러오기" severity="success" class="min-w-fit whitespace-nowrap"
                        @click="openPopup" />
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="조치 코드" :model-value="currentData.eq_ma_code" :disabled="true"
                placeholder="저장 시 자동으로 생성됩니다." />
            <LabeledInput label="설비명" :model-value="currentData.eq_name" :disabled="true"
                @update:model-value="updateEqName" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledDatePicker label="고장일" :model-value="currentData.fail_date" @update:model-value="updateFailDate" />
            <LabeledTextarea label="고장원인" :model-value="currentData.fail_cause" @update:model-value="updateFailCause" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledTextarea label="조치내용" :model-value="currentData.act_detail" @update:model-value="updateActDetail" />
            <LabeledSelect label="조치결과" :model-value="currentData.act_result" @update:model-value="updateActResult"
                :options="statusOptions" placeholder="상태를 선택하세요" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledDateTimePicker label="조치시작일시" :model-value="currentData.start_date"
                @update:model-value="updateStartDate" />
            <LabeledDateTimePicker label="조치종료일시" :model-value="currentData.end_date"
                @update:model-value="updateEndDate" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledDatePicker label="재점검예정일" :model-value="currentData.re_chk_exp_date"
                @update:model-value="updateReChkExpDate" />
            <LabeledDatePicker label="등록일자" :model-value="currentData.regdate" @update:model-value="updateRegDate" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="담당자" :model-value="currentData.m_emp_name" :disabled="true" />
            <LabeledInput label="수리요청자" :model-value="currentData.fix_emp_name" :disabled="true" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledInput label="유지보수 코드" :model-value="currentData.eqir_code" @click="openEqirPopup"
                @update:model-value="updateEqirCode" placeholder="클릭하여 유지보수 코드를 선택하세요" readonly style="cursor: pointer;" />
            <LabeledTextarea label="비고" :model-value="currentData.note" @update:model-value="updateNote" />
        </div>
    </div>

    <eqirmgsinglePopup v-model:visible="eqirmgPopupVisibil" :items="eqirmgs" @confirm="loadSelectedPlan"
        :selectedHeader="['eq_ma_code', 'eq_name', 'fail_date', 'act_detail', 'act_result']" :mapper="eqiiresmgMapping"
        :visibleFields="['eq_ma_code', 'eq_name', 'fail_date', 'act_detail', 'act_result']" :dataKey="'eq_ma_code'"
        :placeholder="'조치결과 불러오기'">
    </eqirmgsinglePopup>
    <EqirSinglePopup v-model:visible="eqirPopupVisibil" :items="eqirss" @confirm="loadSelectedEqirPlan"
        :selectedHeader="['eqir_code', 'eq_name', 'chk_start_date', 'chk_end_date', 'eqi_stat']" :mapper="{
            eqir_code: '유지보수 코드',
            eq_name: '설비명',
            chk_start_date: '점검 시작일시',
            chk_end_date: '점검 종료일시',
            eqi_stat: '상태'
        }" :visibleFields="['eqir_code', 'eq_name', 'chk_start_date', 'chk_end_date', 'eqi_stat']"
        :dataKey="'eqir_code'" :placeholder="'유지보수 선택'">
    </EqirSinglePopup>
</template>