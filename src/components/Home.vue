<script setup>
import { ShieldCheck, BarChart3, Wallet, Zap, ArrowRight } from 'lucide-vue-next';
</script>

<template>
  <div class="bg-white text-gray-800">
    <!-- Custom Header -->
    <header class="container mx-auto px-4 py-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold ">Pegasis</h1>
      <router-link to="/dashboard" class="text-gray-600 hover:text-violet-700 font-semibold">
        Sign In
      </router-link>
    </header>

    <!-- Hero Section -->
    <div class="container mx-auto px-4 pt-16 pb-24 text-center">
      <h1 class="text-6xl font-extrabold mb-4 leading-tight">The Future of Finance is Here</h1>
      <p class="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">Manage your crypto and fiat in one seamless, secure, and powerful app. Welcome to the new era of digital banking.</p>
      <router-link to="/dashboard" class="bg-violet-700 text-white hover:bg-violet-800 font-bold py-4 px-10 rounded-full text-lg inline-flex items-center space-x-2 transition-transform transform hover:scale-105">
        <span>Get Started</span>
        <ArrowRight class="w-5 h-5" />
      </router-link>
    </div>

    <!-- Features Section -->
    <div class="bg-gray-50 py-20">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div class="feature-item">
            <div class="mb-4 inline-block p-4 bg-violet-700 text-white rounded-full">
              <ShieldCheck class="w-8 h-8" />
            </div>
            <h2 class="text-2xl font-bold mb-2">Bank-Grade Security</h2>
            <p class="text-gray-600">Your assets are protected by multi-layer security, ensuring your funds are always safe.</p>
          </div>
          <div class="feature-item">
            <div class="mb-4 inline-block p-4 bg-violet-700 text-white rounded-full">
              <BarChart3 class="w-8 h-8" />
            </div>
            <h2 class="text-2xl font-bold mb-2">Advanced Analytics</h2>
            <p class="text-gray-600">Make informed decisions with our real-time market data and portfolio analysis tools.</p>
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

    <!-- How It Works Section -->
    <div class="py-20">
        <div class="container mx-auto px-4">
            <h2 class="text-4xl font-bold text-center mb-12">Get Started in 3 Easy Steps</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                <div>
                    <div class="mb-4 inline-block p-4 border-2 border-violet-700 text-violet-700 rounded-full text-2xl font-bold">1</div>
                    <h3 class="text-2xl font-bold mb-2">Create an Account</h3>
                    <p class="text-gray-600">Sign up in minutes and complete our secure verification process.</p>
                </div>
                <div>
                    <div class="mb-4 inline-block p-4 border-2 border-violet-700 text-violet-700 rounded-full text-2xl font-bold">2</div>
                    <h3 class="text-2xl font-bold mb-2">Fund Your Wallet</h3>
                    <p class="text-gray-600">Add funds using your bank account, credit card, or another crypto wallet.</p>
                </div>
                <div>
                    <div class="mb-4 inline-block p-4 border-2 border-violet-700 text-violet-700 rounded-full text-2xl font-bold">3</div>
                    <h3 class="text-2xl font-bold mb-2">Start Trading</h3>
                    <p class="text-gray-600">You're all set! Buy, sell, and exchange assets with low fees.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Call to Action Section -->
    <div class="bg-gray-50">
      <div class="container mx-auto px-4 py-20 text-center">
        <h2 class="text-4xl font-bold mb-4">Ready to Take Control?</h2>
        <p class="text-lg text-gray-600 mb-8">Join thousands of users who trust Pegasis to manage their financial future.</p>
        <router-link to="/dashboard" class="bg-violet-700 text-white hover:bg-violet-800 font-bold py-3 px-8 rounded-full text-lg">
          Sign Up Now
        </router-link>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-white py-8">
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
