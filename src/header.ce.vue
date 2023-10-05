<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { getUserDetails } from './auth'
import type { User } from './auth'
import UserIcon from './ui/UserIcon.vue'

const props = defineProps<{
  lang?: string
  activeApp?: string
  //legacy option : using old iframe option
  legacyUrl?: string
  legacyStyle?: string
}>()

const state = reactive({
  user: null as null | User,
  mobileMenuOpen: false,
})

const isAnonymous = computed(() => !state.user || state.user.anonymous)
const isAdmin = computed(() => state.user?.adminRoles?.admin)
const adminRoles = computed(() => state.user?.adminRoles)

const loginUrl = computed(() => {
  const current = new URL(window.location.href)
  current.searchParams.set('login', '')
  return current.toString()
})
const logoutUrl = computed(() => '/logout')

function toggleMenu(): void {
  state.mobileMenuOpen = !state.mobileMenuOpen
}

onMounted(() => {
  getUserDetails().then(user => {
    state.user = user
  })
})
</script>
<template>
  <div v-if="props.legacyUrl">
    <iframe
      v-bind:src="props.legacyUrl"
      v-bind:style="props.legacyStyle"
    ></iframe>
  </div>
  <header v-if="!props.legacyUrl" class="host">
    <div
      class="admin pr-8 items-center bg-primary/20 text-secondary/80 flex justify-end gap-5 text-sm font-sans"
      v-if="isAdmin"
    >
      <div class="py-1 bg-secondary/80 text-slate-100 px-8">Administration</div>
      <a
        href="/geonetwork/srv/fre/admin.console"
        class="catalog py-1 hover:text-secondary/60"
        v-if="adminRoles?.catalog"
        >catalog</a
      >
      <a
        href="/mapstore/#/admin"
        v-if="adminRoles?.viewer"
        class="py-1 hover:text-secondary/60"
        >mapstore</a
      >
      <a
        href="/console/manager/home"
        v-if="adminRoles?.console"
        class="console py-1 hover:text-secondary/60"
        >console</a
      >
      <a href="/analytics/" class="console py-1 hover:text-secondary/60"
        >analytics</a
      >
    </div>
    <div class="h-20 justify-between text-slate-600 sm:flex hidden">
      <div class="flex">
        <a href="/" class="flex justify-center items-center px-8 bg-primary/10">
          <img
            src="https://www.georchestra.org/public/georchestra-logo.svg"
            alt="geOrchestra logo"
            class="w-32"
          />
        </a>
        <nav class="flex justify-center items-center font-semibold">
          <a class="nav-item" href="/datahub/">Data</a>
          <a class="nav-item" href="/mapstore/">Viewer</a>
          <a class="nav-item" href="/mapstore/#/home">Maps</a>
          <a class="nav-item" href="/geoserver/web/">Services</a>
          <a v-if="!isAnonymous" class="nav-item" href="/import/">Import</a>
        </nav>
      </div>
      <div class="mr-8 flex justify-center items-center">
        <div v-if="!isAnonymous" class="flex gap-4 items-baseline">
          <a class="link-btn" href="/console/account/userdetails">
            <UserIcon class="font-bold text-3xl inline-block mr-4"></UserIcon>
            <span>{{ state.user?.username }}</span></a
          >
          <a class="link-btn" :href="logoutUrl">logout</a>
        </div>
        <a v-else class="btn" :href="loginUrl">login</a>
      </div>
    </div>
    <div class="flex-col sm:hidden w-full">
      <div
        class="h-12 inline-flex items-center justify-start align-middle px-6 py-8 shrink-0 w-full bg-primary/10"
      >
        <button
          type="button"
          class="grow flex justify-start items-center py-3"
          @click="toggleMenu"
        >
          <div class="inline-flex items-center rounded-full">
            <svg
              v-if="state.mobileMenuOpen"
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 -960 960 960"
              width="24"
            >
              <path
                d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 -960 960 960"
              width="24"
            >
              <path
                d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"
              />
            </svg>
            <img
              src="https://www.georchestra.org/public/georchestra-logo.svg"
              alt="geOrchestra logo"
              class="w-24 ml-4"
            />
          </div>
        </button>
        <div class="flex justify-center items-center">
          <div v-if="!isAnonymous" class="flex gap-4 items-baseline">
            <a class="link-btn" href="/console/account/userdetails">
              <UserIcon class="font-bold text-3xl inline-block mr-4"></UserIcon>
              <span>{{ state.user?.username }}</span></a
            >
            <a class="link-btn" :href="logoutUrl">logout</a>
          </div>
          <a v-else class="btn" :href="loginUrl">login</a>
        </div>
      </div>

      <div
        :class="[
          { 'opacity-100': state.mobileMenuOpen },
          { 'opacity-0': !state.mobileMenuOpen },
          'w-full border-b-2 duration-300 transition-all ease-in-out',
        ]"
      >
        <nav class="flex flex-col font-semibold" v-if="state.mobileMenuOpen">
          <a class="nav-item border-b leading-[3]" href="/datahub/">Data</a>
          <a class="nav-item border-b leading-[3]" href="/mapstore/">Viewer</a>
          <a class="nav-item border-b leading-[3]" href="/mapstore/#/home"
            >Maps</a
          >
          <a class="nav-item border-b leading-[3]" href="/geoserver/"
            >Services</a
          >
          <a v-if="!isAnonymous" class="nav-item" href="/import/">Import</a>
        </nav>
      </div>
    </div>
  </header>
</template>

<style scoped>
@tailwind base;
@tailwind components;
@tailwind utilities;

.host {
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  -moz-tab-size: 4;
  tab-size: 4;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  font-feature-settings: normal;
}

@layer components {
  .nav-item {
    @apply px-6 hover:bg-primary/70 hover:text-slate-100 transition-colors leading-[5];
  }
  .btn {
    @apply px-4 py-2 text-slate-100 bg-primary rounded hover:bg-primary/70 transition-colors;
  }
  .link-btn {
    @apply text-primary/70 hover:underline underline-offset-8 decoration-2 decoration-primary/50;
  }
  * {
    -webkit-tap-highlight-color: transparent;
  }
}
</style>
