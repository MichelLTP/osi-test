/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { RemixBrowser } from "@remix-run/react"
import { startTransition, StrictMode } from "react"
import { hydrateRoot } from "react-dom/client"

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>
  )
})

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/entry.worker.js")
      .then((reg) => {
        // Always check for updates
        reg.update()

        // If there's a waiting worker (new version), activate it
        if (reg.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" })
        }

        // Reload when the new service worker takes control
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          window.location.reload()
        })
      })
      .catch((err) => {
        console.error("Service worker registration failed:", err)
      })
  })
}
