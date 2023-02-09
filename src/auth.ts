const AUTH_API_URL = '/userdetails'

type KNOWN_ROLES =
  | 'ROLE_SUPERUSER'
  | 'ROLE_MAPSTORE_ADMIN'
  | 'ROLE_USER'
  | 'ROLE_ADMINISTRATOR'
  | 'ROLE_EXTRACTORAPP'
  | 'ROLE_GN_ADMIN'
  | 'ROLE_EMAILPROXY'
  | string

export interface User {
  roles: KNOWN_ROLES[]
  username: string
}

export interface AdminMap {
  admin: boolean
  console: boolean
  catalog: boolean
  mapstore: boolean
}

const userStub: User = {
  roles: [
    'ROLE_SUPERUSER',
    'ROLE_MAPSTORE_ADMIN',
    'ROLE_USER',
    'ROLE_ADMINISTRATOR',
    'ROLE_EXTRACTORAPP',
    'ROLE_GN_ADMIN',
    'ROLE_EMAILPROXY',
  ],
  username: 'testadmin',
}

export async function getUserDetails(): Promise<User> {
  return new Promise(resolve => resolve(userStub))
  // return fetch(AUTH_API_URL).then(response => response.json())
}

export function affectRoles(user: User): AdminMap {
  return user.roles.reduce((roles, role) => {
    switch (role) {
      case 'ROLE_SUPERUSER':
      case 'ROLE_ORGADMIN':
        return {
          ...roles,
          admin: true,
          console: true,
        }
      case 'ROLE_GN_ADMIN':
        return {
          ...roles,
          admin: true,
          catalog: true,
        }
      case 'ROLE_ADMINISTRATOR':
        return {
          ...roles,
          admin: true,
        }
      case 'ROLE_MAPSTORE_ADMIN':
        return {
          ...roles,
          admin: true,
          mapstore: true,
        }
      default:
        return roles
    }
  }, {})
}
