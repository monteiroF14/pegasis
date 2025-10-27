<template>
    <header class="w-4/5 mx-auto mt-4">
    <nav class="bg-white border-gray-200 dark:bg-gray-800">
        <div class="flex justify-between items-center mx-auto">
            <router-link to="/" class="mx-auto text-black rounded font-bold text-3xl tracking-widest bg-primary-700 bg-transparent text-primary-700 p-0 dark:text-white" aria-current="page">𝖕𝖊𝖌𝖆𝖘𝖎𝖘</router-link>
            <div class="flex items-center order-2">
                <DarkModeSwitch />
                <a href="#" class="text-white bg-violet-700 hover:bg-violet-800 focus:ring-4 focus:ring-violet-300 font-medium rounded-lg text-sm px-4 py-2.5 ml-2 dark:bg-violet-600 dark:hover:bg-violet-700 focus:outline-none dark:focus:ring-violet-800">Connect Wallet</a>
            </div>
            <div class="justify-between items-center w-full flex order-1" id="mobile-menu-2">
                <ul class="flex mx-auto font-medium flex-row space-x-8 mt-0">
                    <li v-for="link in links" :key="link.name">
                        <router-link :to="link.path" class="block py-2 pr-4 pl-3 text-zinc-800 hover:bg-transparent border-0 p-0 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-transparent dark:border-gray-700" :class="{ 'text-violet-700 dark:text-violet-700': $route.path === link.path }">{{ link.name }}</router-link>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</header>
</template>

<script setup>
import { ref } from 'vue'
import DarkModeSwitch from '@/components/ui/DarkModeSwitch.vue'

const links = ref([
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Wallet', path: '/wallet' },
  { name: 'Market', path: '/market' },
])
</script>