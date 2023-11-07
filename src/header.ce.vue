<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { getUserDetails } from './auth'
import type { User } from './auth'
import UserIcon from './ui/UserIcon.vue'
import GeorchestraLogo from './ui/GeorchestraLogo.vue'

const props = defineProps<{
  lang?: string
  activeApp?: string
  logoUrl?: string
  //legacy option : using old iframe option
  legacyUrl?: string
  style?: string
}>()

const state = reactive({
  user: null as null | User,
  mobileMenuOpen: false,
  lang3: props.lang,
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

const LANG_2_TO_3_MAPPER: { [index: string]: any } = {
  en: 'eng',
  nl: 'dut',
  fr: 'fre',
  de: 'ger',
  ko: 'kor',
  es: 'spa',
  cs: 'cze',
  ca: 'cat',
  fi: 'fin',
  is: 'ice',
  it: 'ita',
  pt: 'por',
  ru: 'rus',
  zh: 'chi',
  sk: 'slo',
}

onMounted(() => {
  state.lang3 =
    LANG_2_TO_3_MAPPER[props.lang || navigator.language.substring(0, 2)] ||
    'eng'
  getUserDetails().then(user => {
    state.user = user
  })
})
</script>
<template>
  <div v-if="props.legacyUrl">
    <iframe v-bind:src="props.legacyUrl" v-bind:style="props.style"></iframe>
  </div>
  <header
    v-if="!props.legacyUrl"
    class="host h-full"
    v-bind:style="props.style"
  >
    <div class="justify-between text-slate-600 sm:flex hidden h-full">
      <div class="flex">
        <a
          href="/"
          class="flex justify-center items-center px-8 bg-primary/10 rounded-r-lg py-2"
        >
          <img
            v-if="props.logoUrl"
            :src="props.logoUrl"
            alt="geOrchestra logo"
            class="w-32"
          />
          <GeorchestraLogo
            v-else
            class="w-full h-12 my-auto block"
          ></GeorchestraLogo>
        </a>
        <nav class="flex justify-center items-center font-semibold">
          <a class="nav-item" href="/datahub/">Data</a>
          <a class="nav-item" href="/mapstore/">Viewer</a>
          <a class="nav-item" href="/mapstore/#/home">Maps</a>
          <a class="nav-item" href="/geoserver/web/">Services</a>
          <a v-if="!isAnonymous" class="nav-item" href="/import/">Import</a>
        </nav>
      </div>
      <div class="flex justify-center items-center">
        <div class="admin group inline-block relative h-full" v-if="isAdmin">
          <button
            class="bg-secondary/80 text-slate-100 py-2 px-4 rounded-l inline-flex items-center h-full"
          >
            Administration
          </button>
          <ul
            class="absolute hidden pt-1 group-hover:block border rounded w-full admin-dropdown z-50 bg-white"
          >
            <li>
              <a
                class="catalog"
                v-if="adminRoles?.catalog"
                :href="`/geonetwork/srv/${state.lang3}/admin.console`"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-4 h-4 inline-block"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
                  />
                </svg>
                catalog</a
              >
            </li>
            <li>
              <a href="/mapstore/#/admin" v-if="adminRoles?.viewer" class="">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-4 h-4 inline-block"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
                  />
                </svg>
                mapstore</a
              >
            </li>
            <li>
              <a
                href="/console/manager/home"
                v-if="adminRoles?.console"
                class="console"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-4 h-4 inline-block"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                  />
                </svg>
                console</a
              >
            </li>
            <li>
              <a href="/analytics/" class="analytics">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-4 h-4 inline-block"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
                  />
                </svg>
                analytics</a
              >
            </li>
          </ul>
        </div>
        <div v-if="!isAnonymous" class="flex gap-4 items-baseline mx-6">
          <a
            class="link-btn"
            href="/console/account/userdetails"
            :title="state.user?.username"
          >
            <UserIcon class="font-bold text-3xl inline-block"></UserIcon>
            <span class="text-xs max-w-[120px] truncate">{{
              state.user?.username
            }}</span></a
          >
          <a class="link-btn" :href="logoutUrl"> Logout</a>
        </div>
        <a v-else class="btn" :href="loginUrl">login</a>
      </div>
    </div>
    <div class="flex-col sm:hidden w-full h-full">
      <div
        class="h-full inline-flex items-center justify-start align-middle px-6 py-8 shrink-0 w-full bg-primary/10"
      >
        <div class="grow flex justify-start items-center py-3">
          <span class="inline-flex items-center rounded-full">
            <button type="button" @click="toggleMenu">
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
            </button>
            <a href="/">
              <img
                v-if="props.logoUrl"
                :src="props.logoUrl"
                alt="geOrchestra logo"
                class="w-24 ml-4"
              />
              <GeorchestraLogo
                v-else
                class="w-full h-12 ml-4"
              ></GeorchestraLogo>
            </a>
          </span>
        </div>
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
          { 'opacity-100 border-b-2': state.mobileMenuOpen },
          { 'opacity-0 border-b-0': !state.mobileMenuOpen },
          'absolute z-[1000] bg-white w-full duration-300 transition-opacity ease-in-out',
        ]"
      >
        <nav class="flex flex-col font-semibold" v-if="state.mobileMenuOpen">
          <a class="nav-item-mobile" href="/datahub/">Data</a>
          <a class="nav-item-mobile" href="/mapstore/">Viewer</a>
          <a class="nav-item-mobile" href="/mapstore/#/home">Maps</a>
          <a class="nav-item-mobile" href="/geoserver/">Services</a>
          <a v-if="!isAnonymous" class="nav-item-mobile" href="/import/"
            >Import</a
          >
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
  -webkit-text-size-adjust: 100%;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  font-feature-settings: normal;
}

@layer components {
  .nav-item-mobile {
    @apply text-xl w-fit block text-center py-3 mx-2 w-full border-b border-b-secondary/10;
  }
  .nav-item {
    @apply relative text-xl w-fit block after:hover:scale-x-100 px-2 mx-2;
  }
  .nav-item:after {
    @apply block content-[''] absolute h-[3px] bg-gradient-to-r from-primary to-primary/50 w-full scale-x-0  transition duration-300 origin-left;
  }
  .btn {
    @apply px-4 py-2 mx-2 text-slate-100 bg-primary rounded hover:bg-primary/70 transition-colors;
  }
  .link-btn {
    @apply text-primary/60 hover:text-primary hover:underline underline-offset-8 decoration-2 decoration-primary/50 flex flex-col items-center;
  }
  .admin-dropdown > li {
    @apply block text-center py-3 hover:bg-primary/10 text-gray-700 hover:text-black capitalize;
  }
  * {
    -webkit-tap-highlight-color: transparent;
  }
}
</style>
