<template>
  <div>Logging in...</div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { exchangeCodeForToken } from "./login.js";
import { useSessionStore } from "@/stores/session";

onMounted(async () => {
  const route = useRoute()
  const router = useRouter()
  const session = useSessionStore()

  const code = route.query.code;
  if (!code) {
    console.error("No code found in query parameters.");
    router.push("/");
    return;
  }

  try {
    // 1. Exchange code for token
    const tokenData = await exchangeCodeForToken(code);
    
    // 2. Delegate profile fetching and DB check to the store.
    // The store will create the user if they don't exist.
    await session.login(tokenData.access_token);

    // Success!
    router.push("/");
  } catch (error) {
    console.error("Login failed:", error);
    router.push("/");
  }
});
</script>

