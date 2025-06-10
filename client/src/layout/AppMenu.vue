<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
    },
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
                        label: '거래처 정보',
                        to: '/auth/error'
                    },
                    {
                        label: '공정 정보',
                        to: '/auth/access'
                    },
                    {
                        label: '설비 점검 항목 정보',
                        to: '/standard/eqspectype'
                    }
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
                    {
                        label: '주문통계 및 보고서',
                        to: '/releaseForm/management'
                    }
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
                        label: 'Access Denied',
                        to: '/auth/access'
                    }
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
                        label: '품질검사관리',
                        to: '/quality/qualityInspection/QualityManage'
                    },
                    {
                        label: '품질검사결과',
                        to: '/quality/qualityResults/QualityResults'
                    },
                    {
                        label: '품질결과목록',
                        to: '/quality/qualityResults/QualityRList'
                    },
                    {
                        label: '품질후속조치',
                        to: '/quality/quality_end/qualityAS'
                    },
                    {
                        label: '품질통계',
                        to: '/quality/quality_end/qualitySD'
                    }
                ]
            },
            {
                label: '자재',
                items: [
                    {
                        label: '자재구매요청목록',
                        to: '/material/list'
                    },
                    {
                        label: '자재구매요청관리',
                        to: '/material/manage'
                    },
                    {
                        label: 'Access Denied',
                        to: '/auth/access'
                    }
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
                        label: '설비점검 결과 조회',
                        to: '/equipment/eqiires'
                    },
                    {
                        label: '설비점검 결과 관리',
                        to: '/equipment/eqiiresmg'
                    },
                    {
                        label: '설비점검 조치관리',
                        to: '/equipment/eqiima'
                    },
                    {
                        label: '설비 가동현황',
                        to: '/equipment/eqiilist'
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
