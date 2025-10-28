import { createRouter, createWebHistory } from "vue-router";
import { isAuthenticated, loginWithGitHub } from "./login.js";

import Home from "./components/Home.vue";
import Wallet from "./components/Wallet.vue";
import Dashboard from "./components/Dashboard.vue";
import Market from "./components/Market.vue";
import AuthCallback from "./AuthCallback.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/wallet", component: Wallet, meta: { requiresAuth: true } },
  { path: "/dashboard", component: Dashboard, meta: { requiresAuth: true } },
  { path: "/market", component: Market, meta: { requiresAuth: true } },
  { path: "/auth/callback", component: AuthCallback },
  { path: "/login", beforeEnter: loginWithGitHub },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next("/login");
  } else {
    next();
  }
});
