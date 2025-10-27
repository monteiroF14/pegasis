<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Header from "./components/layout/Header.vue";

const route = useRoute();
const showHeader = computed(() => route.path !== '/');
</script>

<template>
  <Header v-if="showHeader"/>
  <router-view />
</template>

<style scoped>
</style>