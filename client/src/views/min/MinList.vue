<!--
자재입고조회
-->

<script setup>
import { ref } from 'vue';
import MinListSearch from './min-list-sub/MinListSearch.vue';
import MinListTable from './min-list-sub/MinListTable.vue';

</script>


<template>
  <MinListSearch 
    :mInBndCode="mInBndCode"
    :matCode="matCode"
    :matType="matType"
    :commMatType="commMatType"
    :ordQtt="ordQtt"
    :inbndQtt="inbndQtt"
    :unit="unit"
    :commUnit="commUnit"
    :inbndDateFrom="inbndDateFrom"
    :inbndDateTo="inbndDateTo"
    :matSup="matSup"
    :supName="supName"
    :mCode="mCode"
    :mName="mName"
    :qioCode="qioCode"
    :lotNum="lotNum"/> 
  <MinListTable />
</template>

