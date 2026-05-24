#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"

import { getCanonicalMessageUrl } from "../lib/slugs.mjs"

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, "@data")
const PUBLIC_DIR = path.join(ROOT, "public")
const ARCHIVE_DIR = path.join(DATA_DIR, "archive")
const SITE_URL = process.env.SITE_URL || "https://message.cengizyilmaz.net"

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"))
  } catch {
    return fallback
  }
}

function stripHtml(value = "") {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

function limitText(value = "", maxLength = 500) {
  const clean = String(value).replace(/\s+/g, " ").trim()
  if (clean.length <= maxLength) return clean

  return `${clean.slice(0, maxLength).trim()}...`
}

function getDetailValue(item, name) {
  return item?.Details?.find((detail) => detail?.Name === name)?.Value ?? ""
}

function getMessageSummaryText(item) {
  const summary =
    getDetailValue(item, "Summary") ||
    item?.Body?.Markdown ||
    stripHtml(item?.Body?.Content)

  return limitText(summary)
}

function getMessageSource(item) {
  return item?.Source === "roadmap" ? "roadmap" : "messageCenter"
}

function getMessageSourceLabel(item) {
  return getMessageSource(item) === "roadmap"
    ? "Microsoft 365 Roadmap"
    : "Message Center"
}

function toIndexRecord(item, url = getCanonicalMessageUrl(item, SITE_URL)) {
  return {
    Id: item.Id,
    Title: item.Title,
    Source: getMessageSource(item),
    Url: url,
    Services: item.Services ?? [],
    StartDateTime: item.StartDateTime,
    EndDateTime: item.EndDateTime,
    LastModifiedDateTime: item.LastModifiedDateTime,
    IsMajorChange: item.IsMajorChange ?? false,
    Category: item.Category,
    Tags: item.Tags ?? [],
    Summary: getMessageSummaryText(item),
  }
}

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function getRssDate(item) {
  const value = item.LastModifiedDateTime || item.StartDateTime
  return new Date(value).toUTCString()
}

function toRssItem(item) {
  const source = getMessageSourceLabel(item)
  const url = getCanonicalMessageUrl(item, SITE_URL)
  const categories = [source, ...(item.Services ?? [])]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
  const categoryXml = categories
    .map((category) => `    <category>${escapeXml(category)}</category>`)
    .join("\n")

  return `  <item>
    <title>${escapeXml(`${item.Id}: ${item.Title}`)}</title>
    <link>${escapeXml(url)}</link>
    <guid isPermaLink="true">${escapeXml(url)}</guid>
    <pubDate>${getRssDate(item)}</pubDate>
    <description>${escapeXml(getMessageSummaryText(item))}</description>
${categoryXml}
  </item>`
}

function readArchiveOnly(activeIds) {
  if (!fs.existsSync(ARCHIVE_DIR)) return []

  return fs
    .readdirSync(ARCHIVE_DIR)
    .filter((file) => file.endsWith(".json"))
    .filter((file) => !activeIds.has(file.slice(0, -5)))
    .map((file) => readJson(path.join(ARCHIVE_DIR, file), null))
    .filter((item) => item?.Id && item?.Title)
}

function sortByLatest(items) {
  return [...items].sort((a, b) =>
    String(b.LastModifiedDateTime || b.StartDateTime || "").localeCompare(
      String(a.LastModifiedDateTime || a.StartDateTime || "")
    )
  )
}

function main() {
  const messages = readJson(path.join(DATA_DIR, "messages.json"), [])
  const roadmap = readJson(path.join(DATA_DIR, "roadmap.json"), [])
  const activeIds = new Set([...messages, ...roadmap].map((item) => item.Id))
  const archiveOnly = readArchiveOnly(activeIds)

  const indexRecords = sortByLatest([
    ...messages.map((item) => toIndexRecord(item)),
    ...roadmap.map((item) => toIndexRecord(item)),
    ...archiveOnly.map((item) => toIndexRecord(item, `${SITE_URL}/archive`)),
  ])
  const indexJson = JSON.stringify(indexRecords)
  fs.writeFileSync(path.join(DATA_DIR, "messages-index.json"), indexJson)
  fs.writeFileSync(path.join(PUBLIC_DIR, "messages-index.json"), indexJson)
  console.log(`[feeds] wrote ${indexRecords.length} records to messages-index.json`)

  const rssItems = sortByLatest([...messages, ...roadmap]).slice(0, 500)
  const lastBuildDate = rssItems[0] ? getRssDate(rssItems[0]) : new Date().toUTCString()
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Microsoft 365 Message Center and Roadmap Archive</title>
  <link>${SITE_URL}/</link>
  <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
  <description>Latest Microsoft 365 Message Center messages and Microsoft 365 Roadmap posts from message.cengizyilmaz.net. Message Center posts vary by tenant; always use your tenant's Message Center as the source of truth.</description>
  <language>en-us</language>
  <lastBuildDate>${lastBuildDate}</lastBuildDate>
  <ttl>60</ttl>
${rssItems.map(toRssItem).join("\n")}
</channel>
</rss>
`

  fs.writeFileSync(path.join(PUBLIC_DIR, "rss.xml"), rssXml)
  console.log(`[feeds] wrote ${rssItems.length} items to public/rss.xml`)
}

main()
