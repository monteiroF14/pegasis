<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useSessionStore } from "@/stores/session";
import { loginWithGitHub } from "@/login.js";

const session = useSessionStore();
const isDropdownOpen = ref(false);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// Close dropdown when clicking outside
const closeDropdown = (e) => {
  if (!e.target.closest('.user-menu-container')) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});
</script>

<template>
  <header class="w-4/5 mx-auto mt-4">
    <nav class="bg-gray-50 border-gray-200 dark:bg-gray-800">
      <div class="flex justify-between items-center mx-auto">
        <router-link to="/"
          class="mx-auto text-black rounded font-bold text-3xl tracking-widest bg-transparent text-primary-700 p-0 dark:text-gray-50"
          aria-current="page">
          𝖕𝖊𝖌𝖆𝖘𝖎𝖘
        </router-link>

        <div class="justify-between items-center w-full flex order-1" id="mobile-menu-2">
          <ul class="flex mx-auto font-medium flex-row space-x-8 mt-0">
            <li>
              <router-link to="/dashboard"
                exact-active-class="text-violet-700 dark:text-violet-400 font-semibold after:w-full"
                class="relative block py-2 pr-4 pl-3 text-zinc-800 hover:text-violet-700 dark:text-zinc-400 dark:hover:text-violet-400 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-0.5 after:bg-violet-700 dark:after:bg-violet-400 after:transition-all after:duration-300 hover:after:w-full">
                Hub
              </router-link>
            </li>
            <li>
              <router-link to="/wallet"
                exact-active-class="text-violet-700 dark:text-violet-400 font-semibold after:w-full"
                class="relative block py-2 pr-4 pl-3 text-zinc-800 hover:text-violet-700 dark:text-zinc-400 dark:hover:text-violet-400 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-0.5 after:bg-violet-700 dark:after:bg-violet-400 after:transition-all after:duration-300 hover:after:w-full">
                Wallet
              </router-link>
            </li>
            <li>
              <router-link to="/market"
                exact-active-class="text-violet-700 dark:text-violet-400 font-semibold after:w-full"
                class="relative block py-2 pr-4 pl-3 text-zinc-800 hover:text-violet-700 dark:text-zinc-400 dark:hover:text-violet-400 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-0.5 after:bg-violet-700 dark:after:bg-violet-400 after:transition-all after:duration-300 hover:after:w-full">
                Market
              </router-link>
            </li>
          </ul>
          <div class="flex items-center gap-4 order-2 relative user-menu-container">
            <!-- User Profile / Dropdown Trigger -->
            <div v-if="session.isAuthenticated && session.user" @click="toggleDropdown"
              class="flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 px-3 rounded-2xl transition-all select-none border border-transparent hover:border-violet-100">
              <img :src="session.user.avatarUrl" alt="User Avatar"
                class="w-9 h-9 rounded-full border-2 border-violet-500 shadow-sm">
              <div class="flex flex-col">
                <span class="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight">{{ session.user.name
                }}</span>
                <div class="flex items-center gap-2 mt-0.5">
                  <span
                    class="text-[10px] font-black bg-violet-600 text-white px-1.5 py-0.5 rounded-md leading-none">LVL {{
                      session.user.level }}</span>
                  <div class="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div class="bg-violet-500 h-full" :style="{ width: ((session.user.xp % 1000) / 10) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Dropdown Menu -->
            <div v-if="isDropdownOpen && session.isAuthenticated"
              class="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-xl py-2 border border-gray-100 dark:border-gray-700 z-50">
              <div class="px-4 py-2 border-b border-gray-50 dark:border-gray-700">
                <p class="text-[10px] font-black text-violet-500 uppercase tracking-widest">Market Rank</p>
                <p class="text-xs font-bold text-gray-400 truncate">Professional Trader</p>
              </div>
              <div class="border-gray-100 dark:border-gray-700 mt-1">
                <a href="#"
                  class="w-full block text-sm py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700">Notifications</a>
              </div>
              <div class="border-gray-100 dark:border-gray-700 mt-1">
                <button @click="session.logout"
                  class="w-full text-left px-4 py-2 text-sm font-semibold cursor-pointer text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Logout
                </button>
              </div>
            </div>

            <!-- Login Button (Visible only when NOT authenticated) -->
            <button v-if="!session.isAuthenticated" @click="loginWithGitHub"
              class="cursor-pointer text-black bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2.5 mr-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">Login
              with GitHub</button>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>
