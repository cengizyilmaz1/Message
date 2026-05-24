import { siteConfig } from "@/config/site"
import { Message } from "@/types/message"
import {
  getMessageDescription,
  getMessageSourceLabel,
} from "@/lib/messages"
import { getCanonicalMessagePath } from "@/lib/slugs.mjs"

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`
}

export function getMessageSeoTitle(message: Message | undefined, id: string) {
  return message ? `${message.Id} - ${message.Title}` : id
}

export function getMessageSeoDescription(message: Message | undefined) {
  return getMessageDescription(message) || siteConfig.description
}

export function getMessageJsonLd(message: Message) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${message.Id} - ${message.Title}`,
    description: getMessageSeoDescription(message),
    datePublished: message.StartDateTime,
    dateModified: message.LastModifiedDateTime || message.StartDateTime,
    mainEntityOfPage: absoluteUrl(getCanonicalMessagePath(message)),
    articleSection: getMessageSourceLabel(message),
    keywords: [...(message.Services ?? []), ...(message.Tags ?? [])].join(", "),
    publisher: {
      "@type": "Organization",
      name: siteConfig.owner,
      url: siteConfig.parentUrl,
    },
  }
}
