const AUTH_API_URL = '/whoami'
const CONSOLE_PLATFORM_API_URL = '/console/private/platform/infos'

type KNOWN_ROLES =
  | 'ROLE_SUPERUSER'
  | 'ROLE_ORGADMIN'
  | 'ROLE_MAPSTORE_ADMIN'
  | 'ROLE_USER'
  | 'ROLE_ADMINISTRATOR'
  | 'ROLE_EXTRACTORAPP'
  | 'ROLE_GN_ADMIN'
  | 'ROLE_EMAILPROXY'
  | 'ROLE_ANONYMOUS'

interface WhoAmIResponse {
  GeorchestraUser: {
    roles: KNOWN_ROLES[]
    username: string
  }
}

export interface User {
  username: string
  anonymous: boolean
  adminRoles: AdminRoles | null
}

export interface AdminRoles {
  superUser: boolean
  admin: boolean
  console: boolean
  catalog: boolean
  viewer: boolean
}

export async function getUserDetails(): Promise<User> {
  return fetch(AUTH_API_URL)
    .then(response => response.json())
    .then((json: WhoAmIResponse) => {
      const user = json.GeorchestraUser
      const roles = user.roles
      return {
        username: user.username,
        anonymous: roles.indexOf('ROLE_ANONYMOUS') > -1,
        adminRoles: getAdminRoles(roles),
      }
    })
}

export function getAdminRoles(roles: KNOWN_ROLES[]): AdminRoles | null {
  const superUser = roles.indexOf('ROLE_SUPERUSER') > -1
  const console = superUser || roles.indexOf('ROLE_ORGADMIN') > -1
  const catalog = superUser || roles.indexOf('ROLE_GN_ADMIN') > -1
  const viewer = superUser || roles.indexOf('ROLE_MAPSTORE_ADMIN') > -1
  const admin =
    console || catalog || viewer || roles.indexOf('ROLE_ADMINISTRATOR') > -1
  if (!admin) return null
  return {
    superUser,
    admin,
    console,
    catalog,
    viewer,
  }
}

export interface PlatformInfos {
  analyticsEnabled: boolean
  extractorappEnabled: boolean
  saslEnabled: boolean
}

export async function getPlatformInfos(): Promise<PlatformInfos> {
  return fetch(CONSOLE_PLATFORM_API_URL)
    .then(response => response.json())
    .then((json: PlatformInfos) => {
      return {
        analyticsEnabled: json.analyticsEnabled,
        extractorappEnabled: json.extractorappEnabled,
        saslEnabled: json.saslEnabled,
      }
    })
}
