<script setup>
import { CountryService } from '@/service/CountryService';
import { NodeService } from '@/service/NodeService';
import { onMounted, ref } from 'vue';
import MultiplePopup from '@/components/popup/MultiplePopup.vue';
import SinglePopup from '@/components/popup/SinglePopup.vue';
import orderMapping from '@/service/OrderMapping';
import TableWithAddDel from '@/components/form/TableWithAddDel.vue';
import mrpMapping from '@/service/MRPMapping';
import bomSubMapping from '@/service/BOMSubMapping';
import EditableTable from '@/components/form/EditableTable.vue';
import WKOManageSearch from './wko-sub/WKOManageSearch.vue';

// 팝업 visible 상태
const dialogVisible = ref(false);
// 팝업 visible 상태 끝

const autoValue = ref(null);
const selectedAutoValue = ref(null);
const autoFilteredValue = ref([]);

const treeSelectNodes = ref(null);
const selectedProducts = ref([]);

const selectedOrder = ref(null);
//팝업 끝


onMounted(() => {
    CountryService.getCountries().then((data) => (autoValue.value = data));
    NodeService.getTreeNodes().then((data) => (treeSelectNodes.value = data));
    // ProductService.getProductsMini().then((data) => (products.value = data));
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

const matsFields = ref([
    "mat_code",
    "mat_name",
    "unit",
    "req_qtt",
    "cur_qtt",
    "plan_date",
    "proposal_date",
    "mrp_status"
]);

const mats = ref([  {
    mat_code: "MAT-001",
    mat_name: "밀가루",
    unit: "kg",
    req_qtt: 150,
    cur_qtt: 200,
    plan_date: "2025-06-10",
    proposal_date: "2025-06-08",
    mrp_status: "충분"
},
{
    mat_code: "MAT-002",
    mat_name: "스프",
    unit: "kg",
    req_qtt: 80,
    cur_qtt: 200,
    plan_date: "2025-06-12",
    proposal_date: "2025-06-09",
    mrp_status: "충분"
},
{
    mat_code: "MAT-003",
    mat_name: "건더기 스프",
    unit: "kg",
    req_qtt: 120,
    cur_qtt: 200,
    plan_date: "2025-06-11",
    proposal_date: "2025-06-08",
    mrp_status: "충분"
},
{
    mat_code: "MAT-004",
    mat_name: "용기",
    unit: "EA",
    req_qtt: 1000,
    cur_qtt: 200,
    plan_date: "2025-06-13",
    proposal_date: "2025-06-10",
    mrp_status: "부족"
},
{
    mat_code: "MAT-005",
    mat_name: "뚜껑",
    unit: "EA",
    req_qtt: 1000,
    cur_qtt: 200,
    plan_date: "2025-06-13",
    proposal_date: "2025-06-10",
    mrp_status: "부족"
}
]);

const popupMats = ref([
    {
        mat_code: 'MAT-001',
        mat_name: '밀가루',
        mat_type: '원자재',
        req_qtt: '1t',
        spec: '100g',
        loss_rate: '0.5%'
    },
    {
        mat_code: 'MAT-002',
        mat_name: '스프',
        mat_type: '원자재',
        req_qtt: '660kg',
        spec: '20g',
        loss_rate: '0.5%'
    },
    {
        mat_code: 'MAT-003',
        mat_name: '비닐포장지',
        mat_type: '부자재',
        req_qtt: '1000EA',
        spec: '100mm',
        loss_rate: '-'
    },
    {
        mat_code: 'MAT-004',
        mat_name: '식용유',
        mat_type: '원자재',
        req_qtt: '50L',
        spec: '500ml',
        loss_rate: '0.5%'
    },
    {
        mat_code: 'MAT-005',
        mat_name: '컵용기',
        mat_type: '부자재',
        req_qtt: '1000EA',
        spec: '60g',
        loss_rate: '-'
    },
    {
        mat_code: 'MAT-006',
        mat_name: '포장박스',
        mat_type: '부자재',
        req_qtt: '200EA',
        spec: '450mm x 300mm x 300mm',
        loss_rate: '-'
    }
]);

const openPopup = () => {
    dialogVisible.value = true;
}

</script>

<template>
    <div>
        <!--
        <Fluid class="flex flex-col md:flex-row gap-8">
            <div class="md:w-full">
                <div class="card flex flex-col gap-4">
                    <div class="grid grid-cols-1 gap-4">
                        <div class="flex justify-between">
                            <div>
                                <div class="font-semibold text-2xl">기본정보</div>
                            </div>
                            <div class="flex items-center gap-2 flex-nowrap">
                                <Button label="삭제" severity="danger" class="min-w-fit" />
                                <Button label="초기화" severity="contrast" class="min-w-fit" />
                                <Button label="저장" severity="info" class="min-w-fit" />
                                <Button label="주문정보 불러오기" severity="success" class="min-w-fit whitespace-nowrap"
                                    @click="dialogVisible = true" />
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="flex items-center gap-3">
                            <div class="font-semibold text-xl w-32">주문번호</div>
                            <InputText type="text" placeholder="주문번호" :disabled="true" class="flex-1" />
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="font-semibold text-xl w-32">주문명</div>
                            <InputText type="text" class="flex-1" />
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="flex items-center gap-3">
                            <div class="font-semibold text-xl w-32">주문일자</div>
                            <InputText type="text" :value="new Date().toLocaleDateString()" :disabled="true"
                                class="flex-1" />
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="font-semibold text-xl w-32">거래처</div>
                            <AutoComplete v-model="selectedAutoValue" :suggestions="autoFilteredValue"
                                optionLabel="name" placeholder="선택" dropdown multiple display="chip"
                                @complete="searchCountry($event)" class="flex-1" />
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="flex items-center gap-3">
                            <div class="font-semibold text-xl w-32">거래처담당자</div>
                            <AutoComplete v-model="selectedAutoValue" :suggestions="autoFilteredValue"
                                optionLabel="name" placeholder="선택" dropdown multiple display="chip"
                                @complete="searchCountry($event)" class="flex-1" />
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="font-semibold text-xl w-32">비고</div>
                            <Textarea placeholder="특이사항 입력" :autoResize="true" rows="1" cols="30" class="flex-1" />
                        </div>
                    </div>
                </div>
            </div>
        </Fluid>
        -->
        <WKOManageSearch></WKOManageSearch>
        <TableWithAddDel :data="mats" :dataKey="'mat_code'" :mapper="mrpMapping" @open-popup="openPopup()" title="공정 순서"></TableWithAddDel>
        <!-- <EditableTable :fields="matsFields" :dataKey="'mat_code'" :mapper="mrpMapping" title="자재"></EditableTable> -->
    </div>

    <!-- 팝업 -->
    <!-- <SinglePopup v-model:visible="dialogVisible" :orders="orders" @confirm="handleConfirm"></SinglePopup> -->
    <MultiplePopup v-model:visible="dialogVisible" :items="popupMats" @confirm="handleConfirm" :mapper="bomSubMapping" :dataKey="'mat_code'"></MultiplePopup>
    <!-- 팝업 끝 -->
</template>
