<script setup>
import { CountryService } from '@/service/CountryService';
import { NodeService } from '@/service/NodeService';
import { onMounted, ref } from 'vue';
import { ProductService } from '@/service/ProductService';

const autoValue = ref(null);
const selectedAutoValue = ref(null);
const autoFilteredValue = ref([]);

const treeSelectNodes = ref(null);
const selectedProducts = ref([]);


// const products = ref();
const columns = ref([
    { field: 'prodName', header: '제품명' },
    { field: 'type', header: '유형' },
    { field: 'quantity', header: '수량' },
    { field: 'price', header: '단가' },
    { field: 'deadline', header: '납기일' },
    { field: 'priority', header: '우선순위' },
    { field: 'totalPrice', header: '총액' },
]);



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

const products = ref([
    {
        prodName : '신라면',
        type : '봉지라면',
        quantity : 10,
        price : 1000,
        deadline: '2025.06.05',
        priority : 1,
        totalPrice : 10000,
    },
    {
        prodName : '진라면',
        type : '봉지라면',
        quantity : 20,
        price : 900,
        deadline: '2025.06.05',
        priority : 1,
        totalPrice : 18000,
    },
])
</script>

<template>
    <div>
        <Fluid class="flex flex-col md:flex-row gap-8">
            <div class="md:w-full">
                <div class="card flex flex-col gap-4">
                    <div class="grid grid-cols-1 gap-4">
                        <div class="flex justify-between">
                            <div>
                                <div class="font-semibold text-2xl">기본정보</div>
                            </div>
                            <div class="flex items-center gap-4 flex-nowrap">
                                <Button label="삭제" severity="danger" />
                                <Button label="초기화" severity="contrast" />
                                <Button label="저장" severity="info" />
                                <Button label="주문정보 불러오기" severity="success" class="w-auto whitespace-nowrap" />
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
                            <InputText type="text" :value="new Date().toLocaleDateString()" :disabled="true" class="flex-1" />
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
        <div class="card flex flex-col gap-4">
            <div class="flex justify-between">
                <div>
                    <div class="font-semibold text-2xl">제품</div>
                </div>
                <div>
                    <Button label="삭제" severity="danger" />
                    <Button label="추가" severity="success" class="ml-3" />
                </div>
            </div>
            <DataTable v-model:selection="selectedProducts" :value="products" editMode="cell" @cell-edit-complete="onCellEditComplete"
                :pt="{
                    table: { style: 'min-width: 50rem' },
                    column: {
                        bodycell: ({ state }) => ({
                            class: [{ '!py-0': state['d_editing'] }]
                        })
                    }
                }"
            >
                <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header" style="width: 13%">
                    <template #body="{ data, field }">
                        {{ field === 'price' ? formatCurrency(data[field]) : data[field] }}
                    </template>
                    <template #editor="{ data, field }">
                        <template v-if="field !== 'price'">
                            <InputText v-model="data[field]" autofocus fluid />
                        </template>
                        <template v-else>
                            <InputNumber v-model="data[field]" mode="currency" currency="USD" locale="en-US" autofocus fluid />
                        </template>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>
