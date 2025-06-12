<script setup>
import { CountryService } from '@/service/CountryService';
import { NodeService } from '@/service/NodeService';
import { onMounted, ref } from 'vue';
import MultiplePopup from '@/components/popup/MultiplePopup.vue';
import TableWithAddDel from '@/components/form/TableWithAddDel.vue';
import mrpMapping from '@/service/MRPMapping';
import MRPManageSearch from './mrp-sub/MRPManageSearch.vue';
import bomSubMapping from '@/service/BOMSubMapping';
import MRPService from '../../service/MRPService';

// 팝업 visible 상태
const dialogVisible = ref(false);
// 팝업 visible 상태 끝

const autoValue = ref(null);

const treeSelectNodes = ref(null);

const mats = ref([]); 
const popupMats = ref([]);  // 하위자재 추가 팝업 내부 자재들
const matList = ref([]);    // 하위자재 필터 목록
const selMatList = ref([]); // 하위자재 테이블 요소 선택 목록
//팝업 끝
const mrpDetailList = ref([]); // 하위자재 테이블 요소 목록
const prdpCode = ref(null);

onMounted(() => {
    CountryService.getCountries().then((data) => (autoValue.value = data));
    NodeService.getTreeNodes().then((data) => (treeSelectNodes.value = data));
    // ProductService.getProductsMini().then((data) => (products.value = data));

    popupMats.value = MRPService.popupMats;
    mats.value = MRPService.mats;
});

const openPopup = () => {
    if (prdpCode.value == null || prdpCode.value == '') {
        alert('생산계획을 먼저 불러오삼.');
        return;
    }
    console.log(prdpCode.value);
    dialogVisible.value = true;
}

const popupMatsConfirm = (values) => {
    // console.log(values);
    values.forEach(element => {
        // console.log(element['mat_code']);
        matList.value.push(element['mat_code']);
        selMatList.value.push(mats.value.find(item => {
            if (element['mat_code'] == item.mat_code) {
                // console.log(item);
                return true;
            }
        }));

        // mats.value.push(element);
    });

    // console.log(selMatList.value);
}

const updateMRPDetailList = (values) => {
    // console.log(values);
    selMatList.value = values;
}

const updatePrdpCode = (value) => {
    prdpCode.value = value;
}

const resetData = () => {
    selMatList.value = [];
}

</script>

<template>
    <div>
        <MRPManageSearch v-on:update-list="updateMRPDetailList" @update-prdp="updatePrdpCode" @reset-list="resetData"></MRPManageSearch>
        <!-- <TableWithAddDel v-model:data="selMatList" :dataKey="'mat_code'" :mapper="mrpMapping" @open-popup="openPopup()" title="자재" :columns="['mat_code','mat_name','unit','req_qtt','cur_qtt','plan_date','proposal_date','mrp_status']"></TableWithAddDel> -->
        <TableWithAddDel v-model:data="selMatList" :dataKey="'mat_code'" :mapper="mrpMapping" @open-popup="openPopup()" title="자재"></TableWithAddDel>
    </div>

    <!-- 팝업 -->
    <MultiplePopup v-model:visible="dialogVisible" :items="popupMats" @confirm="popupMatsConfirm" :mapper="bomSubMapping" :dataKey="'mat_code'"></MultiplePopup>
    <!-- 팝업 끝 -->
</template>
