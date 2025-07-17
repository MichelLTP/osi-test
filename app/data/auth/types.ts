export type UserProfile = {
  givenName?: string
  familyName?: string
  displayName?: string
  email?: string
}

export type UserSession = {
  accessToken: string
  name: UserProfile
}
