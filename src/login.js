import { reactive, watch } from "vue";

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = import.meta.env.VITE_GITHUB_CLIENT_SECRET;

const auth = reactive({
  accessToken: localStorage.getItem("accessToken"),
});

watch(
  () => auth.accessToken,
  (newAccessToken) => {
    if (newAccessToken) {
      localStorage.setItem("accessToken", newAccessToken);
    } else {
      localStorage.removeItem("accessToken");
    }
  },
);

export function getAccessToken() {
  return auth.accessToken;
}

export function isAuthenticated() {
  console.log("isAuthenticated:", auth.accessToken !== null);
  return auth.accessToken !== null;
}

export function loginWithGitHub() {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: "http://localhost:5173/auth/callback",
    scope: "read:user,user:email",
  });

  const url = `https://github.com/login/oauth/authorize?${params.toString()}`;
  window.location.href = url;
}

export async function exchangeCodeForToken(code) {
  const WORKER_URL = "https://github-oauth-proxy.pegasis.workers.dev/"; // demo only

  const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  const authToken = await res.json();
  auth.accessToken = authToken.access_token;
  return authToken;
}

export function logout() {
  auth.accessToken = null;
}
