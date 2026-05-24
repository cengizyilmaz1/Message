import { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"
import {
  getAllMessageStaticParams,
  getAllRoadmapStaticParams,
  getAllServices,
  getMessageData,
} from "@/lib/messages"
import { getCanonicalMessagePath, slugifyService } from "@/lib/slugs.mjs"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  const home = {
    url: siteConfig.url,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 1,
  }

  const messages = getAllMessageStaticParams().map(({ id }) => {
    const msg = getMessageData(id)
    const lastModified = msg?.LastModifiedDateTime || msg?.StartDateTime

    return {
      url: `${siteConfig.url}${msg ? getCanonicalMessagePath(msg) : `/message/${id}`}`,
      lastModified: lastModified ? new Date(lastModified) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }
  })

  const roadmapItems = getAllRoadmapStaticParams().map(({ id }) => {
    const msg = getMessageData(id)
    const lastModified = msg?.LastModifiedDateTime || msg?.StartDateTime

    return {
      url: `${siteConfig.url}${msg ? getCanonicalMessagePath(msg) : `/roadmap/${id}`}`,
      lastModified: lastModified ? new Date(lastModified) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }
  })

  const staticPages = ["/archive", "/roadmap"].map(
    (path) => ({
      url: `${siteConfig.url}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })
  )

  const services = getAllServices().map((service) => ({
    url: `${siteConfig.url}/service/${slugifyService(service)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }))

  return [home, ...staticPages, ...services, ...messages, ...roadmapItems]
}
