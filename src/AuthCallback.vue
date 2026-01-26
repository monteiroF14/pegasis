<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700"
  >
    <div
      class="w-[440px] max-w-[92vw] rounded-3xl bg-white border border-gray-200 shadow-2xl p-8 text-gray-800"
    >
      <!-- Header -->
      <div class="flex items-center gap-4 mb-7">
        <img :src="logo" alt="Pegasis" class="h-10 w-auto drop-shadow" />

        <div class="leading-tight">
          <p
            class="text-[10px] font-bold text-violet-500 tracking-[0.25em] uppercase"
          >
            Pegasis
          </p>
          <h1 class="text-lg font-extrabold text-gray-900">
            {{ title }}
          </h1>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="state === 'loading'" class="flex items-center gap-4">
        <div class="relative w-11 h-11 shrink-0">
          <div
            class="absolute inset-0 rounded-full border-4 border-gray-200"
          ></div>
          <div
            class="absolute inset-0 rounded-full border-4 border-violet-600 border-t-transparent animate-spin"
          ></div>
        </div>

        <div>
          <p class="text-sm font-semibold text-gray-800">
            {{ message }}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            Isto pode demorar alguns segundos.
          </p>
        </div>
      </div>

      <!-- Error state -->
      <div v-else class="space-y-4">
        <div class="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p class="text-sm font-bold text-red-600">Falha na autenticação</p>
          <p class="text-xs text-red-500 mt-1">
            {{ message }}
          </p>
        </div>

        <div class="flex gap-3">
          <button
            @click="goHome"
            class="flex-1 rounded-2xl bg-gray-100 hover:bg-gray-200 border border-gray-200 px-4 py-2.5 text-sm font-semibold transition"
          >
            Voltar à Home
          </button>

          <button
            @click="retry"
            class="flex-1 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 text-sm font-extrabold transition shadow-lg"
          >
            Tentar novamente
          </button>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-[11px] text-gray-400 mt-7">
        Autenticação segura via GitHub OAuth
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { exchangeCodeForToken } from "./login.js";
import { useSessionStore } from "@/stores/session";
import logo from "@/assets/logo2-cropped.png";

const route = useRoute();
const router = useRouter();
const session = useSessionStore();

const state = ref("loading"); // "loading" | "error"
const title = ref("A autenticar…");
const message = ref("A validar credenciais com o GitHub…");

const goHome = () => router.push("/");
const retry = () => router.push("/auth/redirect");

onMounted(async () => {
  const code = route.query.code;
  const error = route.query.error;

  if (error) {
    state.value = "error";
    title.value = "Autenticação cancelada";
    message.value = "O login foi cancelado no GitHub. Podes tentar novamente.";
    return;
  }

  if (!code) {
    state.value = "error";
    title.value = "Código em falta";
    message.value =
      "Não foi possível obter o código do GitHub. Volta a tentar.";
    return;
  }

  try {
    message.value = "A obter token de acesso…";
    const tokenData = await exchangeCodeForToken(code);

    message.value = "A iniciar sessão na Pegasis…";
    await session.login(tokenData.access_token);

    title.value = "Login concluído!";
    message.value = "A redirecionar…";

    setTimeout(() => {
      router.push("/");
    }, 500);
  } catch (err) {
    console.error("Login failed:", err);
    state.value = "error";
    title.value = "Erro no login";
    message.value =
      "Não foi possível concluir a autenticação. Verifica a ligação e tenta novamente.";
  }
});
</script>
