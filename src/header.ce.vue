<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { getUserDetails, getPlatformInfos } from './auth'
import type { User, PlatformInfos } from './auth'
import UserIcon from './ui/UserIcon.vue'
import ChevronDownIcon from '@/ui/ChevronDownIcon.vue'
import { getI18n, t } from '@/i18n'
import type { Link, Separator, Dropdown, Config } from '@/config-interfaces'
import { defaultMenu, defaultConfig } from '@/default-config.json'
import SantegraphieLogo from './ui/SantegraphieLogo.vue'
import CatalogueIcon from './ui/catalogueIcon.vue'
import DataIcon from './ui/dataIcon.vue'
import SimpleMap from './ui/simpleMap.vue'
import ComplexMap from './ui/complexMap.vue'
import TutorielsIcon from './ui/TutorielsIcon.vue'

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
  mobileProfileOpen: false,
  platformInfos: null as null | PlatformInfos,
  menu: defaultMenu as (Link | Separator | Dropdown)[],
  sub_menu: defaultMenu as (Link | Separator | Dropdown)[],
  config: defaultConfig as Config,
  lang3: 'eng',
  loaded: false,
  matchedRouteScore: 0,
  activeAppUrl: '' as string | undefined,
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

function checkCondition(item: Link | Separator | Dropdown): boolean {
  const hasRole = item.hasRole
  if (!state.user) return false
  if (!hasRole) return true
  const isBlocked = item.blockedRole
    ?.split(',')
    .some(c => state.user?.roles?.indexOf(c) !== -1)
  if (isBlocked) return false
  return hasRole.split(',').some(c => state.user?.roles?.indexOf(c) !== -1)
}

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

let isSantegraphieConfigAvailable = false

const checkConfigFile = () => {
  fetch('/public/santegraphie-config.json', {
    method: 'HEAD',
  })
    .then(response => {
      if (response.ok) {
        isSantegraphieConfigAvailable = true
      } else {
        isSantegraphieConfigAvailable = false
      }
    })
    .catch(error => {
      console.error('Erreur lors de la vérification du fichier:', error)
      isSantegraphieConfigAvailable = false
    })
}

// Gestion du dropdown
const dropdownVisible = ref(false)
const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value
}

onMounted(() => {
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
            state.sub_menu = json.sub_menu
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
  checkConfigFile()
})
</script>
<template>
  <div v-if="props.legacyHeader === 'true' && state.loaded">
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
      header { --georchestra-header-primary: #07c8e2;
      --georchestra-header-secondary: white; --georchestra-header-primary-light:
      white; --georchestra-header-secondary-light: #eee;
      --georchestra-header-primary-dark: #0d8fa0;}
    </component>
    <div
      class="justify-between text-slate-600 md:flex hidden h-full bg-white md:text-sm"
    >
      <div class="flex">
        <a
          id="homePageTitle"
          href="/"
          class="flex flex-col justify-center items-center lg:px-3 md:px-2 py-2"
        >
          <img
            v-if="props.logoUrl || state.config.logoUrl"
            :src="props.logoUrl || state.config.logoUrl"
            alt="santegraphie logo"
            class="w-full"
          />
          <template v-else>
            <SantegraphieLogo class="w-full h-12 my-auto"></SantegraphieLogo>
          </template>
        </a>
        <nav class="flex justify-center items-center font-semibold">
          <template v-if="isSantegraphieConfigAvailable === true">
            <template v-for="(item, index) in state.menu" :key="index">
              <template
                v-if="
                  !item.type &&
                  checkCondition(item) &&
                  'label' in item &&
                  item.label !== 'Tutoriels'
                "
              >
                <a
                  :href="(item as Link).url"
                  class="nav-item"
                  @click="state.activeAppUrl = (item as Link).activeAppUrl"
                  :class="{
                  active: (item as Link).activeAppUrl == state.activeAppUrl,
                }"
                >
                  <div class="flex items-center">
                    <img
                      v-if="(item as Link).icon"
                      :src="(item as Link).icon"
                      class="item-icon"
                      style="height: 1.3rem"
                    />
                    <span class="ml-1 first-letter:capitalize">
                      {{
                        (item as Link).i18n
                          ? t((item as Link).i18n)
                          : (item as Link).label
                      }}
                    </span>
                  </div>
                </a>
              </template>
              <template
                v-else-if="(item as Separator).type === 'separator' && checkCondition(item)"
              >
                <span class="text-gray-400">|</span>
              </template>
              <template
                v-else-if="item.type === 'dropdown' && checkCondition(item)"
              >
                <div class="group inline-block relative">
                  <button
                    class="nav-item after:hover:scale-x-0 flex items-center"
                  >
                    <span class="lg:mr-2 md:mr-1 first-letter:capitalize">{{
                      (item as Dropdown).i18n
                        ? t((item as Dropdown).i18n)
                        : (item as Dropdown).label
                    }}</span>
                    <ChevronDownIcon
                      class="w-4 h-4"
                      stroke-width="4"
                    ></ChevronDownIcon>
                  </button>
                  <ul
                    class="absolute hidden group-hover:block border rounded w-full admin-dropdown z-[1002] bg-white"
                  >
                    <template
                      v-for="(subitem, subindex) in (item as Dropdown).items"
                      :key="subindex"
                    >
                      <li
                        v-if="checkCondition(subitem)"
                        @click="
                          state.activeAppUrl = (item as Link).activeAppUrl
                        "
                        :class="{
                        active: (subitem as Link).activeAppUrl == state.activeAppUrl,
                      }"
                      >
                        <a
                          :href="replaceUrlsVariables(subitem.url)"
                          class="capitalize !flex justify-center items-center"
                        >
                          <i
                            v-if="subitem.icon"
                            :class="subitem.icon"
                            class="pr-1 block pb-[2px] subitem-icon"
                            style="font-size: 1rem"
                          ></i>
                          <span class="block">{{
                            subitem.i18n ? t(subitem.i18n) : subitem.label
                          }}</span>
                        </a>
                      </li>
                    </template>
                  </ul>
                </div>
              </template>
            </template>
          </template>

          <template v-else>
            <a
              class="nav-item"
              :class="{ active: props.activeApp === 'catalogue' }"
              href="/mviewer/catalogue/"
            >
              <div class="flex items-center">
                <CatalogueIcon
                  style="height: 1.3rem; width: auto"
                ></CatalogueIcon>
                <span>
                  {{ t('cartotheque') }}
                </span>
              </div>
            </a>
            <a
              class="nav-item"
              :class="{ active: props.activeApp === 'datahub' }"
              href="/datahub/"
            >
              <div class="flex items-center">
                <DataIcon style="height: 1.3rem; width: auto"></DataIcon>
                <span>
                  {{ t('data') }}
                </span>
              </div>
            </a>
            <a
              class="nav-item"
              :class="{ active: props.activeApp === 'analyse' }"
              href="/analyse/"
            >
              <div class="flex items-center">
                <SimpleMap style="height: 1.3rem; width: auto"></SimpleMap>
                <span>
                  {{ t('carte_simple') }}
                </span>
              </div>
            </a>
            TEST
            <a
              class="nav-item"
              :class="{ active: props.activeApp === 'mapstore' }"
              href="/mapstore/"
            >
              <div class="flex items-center">
                <ComplexMap style="height: 1.3rem; width: auto"></ComplexMap>
                <span>
                  {{ t('carte_evoluee') }}
                </span>
              </div>
            </a>
          </template>

          <span class="text-gray-400 text-xs" v-if="isWarned">
            <a href="/console/account/changePassword">
              {{ t('remaining_days_msg_part1') }} {{ remainingDays }}
              {{ t('remaining_days_msg_part2') }}
              {{ t('remaining_days_msg_part3') }}</a
            ></span
          >
        </nav>
      </div>
      <div></div>
      <div class="flex justify-center items-center mx-6">
        <!-- Onglet Tutoriels -->
        <template v-if="isSantegraphieConfigAvailable === true">
          <template v-for="(item, index) in state.menu" :key="index">
            <template
              v-if="
                !item.type &&
                checkCondition(item) &&
                'label' in item &&
                item.label === 'Tutoriels'
              "
            >
              <a
                :href="(item as Link).url"
                class="nav-item"
                @click="state.activeAppUrl = (item as Link).activeAppUrl"
                :class="{
                active: (item as Link).activeAppUrl == state.activeAppUrl,
              }"
              >
                <div class="flex items-center">
                  <img
                    v-if="(item as Link).icon"
                    :src="(item as Link).icon"
                    class="item-icon"
                    style="height: 1.3rem"
                  />
                  <span class="ml-1 first-letter:capitalize">
                    {{
                      (item as Link).i18n
                        ? t((item as Link).i18n)
                        : (item as Link).label
                    }}
                  </span>
                </div>
              </a>
            </template>
          </template>
        </template>
        <template v-else>
          <a
            class="nav-item"
            :class="{ active: props.activeApp === 'analyse' }"
            href="/analyse/"
          >
            <div class="flex items-center">
              <TutorielsIcon
                style="height: 1.3rem; width: auto"
              ></TutorielsIcon>
              <span>
                {{ t('tutoriels') }}
              </span>
            </div>
          </a>
        </template>
        <!---->

        <!-- Login / Dropdown admin -->
        <a
          v-if="!state.config.hideLogin && isAnonymous"
          class="btn"
          :href="loginUrl"
          >{{ t('login') }}</a
        >
        <a v-else id="profil_btn" class="btn" @click="toggleDropdown">
          <UserIcon class="font-bold text-2xl inline-block"></UserIcon>
          {{
            `${state.user?.firstname
              ?.charAt(0)
              .toLowerCase()}${state.user?.lastname?.toLowerCase()}`
          }}
          <template v-if="dropdownVisible">
            <div class="dropdown-menu">
              <ul>
                <li v-for="(item, index) in state.sub_menu" :key="index">
                  <a
                    :href="(item as Link).url"
                    :class="{
                      active: (item as Link).activeAppUrl == state.activeAppUrl,
                    }"
                  >
                    <span class="ml-1 first-letter:capitalize">
                      {{
                        (item as Link).i18n
                          ? t((item as Link).i18n)
                          : (item as Link).label
                      }}
                    </span>
                  </a>
                </li>
              </ul>
              <div v-if="!isAnonymous" class="flex p-4 items-baseline">
                <a class="link-btn" :href="logoutUrl"
                  ><span class="first-letter:capitalize">{{
                    t('logout')
                  }}</span></a
                >
              </div>
            </div>
          </template>
        </a>
        <!---->
      </div>
    </div>

    <!-- Mobile Mode -->
    <div class="flex-col md:hidden w-full h-full">
      <div
        class="h-full inline-flex items-center justify-between align-middle px-6 py-8 shrink-0 w-full bg-primary/10"
      >
        <a href="/" class="block ml-3">
          <img
            v-if="props.logoUrl || state.config.logoUrl"
            :src="props.logoUrl || state.config.logoUrl"
            alt="Santegraphie logo"
            class="w-24"
          />
          <SantegraphieLogo v-else></SantegraphieLogo>
        </a>
        <div class="flex">
          <!-- profile button -->
          <div v-if="!isAnonymous" class="flex gap-4 items-baseline">
            <a
              v-if="!state.config.hideLogin && isAnonymous"
              class="btn"
              :href="loginUrl"
              >{{ t('login') }}</a
            >
            <a
              v-else
              id="profil_btn"
              class="btn"
              @click="state.mobileProfileOpen = !state.mobileProfileOpen"
            >
              <UserIcon class="font-bold text-2xl inline-block"></UserIcon>
              {{
                `${state.user?.firstname
                  ?.charAt(0)
                  .toLowerCase()}${state.user?.lastname?.toLowerCase()}`
              }}
            </a>
          </div>
          <a v-else class="btn" :href="loginUrl">{{ t('login') }}</a>
          <!-- Burger button -->
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
        </div>
      </div>
      <!-- drop-down nav -->
      <div
        class="absolute z-[1000] bg-white w-full duration-300 transition-opacity ease-in-out"
      >
        <nav class="flex flex-col font-semibold" v-if="state.mobileMenuOpen">
          <template v-for="(item, index) in state.menu" :key="index">
            <template v-if="!item.type && checkCondition(item)">
              <a
                :href="(item as Link).url"
                class="nav-item-mobile"
                @click="state.activeAppUrl = (item as Link).activeAppUrl"
                :class="{
                  active: (item as Link).activeAppUrl == state.activeAppUrl,
                }"
              >
                <span class="ml-1 first-letter:capitalize">
                  {{
                    (item as Link).i18n
                      ? t((item as Link).i18n)
                      : (item as Link).label
                  }}
                </span>
              </a>
            </template>
          </template>
        </nav>
      </div>
      <!-- drop-down admin -->
      <div
        class="absolute z-[1000] bg-white w-full duration-300 transition-opacity ease-in-out"
      >
        <nav class="flex flex-col font-semibold" v-if="state.mobileProfileOpen">
          <template v-for="(item, index) in state.sub_menu" :key="index">
            <template v-if="!item.type && checkCondition(item)">
              <a
                :href="(item as Link).url"
                class="nav-item-mobile"
                @click="state.activeAppUrl = (item as Link).activeAppUrl"
                :class="{
                  active: (item as Link).activeAppUrl == state.activeAppUrl,
                }"
              >
                <span class="ml-1 first-letter:capitalize">
                  {{
                    (item as Link).i18n
                      ? t((item as Link).i18n)
                      : (item as Link).label
                  }}
                </span>
              </a>
            </template>
          </template>
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
    @apply relative text-lg w-fit block after:hover:scale-x-100 lg:mx-3 md:mx-2 hover:text-black first-letter:capitalize text-base;
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
