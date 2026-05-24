import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowLeftRight, GitCompare } from "lucide-react"

import BodyDiff from "@/components/message/body-diff"
import InfoCards from "@/components/message/message-metadata"
import MetadataDiff from "@/components/message/metadata-diff"
import { Badge } from "@/components/ui/badge"
import {
  getAllComparePairs,
  getFormattedDate,
  getMessageData,
  getMessageHistory,
  getMessageSource,
  getMessageSourceLabel,
  getMessageVersion,
  slugifyCapturedAt,
} from "@/lib/messages"
import {
  getCanonicalMessagePath,
  parseMessageIdFromSlug,
} from "@/lib/slugs.mjs"
import { MessageSource } from "@/types/message"

type Props = {
  params: Promise<{ id: string; from: string; to: string }>
}

export const dynamicParams = false

export async function generateStaticParams() {
  return getAllComparePairs(MessageSource.Roadmap)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const message = getMessageData(id)
  const canonicalPath = message ? getCanonicalMessagePath(message) : `/roadmap/${id}`

  return {
    title: `${message?.Id ?? parseMessageIdFromSlug(id)} - version comparison`,
    robots: { index: false, follow: true },
    alternates: { canonical: canonicalPath },
  }
}

export default async function ComparePage({ params }: Props) {
  const { id, from, to } = await params
  const messageId = parseMessageIdFromSlug(id)
  const history = getMessageHistory(messageId)

  if (!history) notFound()

  const fromVersion = getMessageVersion(messageId, from)
  const toVersion = getMessageVersion(messageId, to)

  if (!fromVersion || !toVersion) notFound()
  if (getMessageSource(toVersion.message) !== MessageSource.Roadmap) notFound()

  const latest = history.versions[history.versions.length - 1]
  const basePath = getCanonicalMessagePath(latest.message)
  const isToLatest = toVersion.capturedAt === latest.capturedAt
  const fromDate = getFormattedDate(fromVersion.capturedAt)
  const toDate = getFormattedDate(toVersion.capturedAt)
  const sourceLabel = getMessageSourceLabel(toVersion.message)

  const swapHref = `${basePath}/compare/${slugifyCapturedAt(
    toVersion.capturedAt
  )}/${slugifyCapturedAt(fromVersion.capturedAt)}`

  return (
    <main className="page-shell min-w-0">
      <div className="flex min-w-0 flex-col items-start gap-5">
        <Link
          href={basePath}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft size={14} /> Back to latest version
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-muted-foreground">
          <GitCompare size={16} />
          <span>
            Comparing{" "}
            <Link
              href={`${basePath}/v/${slugifyCapturedAt(
                fromVersion.capturedAt
              )}`}
              className="text-foreground underline underline-offset-4"
            >
              {fromDate}
            </Link>{" "}
            {"->"}{" "}
            {isToLatest ? (
              <span className="text-foreground">latest ({toDate})</span>
            ) : (
              <Link
                href={`${basePath}/v/${slugifyCapturedAt(
                  toVersion.capturedAt
                )}`}
                className="text-foreground underline underline-offset-4"
              >
                {toDate}
              </Link>
            )}
          </span>
          <Link
            href={swapHref}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground hover:bg-muted"
          >
            <ArrowLeftRight size={12} /> Swap
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{sourceLabel}</Badge>
          <Badge variant="secondary">
            {fromDate} to {toDate}
          </Badge>
        </div>

        <h1 className="max-w-6xl break-words text-3xl font-semibold leading-tight text-foreground md:text-5xl md:leading-tight">
          <span className="font-mono text-primary">{toVersion.message.Id}</span>{" "}
          {toVersion.message.Title}
        </h1>

        <section className="w-full space-y-4">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground">
            Metadata at {isToLatest ? "latest" : toDate}
          </h2>
          <InfoCards id={messageId} layout="grid" message={toVersion.message} />
        </section>

        <div className="w-full space-y-4">
          <MetadataDiff
            oldMessage={fromVersion.message}
            newMessage={toVersion.message}
          />

          <section className="w-full rounded-md border bg-card p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
              Body changes
            </h2>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="diff-del">removed text</span>
              <span className="diff-ins">added text</span>
            </div>
            <BodyDiff
              oldHtml={fromVersion.message.Body?.Content || ""}
              newHtml={toVersion.message.Body?.Content || ""}
              currentId={messageId}
            />
          </section>
        </div>
      </div>
    </main>
  )
}
