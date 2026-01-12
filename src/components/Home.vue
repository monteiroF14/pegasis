<script setup>
import { ShieldCheck, BarChart3, Wallet, Zap, ArrowRight } from 'lucide-vue-next';
import Header from "./layout/Header.vue"
import Dashboard from "./Dashboard.vue"
import { isAuthenticated, loginWithGitHub, logout } from "../login.js";
</script>

<template>
  <div class="bg-gray-50 text-gray-800">
    <Header v-if="isAuthenticated()" />
    <header v-if="!isAuthenticated()" class="w-4/5 mx-auto mt-4">
      <nav class="bg-white border-gray-200 dark:bg-gray-800">
        <div class="flex justify-between items-center mx-auto">
          <router-link to="/"
            class="mx-auto text-black rounded font-bold text-3xl tracking-widest bg-transparent text-primary-700 p-0 dark:text-white"
            aria-current="page">
            𝖕𝖊𝖌𝖆𝖘𝖎𝖘
          </router-link>

          <div class="justify-between items-center w-full flex order-1" id="mobile-menu-2">
            <ul class="flex mx-auto font-medium flex-row space-x-8 mt-0">
              <h3>idk</h3>
            </ul>
            <div class="flex items-center order-2">
              <button v-if="!isAuthenticated()" @click="loginWithGitHub"
                class="cursor-pointer text-black bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2.5 mr-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">Login
                with GitHub</button>
              <button v-if="isAuthenticated()" @click="logout"
                class="cursor-pointer text-white bg-violet-700 hover:bg-violet-800 focus:ring-4 focus:ring-violet-300 font-medium rounded-lg text-sm px-4 py-2.5 mr-2 dark:bg-violet-600 dark:hover:bg-violet-700 focus:outline-none dark:focus:ring-violet-800">Logout</button>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <Dashboard v-if="isAuthenticated()" />
    <main v-if="!isAuthenticated()">
      <div class="container mx-auto px-4 pt-16 pb-24 text-center">
        <h1 class="text-6xl font-extrabold mb-4 leading-tight">The Future of Finance is Here</h1>
        <p class="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">Manage your crypto and fiat in one seamless, secure,
          and powerful app. Welcome to the new era of digital banking.</p>
        <router-link to="/dashboard"
          class="bg-violet-700 text-white hover:bg-violet-800 font-bold py-4 px-10 rounded-full text-lg inline-flex items-center space-x-2 transition-transform transform hover:scale-105">
          <span>Get Started</span>
          <ArrowRight class="w-5 h-5" />
        </router-link>
      </div>

      <div class="bg-gray-50 py-20">
        <div class="container mx-auto px-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div class="feature-item">
              <div class="mb-4 inline-block p-4 bg-violet-700 text-white rounded-full">
                <ShieldCheck class="w-8 h-8" />
              </div>
              <h2 class="text-2xl font-bold mb-2">Bank-Grade Security</h2>
              <p class="text-gray-600">Your assets are protected by multi-layer security, ensuring your funds are always
                safe.</p>
            </div>
            <div class="feature-item">
              <div class="mb-4 inline-block p-4 bg-violet-700 text-white rounded-full">
                <BarChart3 class="w-8 h-8" />
              </div>
              <h2 class="text-2xl font-bold mb-2">Advanced Analytics</h2>
              <p class="text-gray-600">Make informed decisions with our real-time market data and portfolio analysis
                tools.</p>
            </div>
            <div class="feature-item">
              <div class="mb-4 inline-block p-4 bg-violet-700 text-white rounded-full">
                <Wallet class="w-8 h-8" />
              </div>
              <h2 class="text-2xl font-bold mb-2">All-in-One Wallet</h2>
              <p class="text-gray-600">Seamlessly manage a wide range of cryptocurrencies and traditional assets.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="py-20">
        <div class="container mx-auto px-4">
          <h2 class="text-4xl font-bold text-center mb-12">Get Started in 3 Easy Steps</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div
                class="mb-4 inline-block p-4 border-2 border-violet-700 text-violet-700 rounded-full text-2xl font-bold">
                1</div>
              <h3 class="text-2xl font-bold mb-2">Create an Account</h3>
              <p class="text-gray-600">Sign up in minutes and complete our secure verification process.</p>
            </div>
            <div>
              <div
                class="mb-4 inline-block p-4 border-2 border-violet-700 text-violet-700 rounded-full text-2xl font-bold">
                2</div>
              <h3 class="text-2xl font-bold mb-2">Fund Your Wallet</h3>
              <p class="text-gray-600">Add funds using your bank account, credit card, or another crypto wallet.</p>
            </div>
            <div>
              <div
                class="mb-4 inline-block p-4 border-2 border-violet-700 text-violet-700 rounded-full text-2xl font-bold">
                3</div>
              <h3 class="text-2xl font-bold mb-2">Start Trading</h3>
              <p class="text-gray-600">You're all set! Buy, sell, and exchange assets with low fees.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-gray-50">
        <div class="container mx-auto px-4 py-20 text-center">
          <h2 class="text-4xl font-bold mb-4">Ready to Take Control?</h2>
          <p class="text-lg text-gray-600 mb-8">Join thousands of users who trust Pegasis to manage their financial
            future.</p>
          <router-link to="/dashboard"
            class="bg-violet-700 text-white hover:bg-violet-800 font-bold py-3 px-8 rounded-full text-lg">
            Sign Up Now
          </router-link>
        </div>
      </div>
    </main>

    <footer class="bg-gray-50 py-8 absolute bottom-0 left-0 right-0">
      <div class="container mx-auto px-4 text-center text-gray-500">
        <p>&copy; 2025 Pegasis. All rights reserved.</p>
        <div class="flex justify-center space-x-6 mt-4">
          <a href="#" class="hover:text-violet-700">Privacy Policy</a>
          <a href="#" class="hover:text-violet-700">Terms of Service</a>
          <a href="#" class="hover:text-violet-700">Contact</a>
        </div>
      </div>
    </footer>
  </div>
</template>
