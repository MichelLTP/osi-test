import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"
import "./tailwind.css"
import { ManifestLink } from "@remix-pwa/sw"
import "@fortawesome/fontawesome-svg-core/styles.css"
import { config } from "@fortawesome/fontawesome-svg-core"
config.autoAddCss = false
import {
  Theme,
} from "./utils/darkTheme/theme-provider"
import { MetaFunction } from "@remix-run/node"

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
  return <AppContent />
}

function AppContent() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

function Layout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en">
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
