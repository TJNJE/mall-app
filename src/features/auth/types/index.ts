export type Role = 'admin' | 'user'

export interface User {
  id: string
  username: string
  token: string
  role: Role
}
