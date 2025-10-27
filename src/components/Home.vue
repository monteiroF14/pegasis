<template>
  <div class="container mx-auto px-4 py-8">
    <div class="text-center">
      <h1 class="text-4xl font-bold mb-4">Welcome to Pegasis</h1>
      <p class="text-lg text-gray-600 mb-8">Your one-stop solution for managing your cryptocurrency portfolio.</p>
      <router-link to="/dashboard" class="bg-zinc-800 hover:bg-zinc-800 text-white font-bold py-2 px-4 rounded-full">Get Started</router-link>
    </div>
    <div class="grid grid-cols-3 gap-8 mt-16">
      <div class="text-center">
        <div class="w-24 h-24 bg-zinc-800 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        </div>
        <h2 class="text-xl font-bold mb-2">Secure Wallet</h2>
        <p class="text-gray-600">Your assets are safe with our industry-leading security features.</p>
      </div>
      <div class="text-center">
        <div class="w-24 h-24 bg-zinc-800 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
        </div>
        <h2 class="text-xl font-bold mb-2">Real-time Market Data</h2>
        <p class="text-gray-600">Stay up-to-date with the latest market trends and prices.</p>
      </div>
      <div class="text-center">
        <div class="w-24 h-24 bg-zinc-800 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        </div>
        <h2 class="text-xl font-bold mb-2">Easy Portfolio Management</h2>
        <p class="text-gray-600">Track your portfolio performance and make informed decisions.</p>
      </div>
    </div>
  </div>
</template>
