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
                class="relative block py-2 pr-4 pl-3 text-zinc-800 hover:text-violet-700 dark:text-zinc-400 dark:hover:text-violet-400 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-violet-700 dark:after:bg-violet-400 after:transition-all after:duration-300 hover:after:w-full">
                Dashboard
              </router-link>
            </li>
            <li>
              <router-link to="/wallet"
                exact-active-class="text-violet-700 dark:text-violet-400 font-semibold after:w-full"
                class="relative block py-2 pr-4 pl-3 text-zinc-800 hover:text-violet-700 dark:text-zinc-400 dark:hover:text-violet-400 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-violet-700 dark:after:bg-violet-400 after:transition-all after:duration-300 hover:after:w-full">
                Wallet
              </router-link>
            </li>
            <li>
              <router-link to="/market"
                exact-active-class="text-violet-700 dark:text-violet-400 font-semibold after:w-full"
                class="relative block py-2 pr-4 pl-3 text-zinc-800 hover:text-violet-700 dark:text-zinc-400 dark:hover:text-violet-400 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-violet-700 dark:after:bg-violet-400 after:transition-all after:duration-300 hover:after:w-full">
                Market
              </router-link>
            </li>
          </ul>
          <div class="flex items-center gap-4 order-2 relative user-menu-container">
            <!-- User Profile / Dropdown Trigger -->
            <div v-if="session.isAuthenticated && session.user" @click="toggleDropdown"
              class="flex items-center gap-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors select-none">
              <img :src="session.user.avatarUrl" alt="User Avatar" class="w-8 h-8 rounded-full border border-gray-300">
              <div class="flex flex-col leading-4">
                <span class="text-md font-bold">{{ session.user.name }}</span>
                <span class="text-sm text-zinc-600">Balance: {{ session.user.balance }}€</span>
              </div>
            </div>

            <!-- Dropdown Menu -->
            <div v-if="isDropdownOpen && session.isAuthenticated"
              class="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 border border-gray-100 dark:border-gray-700 z-50">
              <div class="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <p class="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                <p class="text-sm font-bold truncate">{{ session.user.name }}</p>
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
