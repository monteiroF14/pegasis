<script setup>
import { isAuthenticated, loginWithGitHub, logout } from "../../login.js";
</script>

<template>
  <header class="w-4/5 mx-auto mt-4">
    <nav class="bg-white border-gray-200 dark:bg-gray-800">
      <div class="flex justify-between items-center mx-auto">
        <router-link
          to="/"
          class="mx-auto text-black rounded font-bold text-3xl tracking-widest bg-transparent text-primary-700 p-0 dark:text-white"
          aria-current="page"
        >
          𝖕𝖊𝖌𝖆𝖘𝖎𝖘
        </router-link>

        <div class="justify-between items-center w-full flex order-1" id="mobile-menu-2">
          <ul class="flex mx-auto font-medium flex-row space-x-8 mt-0">
            <li>
              <router-link
                to="/dashboard"
                exact-active-class="text-violet-700 dark:text-violet-400 font-semibold after:w-full"
                class="relative block py-2 pr-4 pl-3 text-zinc-800 hover:text-violet-700 dark:text-zinc-400 dark:hover:text-violet-400 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-violet-700 dark:after:bg-violet-400 after:transition-all after:duration-300 hover:after:w-full"
              >
               Dashboard 
              </router-link>
            </li>
            <li>
              <router-link
                to="/wallet"
                exact-active-class="text-violet-700 dark:text-violet-400 font-semibold after:w-full"
                class="relative block py-2 pr-4 pl-3 text-zinc-800 hover:text-violet-700 dark:text-zinc-400 dark:hover:text-violet-400 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-violet-700 dark:after:bg-violet-400 after:transition-all after:duration-300 hover:after:w-full"
              >
                Wallet
              </router-link>
            </li>
            <li>
              <router-link
                to="/market"
                exact-active-class="text-violet-700 dark:text-violet-400 font-semibold after:w-full"
                class="relative block py-2 pr-4 pl-3 text-zinc-800 hover:text-violet-700 dark:text-zinc-400 dark:hover:text-violet-400 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-violet-700 dark:after:bg-violet-400 after:transition-all after:duration-300 hover:after:w-full"
              >
                Market
              </router-link>
            </li>
          </ul>
            <div class="flex items-center order-2">
                <button v-if="!isAuthenticated()" @click="loginWithGitHub" class="cursor-pointer text-black bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2.5 mr-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">Login with GitHub</button>
                <button v-if="isAuthenticated()" @click="logout" class="cursor-pointer text-white bg-violet-700 hover:bg-violet-800 focus:ring-4 focus:ring-violet-300 font-medium rounded-lg text-sm px-4 py-2.5 mr-2 dark:bg-violet-600 dark:hover:bg-violet-700 focus:outline-none dark:focus:ring-violet-800">Logout</button>
            </div>
        </div>
      </div>
    </nav>
  </header>
</template>
