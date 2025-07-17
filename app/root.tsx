import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react"
import "./tailwind.css"
import { ManifestLink } from "@remix-pwa/sw"
import clsx from "clsx"
import "@fortawesome/fontawesome-svg-core/styles.css"
import { config } from "@fortawesome/fontawesome-svg-core"
config.autoAddCss = false
import {
  NonFlashOfWrongThemeEls,
  Theme,
  ThemeProvider,
  useTheme,
} from "./utils/darkTheme/theme-provider"
import { LoaderFunction, MetaFunction } from "@remix-run/node"
import { getThemeSession } from "./utils/darkTheme/theme.server"
import { getUserName } from "@/data/auth/session.server"
import { useAuthUserName } from "@/store/auth"
import { useEffect } from "react"

export const meta: MetaFunction = () => {
  return [
    { title: "Open SI" },
    {
      property: "og:title",
      content: "Open SI",
    },
    { name: "description", content: "Welcome to Open SI!" },
  ]
}

export default function App() {
  const { dataTheme } = useLoaderData<typeof loader>()
  return (
    <ThemeProvider specifiedTheme={dataTheme?.theme}>
      <AppContent />
    </ThemeProvider>
  )
}

function AppContent() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  const [theme] = useTheme()
  const { dataTheme, userName } = useLoaderData<typeof loader>()
  const { setUserName } = useAuthUserName()

  useEffect(() => {
    setUserName(userName)
  }, [userName, setUserName])

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <Meta />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap"
        />

        <ManifestLink />
        <Links />
        <NonFlashOfWrongThemeEls ssrTheme={Boolean(dataTheme.theme)} />
        <script src=" https://cdn.jsdelivr.net/npm/hacktimer@1.1.3/HackTimer.min.js "></script>
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export type LoaderData = {
  theme: Theme | null
}

export const loader: LoaderFunction = async ({ request }) => {
  const themeSession = await getThemeSession(request)
  const userName = await getUserName(request)

  const dataTheme: LoaderData = {
    theme: themeSession.getTheme(),
  }
  return { dataTheme, userName }
}
