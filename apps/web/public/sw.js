const CACHE_NAME = "vinoplastic-offline-v1"
const OFFLINE_PAGE = "/offline.html"

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_PAGE))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      await Promise.all(
        keys
          .filter((key) => key.startsWith("vinoplastic-offline-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
      await self.clients.claim()
    })
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET" || request.mode !== "navigate") return
  if (new URL(request.url).origin !== self.location.origin) return

  event.respondWith(
    fetch(request).catch(async () =>
      (await caches.match(OFFLINE_PAGE)) ?? Response.error()
    )
  )
})
