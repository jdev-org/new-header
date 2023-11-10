<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { getUserDetails } from './auth'
import type { User } from './auth'
import UserIcon from './ui/UserIcon.vue'
import GeorchestraLogo from './ui/GeorchestraLogo.vue'
import CatalogIcon from '@/ui/CatalogIcon.vue'
import MapIcon from '@/ui/MapIcon.vue'
import ChartPieIcon from '@/ui/ChartPieIcon.vue'
import UsersIcon from '@/ui/UsersIcon.vue'
import ChevronDownIcon from '@/ui/ChevronDownIcon.vue'

const props = defineProps<{
  lang?: string
  activeApp?: string
  logoUrl?: string
  //legacy option : using old iframe option
  legacyHeader: string
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
  <!-- props.legacyHeader -->
  <div v-if="'true' == props.legacyHeader">
    <iframe
      v-bind:src="
        props.legacyUrl + (props.activeApp ? '?active=' + props.activeApp : '')
      "
      v-bind:style="props.style"
    ></iframe>
  </div>
  <header v-else class="host h-full" v-bind:style="props.style">
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
          <a
            class="nav-item"
            :class="{ active: props.activeApp === 'datahub' }"
            href="/datahub/"
            >Data</a
          >
          <a
            class="nav-item"
            :class="{ active: props.activeApp === 'mapstore' }"
            href="/mapstore/"
            >Viewer</a
          >
          <a
            class="nav-item"
            :class="{ active: props.activeApp === 'mapstore-home' }"
            href="/mapstore/#/home"
            >Maps</a
          >
          <a
            class="nav-item"
            :class="{ active: props.activeApp === 'geoserver' }"
            href="/geoserver/web/"
            >Services</a
          >
          <a v-if="!isAnonymous" class="nav-item" href="/import/">Import</a>
          <span class="text-gray-400" v-if="isAdmin">|</span>
          <div class="admin group inline-block relative" v-if="isAdmin">
            <span></span>
            <button class="nav-item after:hover:scale-x-0 flex items-center">
              <span class="mr-2">Administration</span>
              <ChevronDownIcon
                class="w-4 h-4"
                stroke-width="4"
              ></ChevronDownIcon>
            </button>
            <ul
              class="absolute hidden group-hover:block border rounded w-full admin-dropdown z-[51] bg-white"
            >
              <li :class="{ active: props.activeApp === 'geoserver' }">
                <a
                  class="catalog"
                  v-if="adminRoles?.catalog"
                  :href="`/geonetwork/srv/${state.lang3}/admin.console`"
                >
                  <CatalogIcon class="w-4 h-4 inline-block"></CatalogIcon>
                  catalog</a
                >
              </li>
              <li :class="{ active: props.activeApp === 'msadmin' }">
                <a href="/mapstore/#/admin" v-if="adminRoles?.viewer" class="">
                  <MapIcon class="w-4 h-4 inline-block"></MapIcon>
                  mapstore</a
                >
              </li>
              <li :class="{ active: props.activeApp === 'console' }">
                <a
                  href="/console/manager/home"
                  v-if="adminRoles?.console"
                  class="console"
                >
                  <UsersIcon class="w-4 h-4 inline-block"></UsersIcon>
                  console</a
                >
              </li>
              <li :class="{ active: props.activeApp === 'analytics' }">
                <a href="/analytics/" class="analytics">
                  <ChartPieIcon class="w-4 h-4 inline-block"></ChartPieIcon>
                  analytics</a
                >
              </li>
            </ul>
          </div>
        </nav>
      </div>
      <div class="flex justify-center items-center">
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
    @apply relative text-xl w-fit block after:hover:scale-x-[82%] px-2 mx-2 hover:text-black;
  }
  .nav-item:after {
    @apply block content-[''] absolute h-[3px] bg-gradient-to-r from-primary to-primary/30 w-full scale-x-0  transition duration-300 origin-left;
  }
  .nav-item.active {
    @apply after:scale-x-[82%] after:bg-primary text-gray-900;
  }
  .btn {
    @apply px-4 py-2 mx-2 text-slate-100 bg-primary rounded hover:bg-primary/70 transition-colors;
  }
  .link-btn {
    @apply text-primary/60 hover:text-primary hover:underline underline-offset-8 decoration-2 decoration-primary/50 flex flex-col items-center;
  }
  .admin-dropdown > li {
    @apply block text-center hover:bg-primary/10 text-gray-700 hover:text-black capitalize;
  }
  .admin-dropdown > li > a {
    @apply block w-full h-full py-3;
  }
  .admin-dropdown > li.active {
    @apply bg-primary/20;
  }
  * {
    -webkit-tap-highlight-color: transparent;
  }
}
</style>
