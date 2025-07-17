import { MicrosoftStrategy } from "remix-auth-microsoft"
import { Authenticator } from "remix-auth"
import { refreshTokenStorage, sessionStorage } from "@/data/auth/session.server"
import { redirect } from "@remix-run/node"
export interface ExtraParams {}
export interface Name {}
export interface MicrosoftAuthUser {
  accessToken: string
  refreshToken?: string
  extraParams?: ExtraParams
  name?: Name
}
export const authenticator = new Authenticator(sessionStorage)

const microsoftStrategy = new MicrosoftStrategy(
  {
    clientId: process.env.MSAUTH_APP_REG_CLIENT_ID!,
    clientSecret: process.env.MSAUTH_APP_REG_CLIENT_SECRET!,
    redirectUri: "/auth/microsoft/callback",
    tenantId: process.env.MSAUTH_APP_REG_TENANT_ID!,
    prompt: "login",
    scope: "https://graph.microsoft.com/.default offline_access",
  },

  async ({ accessToken, refreshToken, extraParams, profile }) => {
    const { name } = profile

    const res = await fetch(
      `https://graph.microsoft.com/v1.0/me/transitiveMemberOf/microsoft.graph.group?$count=true&$orderby=displayName&$filter=startswith(displayName, 'Cloud-OPENSI') or startswith(displayName, '${process.env.AD_GROUP}')`,
      {
        headers: { Authorization: accessToken, ConsistencyLevel: "eventual" },
      }
    )

    if (!res.ok) {
      throw new Error("Failed to fetch user groups")
    }
    const data = await res.json()
    if (data.value.length == 0) {
      throw redirect("/nopermissiongroup")
    }

    const refreshSession = await refreshTokenStorage.getSession()
    refreshSession.set("refreshToken", refreshToken)

    return {
      accessToken,
      refreshToken,
      extraParams,
      name,
    } as MicrosoftAuthUser
  }
)
authenticator.use(microsoftStrategy)
