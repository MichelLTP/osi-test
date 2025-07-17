import type { WebAppManifest } from "@remix-pwa/dev"
import { json } from "@remix-run/node"

export const loader = () => {
  return json(
    {
      short_name: "Open SI",
      name: "Open SI",
      start_url: "/",
      display: "standalone",
      background_color: "#1F3044",
      theme_color: "#6785FB",
      icons: [
        {
          src: "/img/icons/OSI_transpatent_48.svg",
          sizes: "48x48",
          type: "image/svg+xml",
        },
        {
          src: "/img/icons/OSI_transpatent_192.svg",
          sizes: "192x192",
          type: "image/svg+xml",
        },
        {
          src: "/img/icons/OSI_transpatent_512.svg",
          sizes: "512x512",
          type: "image/svg+xml",
        },
      ],
    } as WebAppManifest,
    {
      headers: {
        "Cache-Control": "public, max-age=600",
        "Content-Type": "application/manifest+json",
      },
    }
  )
}
