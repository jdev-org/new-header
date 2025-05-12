<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { getUserDetails, getPlatformInfos } from './auth'
import type { User, PlatformInfos } from './auth'
import UserIcon from './ui/UserIcon.vue'
import GeorchestraLogo from '@/ui/GeorchestraLogo.vue'
import ChevronDownIcon from '@/ui/ChevronDownIcon.vue'
import { getI18n, t } from '@/i18n'
import type { Link, Separator, Dropdown, Config } from '@/config-interfaces'
import { defaultMenu, defaultConfig } from '@/default-config.json'
import CatalogueIcon from './ui/CatalogIcon.vue'
import UsersIcon from './ui/UsersIcon.vue'
import MapIcon from './ui/MapIcon.vue'

const props = defineProps<{
  activeApp?: string
  configFile?: string
  stylesheet?: string
  height?: number
  legacyHeader?: string
  legacyUrl?: string
  logoUrl?: string
}>()

const state = reactive({
  user: null as null | User,
  mobileMenuOpen: false,
  platformInfos: null as null | PlatformInfos,
  menu: defaultMenu as (Link | Separator | Dropdown)[],
  config: defaultConfig as Config,
  lang3: 'eng',
  loaded: false,
  matchedRouteScore: 0,
  activeAppUrl: '' as string | undefined,
  activeDropdown: null as null | number,
})

const isAnonymous = computed(() => !state.user || state.user.anonymous)
const isWarned = computed(() => state.user?.warned)
const remainingDays = computed(() => state.user?.remainingDays)
const loginUrl = computed(() => {
  const current = new URL(window.location.href)
  current.searchParams.set('login', '')
  return current.toString()
})
const logoutUrl = computed(() => '/logout')

function replaceUrlsVariables(url: string): string {
  return url.replace(/:lang3/, state.lang3)
}

function determineActiveApp(): void {
  const tmp = allNodes(state.menu, 'activeAppUrl')
  const computedUrl = window.location.href.substring(
    window.location.origin.length,
    window.location.href.length
  )
  let matched: boolean
  for (const link of tmp) {
    matched = false
    const activeAppUrlSplitted = link.split(':')
    const base =
      activeAppUrlSplitted.length > 1 ? activeAppUrlSplitted[0] : 'start'
    const url = replaceUrlsVariables(
      activeAppUrlSplitted.length > 1
        ? activeAppUrlSplitted[1]
        : activeAppUrlSplitted[0]
    )
    switch (base) {
      case 'end':
        matched = computedUrl.endsWith(url)
        break
      case 'includes':
        matched = computedUrl.includes(url)
        break
      case 'exact':
        matched = computedUrl === url
        break
      default:
        matched = computedUrl.startsWith(url)
        break
    }
    state.matchedRouteScore =
      matched && link.length > state.matchedRouteScore
        ? link.length
        : state.matchedRouteScore
    if (matched && state.matchedRouteScore === link?.length) {
      state.activeAppUrl = link
    }
  }
}

function allNodes(obj: any, key: string, array?: any[]): string[] {
  array = array || []
  if ('object' === typeof obj) {
    for (let k in obj) {
      if (k === key) {
        array.push(obj[k])
      } else {
        allNodes(obj[k], key, array)
      }
    }
  }
  return array
}

function setI18nAndActiveApp(i18n?: any) {
  state.lang3 = getI18n(
    i18n || {},
    state.config.lang || navigator.language.substring(0, 2) || 'en'
  )
  determineActiveApp()
  state.loaded = true
}

const dropdownVisible = ref(false)

onMounted(() => {
  if (props.legacyHeader !== 'true') {
    getUserDetails().then(user => {
      state.user = user
      state.config.stylesheet ??= props.stylesheet
      if (props.configFile)
        fetch(props.configFile)
          .then(res => res.json())
          .then(json => {
            state.config = Object.assign({}, state.config, json.config)
            if (json.menu) {
              state.menu = json.menu
            }
            setI18nAndActiveApp(json.i18n)
          })
      else setI18nAndActiveApp()
      if (user.roles.some(role => state.config.adminRoles.includes(role))) {
        getPlatformInfos().then(
          platformInfos => (state.platformInfos = platformInfos)
        )
      }
    })
  }
})
</script>
<template>
  <div v-if="props.legacyHeader === 'true'">
    <iframe
      class="w-full"
      v-bind:src="`${props.legacyUrl}${
        props.activeApp ? `?active=${props.activeApp}` : ''
      }`"
      :style="`height:${props.height}px;width:100%;border:0;`"
    ></iframe>
  </div>
  <header
    v-else-if="state.loaded"
    class="host h-[80px] text-base"
    :style="`height:${props.height}px`"
  >
    <link
      rel="stylesheet"
      :href="props.stylesheet || state.config.stylesheet"
      v-if="props.stylesheet || state.config.stylesheet"
    />
    <link
      rel="stylesheet"
      :href="state.config.iconsUrl"
      v-if="state.config.iconsUrl"
    />
    <component
      :is="'style'"
      v-if="!props.stylesheet && !state.config.stylesheet"
    >
    </component>
    <div
      class="justify-between text-slate-600 md:flex hidden h-full bg-white md:text-sm"
    >
      <div class="flex header-left">
        <a
          href="/datahub/search"
          class="flex justify-center items-center lg:px-3 md:px-2 py-2"
        >
          <img
            v-if="props.logoUrl || state.config.logoUrl"
            :src="props.logoUrl || state.config.logoUrl"
            alt="geOrchestra logo"
            class="w-32"
          />
          <template v-else>
            <GeorchestraLogo class="w-full h-12 my-auto"></GeorchestraLogo>
          </template>
        </a>
        <nav class="flex justify-center items-center font-semibold header-nav">
          <a
            class="nav-item"
            :class="{ active: state.activeAppUrl === '/datahub' }"
            href="/datahub/news"
            @click="state.activeAppUrl = '/datahub'"
          >
            <div class="flex items-center">
              <span class="ml-1 first-letter:capitalize">
                {{ t('catalogue') }}
              </span>
            </div>
          </a>
          <span v-if="!isAnonymous">|</span>
          <div
            class="relative"
            @mouseenter="dropdownVisible = true"
            @mouseleave="dropdownVisible = false"
          >
            <a v-if="!isAnonymous" class="nav-item-admin flex items-center">
              <span class="mr-2 ml-1 first-letter:capitalize">
                {{ t('admin') }}
              </span>
              <ChevronDownIcon
                class="w-4 h-4"
                stroke-width="4"
              ></ChevronDownIcon>
            </a>

            <template v-if="dropdownVisible">
              <div
                class="dropdown-menu absolute top-full left-0 z-50 border rounded w-full bg-white flex flex-col items-center"
              >
                <a
                  class="nav-sub-item-admin"
                  :class="{ active: state.activeAppUrl === '/geonetwork' }"
                  href="/geonetwork/srv/fre/admin.console#/home"
                  @click="state.activeAppUrl = '/geonetwork'"
                >
                  <div class="flex items-center">
                    <CatalogueIcon
                      class="icon"
                      style="height: 1.3rem; width: auto"
                    ></CatalogueIcon>
                    <span class="ml-1 first-letter:capitalize">
                      {{ t('catalogue') }}
                    </span>
                  </div>
                </a>
                <a
                  v-if="
                    state.user?.roles?.includes(
                      'ROLE_MAPSTORE_ADMIN',
                      'ROLE_SUPERUSER'
                    )
                  "
                  class="nav-sub-item-admin"
                  :class="{ active: state.activeAppUrl === '/mapstore' }"
                  href="/mapstore/#/admin"
                  @click="state.activeAppUrl = '/mapstore'"
                >
                  <div class="flex items-center">
                    <MapIcon
                      class="icon"
                      style="height: 1.3rem; width: auto"
                    ></MapIcon>
                    <span class="ml-1 first-letter:capitalize">
                      {{ t('viewer') }}
                    </span>
                  </div>
                </a>
                <a
                  v-if="state.user?.roles?.includes('ROLE_SUPERUSER')"
                  class="nav-sub-item-admin"
                  :class="{ active: state.activeAppUrl === '/console/manager' }"
                  href="/console/manager/home"
                  @click="state.activeAppUrl = '/console/manager'"
                >
                  <div class="flex items-center">
                    <UsersIcon
                      class="icon"
                      style="height: 1.3rem; width: auto"
                    ></UsersIcon>
                    <span class="ml-1 first-letter:capitalize">
                      {{ t('users') }}
                    </span>
                  </div>
                </a>
              </div>
            </template>
          </div>

          <span class="text-gray-400 text-xs" v-if="isWarned">
            <a href="/console/account/changePassword">
              {{ t('remaining_days_msg_part1') }} {{ remainingDays }}
              {{ t('remaining_days_msg_part2') }}
              {{ t('remaining_days_msg_part3') }}</a
            ></span
          >
        </nav>
      </div>

      <!-- profil -->
      <div class="flex justify-center items-center mx-6 header-right">
        <div v-if="!isAnonymous" class="flex gap-4 items-baseline">
          <a
            class="link-btn"
            href="/console/account/userdetails"
            :title="`${state.user?.firstname} ${state.user?.lastname}`"
          >
            <UserIcon class="font-bold text-3xl inline-block"></UserIcon>
            <span class="text-xs max-w-[120px] truncate">{{
              `${state.user?.firstname} ${state.user?.lastname}`
            }}</span></a
          >
          <a class="link-btn" :href="logoutUrl"
            ><span class="first-letter:capitalize">{{ t('logout') }}</span></a
          >
        </div>
        <a
          v-if="!state.config.hideLogin && isAnonymous"
          class="btn"
          :href="loginUrl"
          >{{ t('login') }}</a
        >
      </div>
    </div>

    <!-- mobile -->
    <div class="flex-col md:hidden w-full h-full">
      <div
        class="h-full inline-flex items-center justify-start align-middle px-6 py-8 shrink-0 w-full bg-primary/10"
      >
        <div class="grow flex justify-start items-center py-3">
          <span class="inline-flex items-center rounded-full">
            <button
              type="button"
              @click="state.mobileMenuOpen = !state.mobileMenuOpen"
            >
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
            <a href="/" class="block ml-3">
              <img
                v-if="props.logoUrl || state.config.logoUrl"
                :src="props.logoUrl || state.config.logoUrl"
                alt="geOrchestra logo"
                class="w-24"
              />
              <GeorchestraLogo v-else></GeorchestraLogo>
            </a>
          </span>
        </div>
        <div class="flex justify-center items-center">
          <div v-if="!isAnonymous" class="flex gap-4 items-baseline">
            <a class="link-btn" href="/console/account/userdetails">
              <UserIcon class="font-bold text-3xl inline-block mr-4"></UserIcon>
              <span>{{
                `${state.user?.firstname?.charAt(0) ?? ''}${
                  state.user?.lastname ?? ''
                }`
              }}</span></a
            >
            <a class="link-btn" :href="logoutUrl">{{ t('logout') }}</a>
          </div>
          <a v-else class="btn" :href="loginUrl">{{ t('login') }}</a>
        </div>
      </div>

      <div
        class="absolute z-[1000] bg-white w-full duration-300 transition-opacity ease-in-out"
      >
        <nav class="flex flex-col font-semibold" v-if="state.mobileMenuOpen">
          <a
            class="nav-item-mobile"
            :class="{ active: state.activeAppUrl === '/datahub' }"
            href="/datahub/news"
            @click="state.activeAppUrl = '/datahub'"
          >
            <div class="flex items-center">
              <span class="ml-1 first-letter:capitalize">
                {{ t('catalogue') }}
              </span>
            </div>
          </a>
          <!-- <div
            class="relative"
            @mouseenter="dropdownVisible = true"
            @mouseleave="dropdownVisible = false"
          >
            <a v-if="!isAnonymous" class="nav-item-mobile flex items-center ">
              <span class="mr-2 ml-1 first-letter:capitalize">
                {{ t('admin') }}
              </span>
              <ChevronDownIcon
                class="w-4 h-4"
                stroke-width="4"
              ></ChevronDownIcon>
            </a>

            <template v-if="dropdownVisible">
              <div
                class="dropdown-menu absolute top-full left-0 z-50 border rounded w-full bg-white flex flex-col items-center"
              >
                <a
                  class="nav-sub-item-admin"
                  :class="{ active: state.activeAppUrl === '/geonetwork' }"
                  href="/geonetwork/srv/fre/admin.console"
                  @click="state.activeAppUrl = '/geonetwork'"
                >
                  <div class="flex items-center">
                    <CatalogueIcon
                      class="icon"
                      style="height: 1.3rem; width: auto"
                    ></CatalogueIcon>
                    <span class="ml-1 first-letter:capitalize">
                      {{ t('catalogue') }}
                    </span>
                  </div>
                </a>
                <a
                  v-if="
                    state.user?.roles?.includes(
                      'ROLE_MAPSTORE_ADMIN',
                      'ROLE_SUPERUSER'
                    )
                  "
                  class="nav-sub-item-admin"
                  :class="{ active: state.activeAppUrl === '/mapstore' }"
                  href="/mapstore/#/admin"
                  @click="state.activeAppUrl = '/mapstore'"
                >
                  <div class="flex items-center">
                    <MapIcon
                      class="icon"
                      style="height: 1.3rem; width: auto"
                    ></MapIcon>
                    <span class="ml-1 first-letter:capitalize">
                      {{ t('viewer') }}
                    </span>
                  </div>
                </a>
                <a
                  v-if="state.user?.roles?.includes('ROLE_SUPERUSER')"
                  class="nav-sub-item-admin"
                  :class="{ active: state.activeAppUrl === '/console/manager' }"
                  href="/console/manager/home"
                  @click="state.activeAppUrl = '/console/manager'"
                >
                  <div class="flex items-center">
                    <UsersIcon
                      class="icon"
                      style="height: 1.3rem; width: auto"
                    ></UsersIcon>
                    <span class="ml-1 first-letter:capitalize">
                      {{ t('users') }}
                    </span>
                  </div>
                </a>
              </div>
            </template>
          </div> -->
        </nav>
      </div>
    </div>
  </header>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

@font-face {
  font-family: 'Amaranth';
  src: url('/assets/fonts/Amaranth-regular.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: 'Amaranth';
  src: url('/assets/fonts/Amaranth-bold.ttf') format('truetype');
  font-weight: bold;
  font-style: normal;
}

header {
  --georchestra-header-primary: #142e71;
  --georchestra-header-secondary: #164193;
  --georchestra-header-primary-light: white;
  --georchestra-header-secondary-light: #eee;
}

.host {
  -webkit-text-size-adjust: 100%;
  font-family: 'Amaranth', ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  font-feature-settings: normal;
}

.btn:hover {
  background-color: var(--georchestra-header-secondary);
}

header nav .nav-item,
header nav .nav-item-admin,
header nav .nav-item.active {
  color: var(--georchestra-header-primary);
}

@layer components {
  .nav-item-mobile {
    @apply text-xl block text-center py-3 w-full border-b border-b-slate-300 first-letter:capitalize;
    display: flex;
    justify-content: center;
    font-family: 'Amaranth', sans-serif;
    font-weight: bold;
  }

  .nav-item {
    @apply relative text-lg w-fit block after:hover:scale-x-100 lg:mx-3 md:mx-2 hover:text-black first-letter:capitalize text-base;
    font-family: 'Amaranth', sans-serif;
    font-weight: bold;
  }

  .nav-item-admin {
    @apply relative text-lg w-fit block after:hover:scale-x-100 lg:mx-3 md:mx-2 hover:text-black first-letter:capitalize;
    font-family: 'Amaranth', sans-serif;
    font-weight: bold;
  }

  .nav-sub-item-admin {
    @apply relative text-lg w-fit block my-2 after:hover:scale-x-100 lg:mx-3 md:mx-2 hover:text-black first-letter:capitalize;
    font-family: 'Amaranth', sans-serif;
    font-weight: bold;
  }

  .nav-item:after {
    @apply block content-[''] absolute h-[3px] bg-primary w-full scale-x-0  transition duration-300 origin-left;
  }

  .nav-item.active {
    @apply after:scale-x-100 after:bg-primary after:bg-none text-gray-900;
  }

  .btn {
    @apply px-4 py-2 mx-2 text-slate-100 bg-primary rounded hover:bg-slate-700 transition-colors first-letter:capitalize;
  }

  .link-btn {
    @apply text-primary hover:text-slate-700 hover:underline underline-offset-8 decoration-2 decoration-slate-700 flex flex-col items-center;
  }

  .dropdown > li {
    @apply block text-center hover:bg-primary-light text-gray-700 hover:text-black capitalize;
  }

  .dropdown > li > a {
    @apply block w-full h-full py-3;
  }

  .dropdown > li.active {
    @apply bg-primary-light;
  }

  .disabled {
    @apply cursor-pointer pointer-events-none;
  }

  * {
    -webkit-tap-highlight-color: transparent;
  }
}
</style>
