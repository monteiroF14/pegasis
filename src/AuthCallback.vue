<template>
  <div>Logging in...</div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { exchangeCodeForToken } from "./login.js";

onMounted(async () => {
  const route = useRoute()
  const router = useRouter()

  const code = route.query.code;
  if (!code) {
    console.error("No code found in query parameters.");
    return;
  }

  console.log("I was once here")
  await exchangeCodeForToken(code);

  router.push("/");
});
</script>

