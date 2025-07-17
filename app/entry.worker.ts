/// <reference lib="WebWorker" />

export {}

declare let self: ServiceWorkerGlobalScope

self.addEventListener("install", (event) => {
  console.log("Service worker installed")

  event.waitUntil(self.skipWaiting())
})

self.addEventListener("activate", (event) => {
  console.log("Service worker activated")

  event.waitUntil(self.clients.claim())
})

// 💡 Listen for manual skipWaiting trigger
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("Skipping waiting service worker via message")
    self.skipWaiting()
  }
})
