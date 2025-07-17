import { createCookieSessionStorage, redirect } from "@remix-run/node"
import { UserSession } from "./types"
import { backendFetch } from "@/utils/fetch"
import { BACKEND_API_BASE_URL_HTTP } from "@/utils/envvars"

// Environment Variables
const SESSION_SECRET = "supersecret" // to do

// Session Storage Configurations
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "accessToken",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [SESSION_SECRET],
    maxAge: 3600, // 1 hour
  },
})

export const refreshTokenStorage = createCookieSessionStorage({
  cookie: {
    name: "refreshToken",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [SESSION_SECRET],
    maxAge: 604800, // 7 days
  },
})

// Utility Functions
function authIsDisabled() {
  return (
    process.env.AUTH_ENABLED == undefined || process.env.AUTH_ENABLED == "false"
  )
}

async function fetchUserProfile(accessToken: string) {
  try {
    const response = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.status}`)
    }

    const data = await response.json()
    return {
      givenName: data.givenName,
      familyName: data.surname,
      displayName: data.displayName,
      email: data.mail || data.userPrincipalName,
    }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return {}
  }
}

async function validateToken(token: string) {
  try {
    const response = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.ok
  } catch (error) {
    return false
  }
}

async function refreshAccessToken(refreshToken: string) {
  const tokenEndpoint = `https://login.microsoftonline.com/${process.env.MSAUTH_APP_REG_TENANT_ID}/oauth2/v2.0/token`
  const params = new URLSearchParams({
    client_id: process.env.MSAUTH_APP_REG_CLIENT_ID!,
    client_secret: process.env.MSAUTH_APP_REG_CLIENT_SECRET!,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
    scope: "https://graph.microsoft.com/.default offline_access",
  })
  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  })
  if (!response.ok) {
    throw new Error("Failed to refresh token")
  }
  const data = await response.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  }
}

async function updateSessionWithNewTokens(
  request: Request,
  userSession: UserSession,
  accessToken: string,
  refreshToken: string
) {
  const session = await sessionStorage.getSession()
  session.set("user", { ...userSession, accessToken })

  const refreshSession = await refreshTokenStorage.getSession()
  refreshSession.set("refreshToken", refreshToken)

  const [sessionCookie, refreshCookie] = await Promise.all([
    sessionStorage.commitSession(session),
    refreshTokenStorage.commitSession(refreshSession),
  ])

  throw redirect(request.url, {
    headers: [
      ["Set-Cookie", sessionCookie],
      ["Set-Cookie", refreshCookie],
    ],
  })
}

// Main Authentication Functions
export async function getUserSession(request: Request) {
  if (authIsDisabled()) {
    return {
      accessToken: "fakeToken",
      name: {
        givenName: "Auth",
        familyName: "Disabled",
      },
    }
  }

  const cookieHeader = request.headers.get("Cookie")
  const session = await sessionStorage.getSession(cookieHeader)
  const userSession = session.get("user")

  if (userSession?.accessToken && userSession?.name) {
    return userSession
  }

  // If we don't have a valid session with user name data, try to refresh
  const refreshSession = await refreshTokenStorage.getSession(cookieHeader)
  const refreshToken = refreshSession.get("refreshToken")

  if (!refreshToken) {
    console.log("No refresh token found")
    throw redirect("/auth")
  }

  try {
    const newToken = await refreshAccessToken(refreshToken)
    const name = await fetchUserProfile(newToken.accessToken)

    const updatedSession = {
      accessToken: newToken.accessToken,
      name: userSession?.name || name,
    }

    throw await updateSessionWithNewTokens(
      request,
      updatedSession,
      newToken.accessToken,
      newToken.refreshToken
    )
  } catch (error) {
    if (error instanceof Response) throw error
    console.error("Error refreshing token:", error)
    throw redirect("/auth")
  }
}

export async function getUserToken(request: Request) {
  try {
    const userSession = await getUserSession(request)
    const accessToken = userSession.accessToken

    if (!accessToken) {
      console.log("No access token found")
      throw redirect("/auth")
    }

    const isValid = await validateToken(accessToken)
    if (isValid) {
      return accessToken
    }

    // If token is invalid, try to refresh
    const refreshSession = await refreshTokenStorage.getSession(
      request.headers.get("Cookie")
    )
    const refreshToken = refreshSession.get("refreshToken")

    if (!refreshToken) {
      console.log("No refresh token found")
      throw redirect("/auth")
    }

    const newToken = await refreshAccessToken(refreshToken)

    // Re-fetch the user profile to make sure we have the latest data
    const name = await fetchUserProfile(newToken.accessToken)
    const updatedSession = {
      ...userSession,
      name: userSession.name || name,
    }

    throw await updateSessionWithNewTokens(
      request,
      updatedSession,
      newToken.accessToken,
      newToken.refreshToken
    )
  } catch (error) {
    if (error instanceof Response) throw error
    throw redirect("/auth")
  }
}

export async function requiredUserSession(request: Request) {
  if (authIsDisabled()) {
    return "fakeToken"
  }
  const token = await getUserToken(request)
  if (!token) {
    console.log("No token found")
    throw redirect("/auth")
  }
  return token
}

export async function getUserName(request: Request) {
  if (authIsDisabled()) {
    return {
      lastName: "Disabled",
      firstName: "Auth",
    }
  }
  const userSession = await getUserSession(request)

  const { name } = userSession
  return {
    lastName: name?.familyName,
    firstName: name?.givenName,
  }
}

export async function logout(request: Request) {
  const cookieHeader = request.headers.get("Cookie")
  const session = await sessionStorage.getSession(cookieHeader)
  const refreshSession = await refreshTokenStorage.getSession(cookieHeader)

  const [destroySessionCookie, destroyRefreshCookie] = await Promise.all([
    sessionStorage.destroySession(session),
    refreshTokenStorage.destroySession(refreshSession),
  ])

  return redirect("/auth", {
    headers: [
      ["Set-Cookie", destroySessionCookie],
      ["Set-Cookie", destroyRefreshCookie],
    ],
  })
}

interface StoreSessionResponse {
  status: "success" | "error"
  error?: string
}

export async function storeUserSession(
  token: string
): Promise<StoreSessionResponse> {
  if (!token) {
    return {
      status: "error",
      error: "No token provided",
    }
  }

  try {
    const response = await backendFetch(
      token,
      "POST",
      `${BACKEND_API_BASE_URL_HTTP}/user/auth/login`
    )

    if (!response.ok) {
      throw new Error(`Failed to store session: ${response.status}`)
    }

    const data = await response.json()

    return {
      status: "success",
    }
  } catch (error) {
    console.error("Error storing user session:", error)
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
