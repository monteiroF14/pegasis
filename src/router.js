import { createRouter, createWebHistory } from "vue-router";

import Home from "./components/Home.vue";
import Wallet from "./components/Wallet.vue";
import Dashboard from "./components/Dashboard.vue";
import Market from "./components/Market.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/wallet", component: Wallet },
  { path: "/dashboard", component: Dashboard },
  { path: "/market", component: Market },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
