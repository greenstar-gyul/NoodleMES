<script setup>
import { CountryService } from '@/service/CountryService';
import { NodeService } from '@/service/NodeService';
import { onMounted, ref } from 'vue';
import MultiplePopup from '@/components/popup/MultiplePopup.vue';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import orderMapping from '@/service/OrderMapping';
import TableWithAddDel from '@/components/form/TableWithAddDel.vue';
import mrpMapping from '@/service/MRPMapping';
import MRPManageSearch from './mrp-sub/MRPManageSearch.vue';
import bomSubMapping from '@/service/BOMSubMapping';
import EditableTable from '@/components/form/EditableTable.vue';
import MRPService from '../../service/MRPService';

// 팝업 visible 상태
const dialogVisible = ref(false);
// 팝업 visible 상태 끝

const autoValue = ref(null);
const selectedAutoValue = ref(null);
const autoFilteredValue = ref([]);

const treeSelectNodes = ref(null);
const selectedProducts = ref([]);

const selectedOrder = ref(null);

const mats = ref([]); 
const popupMats = ref([]); // 하위자재 추가 팝업 내부 자재들
const matList = ref([]);
//팝업 끝


onMounted(() => {
    CountryService.getCountries().then((data) => (autoValue.value = data));
    NodeService.getTreeNodes().then((data) => (treeSelectNodes.value = data));
    // ProductService.getProductsMini().then((data) => (products.value = data));

    popupMats.value = MRPService.popupMats;
});

function searchCountry(event) {
    setTimeout(() => {
        if (!event.query.trim().length) {
            autoFilteredValue.value = [...autoValue.value];
        } else {
            autoFilteredValue.value = autoValue.value.filter((country) => {
                return country.name.toLowerCase().startsWith(event.query.toLowerCase());
            });
        }
    }, 250);
}

const onCellEditComplete = (event) => {
    let { data, newValue, field } = event;

    switch (field) {
        case 'quantity':
        case 'price':
            if (isPositiveInteger(newValue)) data[field] = newValue;
            else event.preventDefault();
            break;

        default:
            if (newValue.trim().length > 0) data[field] = newValue;
            else event.preventDefault();
            break;
    }
};

const isPositiveInteger = (val) => {
    let str = String(val);

    str = str.trim();

    if (!str) {
        return false;
    }

    str = str.replace(/^0+/, '') || '0';
    var n = Math.floor(Number(str));

    return n !== Infinity && String(n) === str && n >= 0;
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

const openPopup = () => {
    dialogVisible.value = true;
}

const popupMatsConfirm = (values) => {
    // console.log(values);
    values.forEach(element => {
        mats.value.push(element);
    });
}

</script>

<template>
    <div>
        <MRPManageSearch></MRPManageSearch>
        <TableWithAddDel :data="mats" :dataKey="'mat_code'" :mapper="mrpMapping" @open-popup="openPopup()" title="자재"></TableWithAddDel>
    </div>

    <!-- 팝업 -->
    <MultiplePopup v-model:visible="dialogVisible" :items="popupMats" @confirm="popupMatsConfirm" :mapper="bomSubMapping" :dataKey="'mat_code'"></MultiplePopup>
    <!-- 팝업 끝 -->
</template>
