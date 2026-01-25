<script setup>
import { ShieldCheck, BarChart3, Wallet, ArrowRight } from "lucide-vue-next";
import Header from "./layout/Header.vue";
import Dashboard from "./Dashboard.vue";
import { isAuthenticated, loginWithGitHub, logout } from "../login.js";

const faqs = [
  {
    q: "Is Pegasis a brokerage?",
    a: "No. Pegasis is a portfolio tracker. It serves to track and analyze your assets; it does not execute market orders.",
  },
  {
    q: "Is logging in with GitHub secure?",
    a: "Yes — it is done via OAuth. Pegasis does not see or store your GitHub password.",
  },
  {
    q: "Can I buy stocks on the platform?",
    a: "No. The goal is market analysis and portfolio tracking.",
  },
  {
    q: "Which assets can I track?",
    a: "Stocks.",
  },
];
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <Header />

    <Dashboard v-if="isAuthenticated()" />

    <main v-else class="w-4/5 mx-auto pt-10 pb-20">
      <!-- HERO (full width, sem card direito) -->
      <section
        class="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm relative overflow-hidden"
      >
        <!-- subtle background -->
        <div
          class="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-violet-200/40 blur-3xl"
        ></div>
        <div
          class="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-violet-300/30 blur-3xl"
        ></div>

        <div class="relative w-full">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
            Portfolio tracking with a
            <span class="text-violet-700">finance-grade</span> look.
          </h1>

          <p class="mt-4 text-lg text-gray-600">
            Track and analyze your portfolio with a clean, consistent, and performance-focused interface.
          </p>

          <div class="mt-6 grid sm:grid-cols-2 gap-3">
            <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div class="text-sm font-extrabold">Unified View</div>
              <p class="mt-1 text-sm text-gray-600 font-medium">
                Organize assets and positions in one place.
              </p>
            </div>

            <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div class="text-sm font-extrabold">Clear Analysis</div>
              <p class="mt-1 text-sm text-gray-600 font-medium">
                Performance, allocation, and portfolio evolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURES -->
      <section class="mt-10 grid md:grid-cols-3 gap-4">
        <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div class="inline-flex p-3 rounded-2xl bg-violet-700 text-white">
            <ShieldCheck class="w-6 h-6" />
          </div>
          <h2 class="mt-4 text-xl font-extrabold">Security</h2>
          <p class="mt-2 text-gray-600 font-medium">
            Clear authentication and focus on session protection best practices.
          </p>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div class="inline-flex p-3 rounded-2xl bg-violet-700 text-white">
            <BarChart3 class="w-6 h-6" />
          </div>
          <h2 class="mt-4 text-xl font-extrabold">Analytics</h2>
          <p class="mt-2 text-gray-600 font-medium">
            Structure prepared for indicators and charts without visual clutter.
          </p>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div class="inline-flex p-3 rounded-2xl bg-violet-700 text-white">
            <Wallet class="w-6 h-6" />
          </div>
          <h2 class="mt-4 text-xl font-extrabold">Asset Management</h2>
          <p class="mt-2 text-gray-600 font-medium">
            Consistent organization for multiple assets and portfolios.
          </p>
        </div>
      </section>

      <!-- FAQ -->
      <section class="mt-10">
        <div class="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 class="text-2xl font-extrabold">FAQ</h2>
          <p class="mt-2 text-gray-600 font-medium">
            Answers to common questions.
          </p>

          <div class="mt-6 grid lg:grid-cols-2 gap-4">
            <div
              v-for="f in faqs"
              :key="f.q"
              class="rounded-xl border border-gray-200 bg-gray-50 p-6"
            >
              <div class="font-extrabold">{{ f.q }}</div>
              <p class="mt-2 text-sm font-semibold text-gray-600">
                {{ f.a }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer
        class="mt-12 py-8 border-t border-gray-200 text-center text-gray-500"
      >
        <p>&copy; 2026 Pegasis. All rights reserved.</p>
      </footer>
    </main>
  </div>
</template>
