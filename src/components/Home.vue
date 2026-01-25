<script setup>
import { ShieldCheck, BarChart3, Wallet, ArrowRight } from "lucide-vue-next";
import Header from "./layout/Header.vue";
import Dashboard from "./Dashboard.vue";
import { isAuthenticated, loginWithGitHub, logout } from "../login.js";

const faqs = [
  {
    q: "O Pegasis é uma corretora?",
    a: "Não. O Pegasis é um portfolio tracker. Serve para acompanhar e analisar os teus ativos; não executa ordens.",
  },
  {
    q: "O login com GitHub é seguro?",
    a: "Sim — é feito via OAuth. A Pegasis não vê nem guarda a tua password do GitHub.",
  },
  {
    q: "Posso compar ações na plataforma?",
    a: "Não. O objetivo é análise do mercado e do Portfolio.",
  },
  {
    q: "Que ativos posso acompanhar?",
    a: "Stocks.",
  },
];
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <Header />

    <Dashboard v-if="isAuthenticated()" />

    <main v-else class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
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

        <div class="relative max-w-3xl">
          <h1 class="text-4xl sm:text-5xl font-extrabold leading-tight">
            Portfolio tracking com uma imagem
            <span class="text-violet-700">finance-grade</span>.
          </h1>

          <p class="mt-4 text-lg text-gray-600">
            Acompanha e analisa o teu portfólio com uma interface limpa,
            consistente e focada em desempenho.
          </p>

          <div class="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              @click="loginWithGitHub"
              class="bg-violet-700 text-white hover:bg-violet-800 font-bold py-3 px-6 rounded-xl inline-flex items-center justify-center gap-2 focus:ring-4 focus:ring-violet-300"
            >
              Login with GitHub
              <ArrowRight class="w-5 h-5" />
            </button>
          </div>

          <div class="mt-6 grid sm:grid-cols-2 gap-3">
            <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div class="text-sm font-extrabold">Vista unificada</div>
              <p class="mt-1 text-sm text-gray-600 font-medium">
                Organiza ativos e posições num só lugar.
              </p>
            </div>

            <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div class="text-sm font-extrabold">Análise clara</div>
              <p class="mt-1 text-sm text-gray-600 font-medium">
                Performance, alocação e evolução do portfólio.
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
          <h2 class="mt-4 text-xl font-extrabold">Segurança</h2>
          <p class="mt-2 text-gray-600 font-medium">
            Autenticação clara e foco em boas práticas de proteção de sessões.
          </p>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div class="inline-flex p-3 rounded-2xl bg-violet-700 text-white">
            <BarChart3 class="w-6 h-6" />
          </div>
          <h2 class="mt-4 text-xl font-extrabold">Analytics</h2>
          <p class="mt-2 text-gray-600 font-medium">
            Estrutura preparada para indicadores e gráficos sem ruído visual.
          </p>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div class="inline-flex p-3 rounded-2xl bg-violet-700 text-white">
            <Wallet class="w-6 h-6" />
          </div>
          <h2 class="mt-4 text-xl font-extrabold">Gestão de ativos</h2>
          <p class="mt-2 text-gray-600 font-medium">
            Organização consistente para múltiplos ativos e portfólios.
          </p>
        </div>
      </section>

      <!-- FAQ -->
      <section class="mt-10">
        <div class="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 class="text-2xl font-extrabold">FAQ</h2>
          <p class="mt-2 text-gray-600 font-medium">
            Respostas às perguntas mais comuns.
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
