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
  console.log(import.meta.env.PROD);
  const redirect_uri = import.meta.env.PROD
    ? "https://ppegasis.netlify.app/auth/callback"
    : "http://localhost:5173/auth/callback";

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri,
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

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Auth Worker Error: ${res.status} ${errorText}`);
  }

  const authToken = await res.json();
  auth.accessToken = authToken.access_token;
  return authToken;
}

export async function fetchGithubUser(token) {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub User API Error: ${res.status}`);
  }

  return await res.json();
}

export function logout() {
  auth.accessToken = null;
  localStorage.removeItem("accessToken");
}
