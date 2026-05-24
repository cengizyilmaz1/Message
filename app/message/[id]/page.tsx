import { Metadata } from "next"
import { notFound } from "next/navigation"
import { AlertTriangle, Clock } from "lucide-react"

import { siteConfig } from "@/config/site"
import {
  getAllMessageStaticParams,
  getFormattedDate,
  getMessageDescription,
  getMessageData,
  getMessageSource,
  getMessageSourceLabel,
  isArchiveOnlyMessage,
} from "@/lib/messages"
import { getCanonicalMessagePath } from "@/lib/slugs.mjs"
import { MessageSource } from "@/types/message"
import MessageDetail from "@/components/message/message-detail"
import MessageMetadata from "@/components/message/message-metadata"
import { JsonLd } from "@/components/seo/json-ld"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import {
  absoluteUrl,
  getMessageJsonLd,
  getMessageSeoDescription,
  getMessageSeoTitle,
} from "@/lib/seo"
import { formatCategoryLabel } from "@/lib/filters"

type Props = {
  params: Promise<{ id: string }>
}

export const dynamicParams = false

function ArchivedMetadata({ msg }: { msg: NonNullable<ReturnType<typeof getMessageData>> }) {
  const rows = [
    ["ID", msg.Id],
    ["Source", "Message Center"],
    ["Service", (msg.Services ?? []).join(", ")],
    ["Category", formatCategoryLabel(msg.Category)],
    ["Severity", msg.Severity || "normal"],
    ["Last updated", getFormattedDate(msg.LastModifiedDateTime)],
    ["Start date", getFormattedDate(msg.StartDateTime)],
    ["End date", getFormattedDate(msg.EndDateTime)],
  ].filter(([, value]) => value)

  return (
    <div className="flex flex-col w-full">
      <div className="border-b border-border/60 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Details
        </h2>
      </div>
      <div className="px-4 py-1">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[90px_1fr] gap-3 border-b border-border/60 py-2.5 last:border-0 items-start"
          >
            <span className="text-xs font-medium text-muted-foreground pt-0.5">
              {label}
            </span>
            <span className="text-sm text-foreground">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function Page({ params }: Props) {
  const { id } = await params

  const msg = getMessageData(id)
  if (!msg) notFound()

  const source = getMessageSource(msg)
  const sourceLabel = getMessageSourceLabel(msg)
  const isRoadmap = source === MessageSource.Roadmap
  const isArchived = isArchiveOnlyMessage(msg.Id)

  const breadcrumbItems = isRoadmap
    ? [{ label: "Roadmap", href: "/roadmap" }, { label: msg.Id }]
    : [{ label: "Message Center", href: "/" }, { label: msg.Id }]

  const actionBy = msg.ActionRequiredByDateTime
    ? getFormattedDate(msg.ActionRequiredByDateTime)
    : null

  return (
    <>
      <JsonLd data={getMessageJsonLd(msg)} />
      <main className="page-shell min-w-0">
        <Breadcrumb items={breadcrumbItems} />

        {/* Hero */}
        <div className="flex flex-col gap-3 border-b border-border/50 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
              isRoadmap
                ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800/40 dark:bg-violet-950/30 dark:text-violet-400"
                : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/40 dark:bg-blue-950/30 dark:text-blue-400"
            }`}>
              {sourceLabel}
            </span>
            {msg.IsMajorChange && (
              <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-400">
                <AlertTriangle size={10} />
                Major change
              </span>
            )}
            {actionBy && (
              <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700 dark:border-orange-700/40 dark:bg-orange-950/30 dark:text-orange-400">
                <Clock size={10} />
                Action required by {actionBy}
              </span>
            )}
          </div>
          <h1 className="max-w-4xl break-words text-2xl font-bold leading-snug text-foreground md:text-[1.85rem]">
            <span className={`mr-2 font-mono text-lg font-semibold ${isRoadmap ? "text-violet-500 dark:text-violet-400" : "text-primary/70"}`}>
              {msg.Id}
            </span>
            {msg.Title}
          </h1>
        </div>

        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_300px] lg:items-start">
          <div className="min-w-0">
            {isArchived ? (
              <section className="w-full rounded-xl border bg-card px-5 py-4 shadow-sm">
                <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Archived record
                </h2>
                <p className="text-base leading-7 text-foreground/85">
                  {getMessageDescription(msg) ||
                    "This Message Center item is no longer active. The archive keeps its title, metadata, service classification, and timeline fields available for search and reference."}
                </p>
              </section>
            ) : (
              <MessageDetail id={msg.Id} />
            )}
          </div>

          <aside className="w-full lg:sticky lg:top-[4.5rem]">
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              {isArchived ? (
                <ArchivedMetadata msg={msg} />
              ) : (
                <MessageMetadata id={msg.Id} layout="stack" showHistoryLink />
              )}
            </div>
          </aside>
        </div>
      </main>
    </>
  )
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { id } = await params
  const msg = getMessageData(id)
  const title = getMessageSeoTitle(msg, id)
  const description = getMessageSeoDescription(msg)
  const url = msg ? getCanonicalMessagePath(msg) : `/message/${id}`
  const sourceLabel = getMessageSourceLabel(msg)
  const tags = [...(msg?.Services || []), ...(msg?.Tags || [])].filter(Boolean)

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      url: absoluteUrl(url),
      siteName: siteConfig.name,
      title,
      description,
      publishedTime: msg?.StartDateTime,
      modifiedTime: msg?.LastModifiedDateTime,
      section: sourceLabel,
      tags,
      images: [
        {
          url: "/og-default.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-default.png"],
    },
  }
}

export async function generateStaticParams() {
  const paths = getAllMessageStaticParams()
  return paths
}
