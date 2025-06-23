<script setup>
import { useWebSocketStore } from '@/stores/websocket.js';
import { onMounted } from 'vue';

const wsStore = useWebSocketStore();
onMounted(() => {
    // 웹소켓 연결
    if (!wsStore.isConnected) {
        wsStore.connect();
    }
});

</script>

<template>
    <router-view />
</template>

<style scoped></style>
