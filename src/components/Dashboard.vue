<script setup>
import { ref, computed, onMounted } from "vue";
import { useSessionStore } from "../stores/session";
import { updateUser } from "../api/db";
import { LayoutDashboard } from "lucide-vue-next";

const sessionStore = useSessionStore();
const user = computed(() => sessionStore.user);

// ---- GOAL CREATION ----
const goalAction = ref("reach_balance");
const goalTarget = ref(5);
const errorMessage = ref("");

const goalTemplates = {
  reach_balance: { label: "Reach a balance of", unit: "", baseXP: 1 },
  make_trades: { label: "Perform transactions", unit: "trades", baseXP: 100 },
  diversify: { label: "Own different stocks", unit: "companies", baseXP: 300 },
};

const calculatedXP = computed(() => {
  const template = goalTemplates[goalAction.value];
  if (goalAction.value === "reach_balance") {
    const diff = goalTarget.value - (user.value?.balance || 0);
    return diff > 0 ? Math.floor(diff / 2) : 0;
  }
  return goalTarget.value * template.baseXP;
});

const createGoal = async () => {
  if (!user.value) return;
  errorMessage.value = "";

  if (
    goalAction.value === "reach_balance" &&
    goalTarget.value <= user.value.balance
  ) {
    errorMessage.value = `Target balance must be higher than your current balance ($${user.value.balance.toFixed(2)})`;
    return;
  }

  if (
    goalAction.value === "diversify" &&
    goalTarget.value <= user.value.portfolio.length
  ) {
    errorMessage.value = `You already own ${user.value.portfolio.length} different stocks. Set a higher target!`;
    return;
  }

  if (goalTarget.value <= 0) {
    errorMessage.value = "Target must be greater than zero.";
    return;
  }

  const template = goalTemplates[goalAction.value];
  const newGoal = {
    type: goalAction.value,
    description: `${template.label} ${goalTarget.value} ${template.unit}`,
    xp: calculatedXP.value,
    progress:
      goalAction.value === "reach_balance"
        ? user.value.balance
        : goalAction.value === "diversify"
          ? user.value.portfolio.length
          : 0,
  };

  const updatedGoals = [...(user.value.goals || []), newGoal];

  try {
    await updateUser(user.value.id, { goals: updatedGoals });
    await sessionStore.refreshUser();
    goalTarget.value = 5;
  } catch (e) {
    errorMessage.value = "Failed to save goal.";
  }
};

onMounted(async () => {
  await sessionStore.refreshUser();
  if (sessionStore.badges.length === 0) await sessionStore.fetchAllBadges();
});

const getXPForLevel = (lvl) =>
  lvl <= 1
    ? 0
    : Array.from({ length: lvl - 1 }, (_, i) =>
        Math.floor(1000 * Math.pow(1.1, i)),
      ).reduce((a, b) => a + b, 0);

const xpInCurrentLevel = computed(
  () => (user.value?.xp || 0) - getXPForLevel(user.value?.level || 1),
);
const xpNeededForNextLevel = computed(
  () =>
    getXPForLevel((user.value?.level || 1) + 1) -
    getXPForLevel(user.value?.level || 1),
);
const xpProgress = computed(() =>
  xpNeededForNextLevel.value === 0
    ? 0
    : Math.min(
        100,
        (xpInCurrentLevel.value / xpNeededForNextLevel.value) * 100,
      ),
);

const greeting = computed(() => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
});

const rankTitle = computed(() => {
  const l = user.value?.level || 1;
  if (l < 5) return "Intern Trader";
  if (l < 10) return "Junior Analyst";
  if (l < 20) return "Senior Analyst";
  if (l < 35) return "Portfolio Manager";
  return "Market Guru";
});
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="w-4/5 mx-auto pt-10 pb-20">
      <h1 class="text-4xl font-bold flex items-center gap-3">
        <LayoutDashboard class="w-10 h-10 text-violet-600" />
        Hub
      </h1>
      <p class="text-gray-600 mt-2 text-lg font-medium">
        Level up your trading career.
      </p>

      <div
        v-if="user"
        class="mt-8 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-10"
      >
        <div class="relative">
          <img
            :src="user.avatarUrl"
            class="w-24 h-24 rounded-full border-4 border-violet-500 shadow-xl"
          />
          <div
            class="absolute -bottom-2 -right-2 bg-violet-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white"
          >
            LVL {{ user.level }}
          </div>
        </div>

        <div class="flex-1 w-full">
          <div
            class="flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div>
              <h2 class="text-3xl font-bold text-gray-900">
                {{ greeting }},
                <span class="text-violet-600">{{ rankTitle }}</span>
              </h2>
              <p class="text-gray-500 font-medium mt-1">
                Keep trading to earn more XP and unlock badges!
              </p>
            </div>
            <div class="flex gap-4">
              <div
                class="bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 flex flex-col items-center min-w-[140px]"
              >
                <span
                  class="text-[10px] uppercase text-gray-400 font-bold tracking-widest mb-1"
                  >Current Badge</span
                >
                <span class="text-sm font-bold text-gray-800">{{
                  sessionStore.currentBadge?.description || "NoviceInvestor"
                }}</span>
              </div>
              <div
                class="bg-violet-50 px-5 py-3 rounded-2xl border border-violet-100 flex flex-col items-center min-w-[140px]"
              >
                <span
                  class="text-[10px] uppercase text-violet-400 font-bold tracking-widest mb-1"
                  >XP Multiplier</span
                >
                <span class="text-sm font-bold text-violet-700"
                  >x{{ sessionStore.activeMultiplier }}</span
                >
              </div>
            </div>
          </div>

          <div class="mt-8">
            <div class="flex justify-between items-end mb-2.5">
              <span
                class="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]"
                >Level Progress</span
              >
              <span class="text-violet-600 font-bold text-xs">
                {{ Math.floor(xpInCurrentLevel) }} /
                {{ Math.floor(xpNeededForNextLevel) }} XP to LVL
                {{ user.level + 1 }}
              </span>
            </div>
            <div
              class="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner p-0.5"
            >
              <div
                class="bg-violet-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(124,58,237,0.4)]"
                :style="{ width: xpProgress + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="mt-12 bg-white rounded-[32px] p-8 shadow-sm border border-gray-100"
      >
        <h2 class="text-2xl font-bold text-gray-900 mb-8">
          Start a New Challenge
        </h2>
        <div
          v-if="errorMessage"
          class="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-2xl flex items-center gap-3"
        >
          {{ errorMessage }}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          <div>
            <label
              class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1"
              >I want to...</label
            >
            <select
              v-model="goalAction"
              class="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-semibold focus:ring-violet-500"
            >
              <option v-for="(t, key) in goalTemplates" :key="key" :value="key">
                {{ t.label }}
              </option>
            </select>
          </div>
          <div>
            <label
              class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1"
              >Target ({{ goalTemplates[goalAction].unit || "$" }})</label
            >
            <input
              v-model.number="goalTarget"
              type="number"
              min="1"
              class="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-semibold focus:ring-violet-500"
            />
          </div>
          <button
            @click="createGoal"
            class="w-full bg-violet-600 text-white rounded-2xl py-4 text-sm font-bold hover:bg-violet-700 transition-all shadow-xl shadow-violet-100"
          >
            Start Challenge
          </button>
        </div>
      </div>

      <div class="mt-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-8 px-2">Active Goals</h2>
        <div
          v-if="user?.goals?.length"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <div
            v-for="(goal, idx) in user.goals"
            :key="idx"
            class="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 relative group hover:shadow-xl transition-all"
          >
            <div class="absolute top-0 right-0 p-4">
              <span
                class="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full"
                >+{{ goal.xp }} XP</span
              >
            </div>
            <p class="font-bold text-gray-900 pr-16">{{ goal.description }}</p>
            <div class="mt-6">
              <div
                class="flex justify-between items-end text-[10px] font-bold mb-2"
              >
                <span class="text-gray-400 uppercase">Progress</span>
                <span class="text-violet-600"
                  >{{
                    Math.min(
                      100,
                      Math.round(
                        (goal.progress /
                          (parseInt(goal.description.match(/\d+/)?.[0]) || 1)) *
                          100,
                      ),
                    )
                  }}%</span
                >
              </div>
              <div class="w-full bg-gray-50 rounded-full h-2 overflow-hidden">
                <div
                  class="bg-green-500 h-full transition-all duration-700"
                  :style="{
                    width:
                      Math.min(
                        100,
                        (goal.progress /
                          (parseInt(goal.description.match(/\d+/)?.[0]) || 1)) *
                          100,
                      ) + '%',
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-else
          class="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[32px] py-16 text-center text-gray-400 font-bold uppercase tracking-widest"
        >
          No Active Goals
        </div>
      </div>
    </div>
  </div>
</template>
