import {
  authenticator,
  MicrosoftAuthUser,
} from "@/data/auth/azuread/azuread.server"
import {
  refreshTokenStorage,
  sessionStorage,
  storeUserSession,
} from "@/data/auth/session.server"
import { redirect, type LoaderFunctionArgs } from "@remix-run/node"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = (await authenticator.authenticate(
    "microsoft",
    request
  )) as MicrosoftAuthUser

  const userSession = await sessionStorage.getSession()
  userSession.set("user", {
    accessToken: user.accessToken,
    name: {
      familyName: user.name?.familyName,
      givenName: user.name?.givenName,
    },
  })

  const refreshTokenSession = await refreshTokenStorage.getSession()

  refreshTokenSession.set("refreshToken", user.refreshToken)

  const [sessionCookie, refreshCookie] = await Promise.all([
    sessionStorage.commitSession(userSession),
    refreshTokenStorage.commitSession(refreshTokenSession),
  ])

  await storeUserSession(user.accessToken)

  return redirect("/chatSi", {
    headers: [
      ["Set-Cookie", sessionCookie],
      ["Set-Cookie", refreshCookie],
    ],
  })
}
