<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Pages',
        icon: 'pi pi-fw pi-briefcase',
        to: '/pages',
        items: [
            {
                label: '기준정보',
                items: [
                    {
                        label: '제품 및 BOM 등록',
                        to: '/standard/bom'
                    },
                    {
                        label: '라인 정보',
                        to: '/standard/line'
                    },
                    {
                        label: '공정 흐름도 등록',
                        to: '/standard/proc'
                    },
                    {
                        label: '설비 점검 항목 정보',
                        to: '/standard/eqspectype'
                    },
                    {
                        label: '품질 기준정보',
                        to: '/standard/qcr'
                    },
                ]
            },
            {
                label: '주문',
                items: [
                    {
                        label: '주문서조회',
                        to: '/orderForm/list'
                    },
                    {
                        label: '주문서관리',
                        to: '/orderForm/management'
                    },
                    {
                        label: '출고조회',
                        to: '/releaseForm/list'
                    },
                    {
                        label: '출고관리',
                        to: '/releaseForm/management'
                    },
                    // {
                    //     label: '주문통계 및 보고서',
                    //     to: '/statistics/statis'
                    // }
                ]
            },
            {
                label: '생산',
                items: [
                    {
                        label: '생산계획관리',
                        to: '/productions/manage'
                    },
                    {
                        label: '생산계획조회',
                        to: '/productions/list'
                    },
                    {
                        label: 'MRP관리',
                        to: '/mrp/manage'
                    },
                    {
                        label: 'MRP조회',
                        to: '/mrp/list'
                    },
                    {
                        label: '작업지시서 관리',
                        to: '/wko/manage'
                    },
                    {
                        label: '작업지시서 조회',
                        to: '/wko/list'
                    },
                    // {
                    //     label: '작업진행',
                    //     to: '/work/working'
                    // },
                    {
                        label: '작업진행 목록',
                        to: '/work/list'
                    },
                    {
                        label: '생산실적조회',
                        to: '/performance/list'
                    },
                ]
            },
            {
                label: '품질',
                items: [
                    {
                        label: '품질기준정보',
                        to: '/quality/qualityInspection/QualityStandard'
                    },
                    {
                        label: '품질검사목록',
                        to: '/quality/qualityInspection/QualityList'
                    },
                    {
                        label: '품질검사지시관리',
                        to: '/quality/qualityInspection/QualityManage'
                    }
                ]
            },
            {
                label: '자재',
                items: [
                    {
                        label: '자재구매 요청관리',
                        to: '/mpr/manage'
                    },
                    {
                        label: '자재구매 요청목록',
                        to: '/mpr/list'
                    },
                    // {
                    //     label: '자재구매 상세정보',
                    //     to: '/mpr/detail'
                    // },
                    // {
                    //     label: '발주서 관리',
                    //     to: '/mpo/manage'
                    // },
                    // {
                    //     label: '발주서 목록',
                    //     to: '/mpo/list'
                    // },
                    {
                        label: '자재입고 관리',
                        to: '/min/manage'
                    },
                    {
                        label: '자재입고 내역조회',
                        to: '/min/list'
                    },
                    {
                        label: '자재출고 내역조회',
                        to: '/mout/list'
                    },                    
                    // {
                    //     label: '자재재고 목록조회',
                    //     to: '/mat/inven'
                    // },

                    // {
                    //     label: '완제품입출고 내역조회',
                    //     to: '/product/iobnd'
                    // },
                    //                     {
                    //     label: '완제품재고 목록조회',
                    //     to: '/product/list'
                    // },
                ]
            },
            {
                label: '설비',
                items: [
                    {
                        label: '설비정보',
                        to: '/equipment/eqinfo'
                    },
                    {
                        label: '설비점검 지시서',
                        to: '/equipment/eqiilist'
                    },
                    {
                        label: '점검 지시 목록',
                        to: '/equipment/iilist'
                    },
                    {
                        label: '설비점검 조치관리',
                        to: '/equipment/eqiiresmg'
                    },
                    {
                        label: '설비점검 조치목록',
                        to: '/equipment/eqiiresmglist'
                    },
                ]
            },
        ]
    },
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
