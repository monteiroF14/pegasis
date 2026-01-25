<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Header from "./components/layout/Header.vue";
import Toast from "./components/ui/Toast.vue";
import { useSessionStore } from "@/stores/session";

const route = useRoute();
const session = useSessionStore();
const showHeader = computed(() => route.path !== '/');

onMounted(() => {
  session.init();
});
</script>

<template>
  <Header v-if="showHeader"/>
  <router-view />
  <Toast />
</template>

<style scoped>
</style>