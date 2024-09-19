<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { getUserDetails, getPlatformInfos } from './auth'
import type { User, PlatformInfos } from './auth'
import UserIcon from './ui/UserIcon.vue'
import GeorchestraLogo from './ui/GeorchestraLogo.vue'
import CatalogIcon from '@/ui/CatalogIcon.vue'
import MapIcon from '@/ui/MapIcon.vue'
import ChartPieIcon from '@/ui/ChartPieIcon.vue'
import UsersIcon from '@/ui/UsersIcon.vue'
import ChevronDownIcon from '@/ui/ChevronDownIcon.vue'
import { LANG_2_TO_3_MAPPER, t } from '@/i18n'

const props = defineProps<{
  hideLogin?: string
  lang?: string
  activeApp?: string
  logoUrl?: string
  //legacy option : using old iframe option
  legacyHeader?: string
  legacyUrl?: string
  style?: string
  stylesheet?: string
}>()

const state = reactive({
  user: null as null | User,
  mobileMenuOpen: false,
  lang3: props.lang,
  platformInfos: null as null | PlatformInfos,
})

const isAnonymous = computed(() => !state.user || state.user.anonymous)
const isAdmin = computed(() => state.user?.adminRoles?.admin)
const isWarned = computed(() => state.user?.warned)
const remainingDays = computed(() => state.user?.remainingDays)
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
  state.lang3 =
    LANG_2_TO_3_MAPPER[props.lang || navigator.language.substring(0, 2)] ||
    'eng'
  getUserDetails().then(user => {
    state.user = user
    if (user?.adminRoles?.admin) {
      getPlatformInfos().then(
        platformInfos => (state.platformInfos = platformInfos)
      )
    }
  })
})
</script>
<template>
  <div v-if="props.legacyHeader === 'true'">
    <iframe
      class="w-full"
      v-bind:src="`${props.legacyUrl}${
        props.activeApp ? `?active=${props.activeApp}` : ''
      }`"
      v-bind:style="props.style"
    ></iframe>
  </div>
  <header v-else class="host h-[80px] text-base" v-bind:style="props.style">
    <link rel="stylesheet" :href="props.stylesheet" v-if="props.stylesheet" />
    <component :is="'style'" v-if="!props.stylesheet">
      header { --georchestra-header-primary: #85127e;
      --georchestra-header-secondary: #1b1f3b;
      --georchestra-header-primary-light: #85127e1a;
      --georchestra-header-secondary-light: #1b1f3b1a; }
    </component>
    <div class="justify-between text-slate-600 lg:flex hidden h-full bg-white">
      <a
        href="/"
        class="flex justify-center items-center px-8 rounded-r-lg py-2 bg-primary-light"
      >
        <img
          v-if="props.logoUrl"
          :src="props.logoUrl"
          alt="geOrchestra logo"
          class="w-64"
        />
        <GeorchestraLogo
          v-else
          class="w-full h-12 my-auto block"
        ></GeorchestraLogo>
      </a>
      <nav
        class="flex justify-center items-center font-semibold uppercase md:text-sm"
      >
        <a
          class="nav-item"
          :class="{ active: props.activeApp === 'service-sig' }"
          href="//"
          >Service SIG</a
        >
        <a
          class="nav-item"
          :class="{ active: props.activeApp === 'actualites' }"
          href="//"
          >Actualités</a
        >
        <a
          class="nav-item"
          :class="{ active: props.activeApp === 'datahub' }"
          href="/datahub/"
          >GéoCatalogue</a
        >
        <a
          class="nav-item"
          :class="{ active: props.activeApp === 'datahub-map' }"
          href="/datahub/"
          >Cartothèque</a
        >
        <a
          class="nav-item"
          :class="{ active: props.activeApp === 'projets' }"
          href="//"
          >Projets</a
        >
        <a
          class="nav-item"
          :class="{ active: props.activeApp === 'fonctionnalites' }"
          href="//"
          >Fonctionnalités</a
        >
        <a
          class="nav-item"
          :class="{ active: props.activeApp === 'aide' }"
          href="//"
          >Aide</a
        >
        <span class="text-gray-400 text-xs" v-if="isWarned">
          <a href="/console/account/changePassword">
            {{ t('remaining_days_msg_part1') }} {{ remainingDays }}
            {{ t('remaining_days_msg_part2') }}
            {{ t('remaining_days_msg_part3') }}</a
          ></span
        >
      </nav>

      <div></div>

      <div class="flex justify-center items-center mx-6">
        <div v-if="!isAnonymous" class="flex items-stretch">
          <a class="btn" :href="logoutUrl"
            ><span class="first-letter:capitalize">{{ t('logout') }}</span></a
          >
          <div class="btn-user group inline-block relative">
            <button
              type="button"
              class="btn btn-outline after:hover:scale-x-0 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="currentColor"
              >
                <path
                  d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z"
                ></path>
              </svg>
              <span class="truncate">{{
                `${state.user?.firstname} ${state.user?.lastname}`
              }}</span>
              <ChevronDownIcon
                class="w-4 h-4 ml-2"
                stroke-width="2"
              ></ChevronDownIcon>
            </button>
            <ul
              class="absolute right-0 origin-top-right hidden group-hover:block border rounded-lg admin-dropdown z-[1002] bg-white shadow-md"
            >
              <li>
                <a
                  href="/console/account/userdetails"
                  :title="`${state.user?.firstname} ${state.user?.lastname}`"
                >
                  Mon compte</a
                >
              </li>
              <div v-if="isAdmin">
                <hr />
                <p>Outils d'administration</p>
                <li :class="{ active: props.activeApp === 'geonetwork' }">
                  <a
                    class="catalog"
                    v-if="adminRoles?.catalog || adminRoles?.catalogAdmin"
                    :href="
                      adminRoles?.catalogAdmin
                        ? `/geonetwork/srv/${state.lang3}/admin.console`
                        : `/geonetwork/srv/${state.lang3}/catalog.edit#/board`
                    "
                  >
                    {{ t('catalogue') }}</a
                  >
                </li>
                <li :class="{ active: props.activeApp === 'msadmin' }">
                  <a
                    href="/mapstore/#/admin"
                    v-if="adminRoles?.viewer"
                    class=""
                  >
                    {{ t('viewer') }}</a
                  >
                </li>
                <li :class="{ active: props.activeApp === 'console' }">
                  <a
                    href="/console/manager/home"
                    v-if="adminRoles?.console"
                    class="console"
                  >
                    {{ t('users') }}</a
                  >
                </li>
                <li
                  :class="{ active: props.activeApp === 'analytics' }"
                  v-if="state.platformInfos?.analyticsEnabled"
                >
                  <a href="/analytics/" class="analytics"> analytics</a>
                </li>
              </div>
            </ul>
          </div>
        </div>
        <a
          v-if="props.hideLogin !== 'true' && isAnonymous"
          class="btn"
          :href="loginUrl"
          >{{ t('login') }}</a
        >
      </div>
    </div>
    <div class="header__navMobile flex-col lg:hidden w-full h-full">
      <div
        class="h-full inline-flex items-center justify-start align-middle px-6 py-8 shrink-0 w-full bg-primary/10"
      >
        <div
          class="header__navMobileBrand grow flex justify-start items-center py-3"
        >
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
                class="w-48 ml-4"
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
              <span>{{
                `${state.user?.firstname} ${state.user?.lastname}`
              }}</span></a
            >
            <a class="link-btn" :href="logoutUrl">Déconnexion</a>
          </div>
          <a v-else class="btn" :href="loginUrl">Connexion</a>
        </div>
      </div>

      <div
        class="absolute z-[1000] bg-white w-full duration-300 transition-opacity ease-in-out"
      >
        <nav class="flex flex-col font-semibold" v-if="state.mobileMenuOpen">
          <a class="nav-item-mobile" href="//">Service SIG</a>
          <a class="nav-item-mobile" href="//">Actualités</a>
          <a class="nav-item-mobile" href="/datahub/">GéoCatalogue</a>
          <a class="nav-item-mobile" href="//">Cartothèque</a>
          <a class="nav-item-mobile" href="//">Projets</a>
          <a class="nav-item-mobile" href="//">Fonctionnalités</a>
          <a class="nav-item-mobile" href="//">Aide</a>
        </nav>
      </div>
    </div>
  </header>
</template>

<style>
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
    @apply text-xl block text-center py-3 w-full border-b border-b-slate-300 first-letter:capitalize;
  }
  .nav-item {
    @apply relative text-lg w-fit block after:hover:scale-x-[82%] px-2 mx-2 hover:text-black first-letter:capitalize;
  }
  .nav-item:after {
    @apply block content-[''] absolute h-[3px] bg-gradient-to-r from-primary to-secondary-light w-full scale-x-0  transition duration-300 origin-left;
  }
  .nav-item.active {
    @apply after:scale-x-[82%] after:bg-primary after:bg-none text-gray-900;
  }
  .btn {
    @apply px-4 py-2 mx-2 text-slate-100 bg-primary rounded hover:bg-slate-700 transition-colors first-letter:capitalize;
  }
  .link-btn {
    @apply text-primary hover:text-slate-700 hover:underline underline-offset-8 decoration-2 decoration-slate-700 flex flex-col items-center;
  }
  .admin-dropdown > li {
    @apply block text-center hover:bg-primary-light text-gray-700 hover:text-black capitalize;
  }
  .admin-dropdown > li > a {
    @apply block w-full h-full py-3;
  }
  .admin-dropdown > li.active {
    @apply bg-primary-light;
  }
  .icon-dropdown {
    @apply w-4 h-4 inline-block align-text-top;
  }
  * {
    -webkit-tap-highlight-color: transparent;
  }
}
</style>
