import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, GitCompare, History } from "lucide-react"

import {
  getAllVersionParams,
  getFormattedDate,
  getMessageData,
  getMessageHistory,
  getMessageSourceLabel,
  getMessageVersion,
  linkifyMcIds,
  slugifyCapturedAt,
} from "@/lib/messages"
import {
  getCanonicalMessagePath,
  parseMessageIdFromSlug,
} from "@/lib/slugs.mjs"
import BodyDiff from "@/components/message/body-diff"
import InfoCards from "@/components/message/message-metadata"
import MessageContent from "@/components/message/message-content"
import { Badge } from "@/components/ui/badge"
import { MessageSource } from "@/types/message"

type Props = {
  params: Promise<{ id: string; capturedAt: string }>
}

export const dynamicParams = false

export async function generateStaticParams() {
  return getAllVersionParams(MessageSource.MessageCenter)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, capturedAt } = await params
  const message = getMessageData(id)
  const canonicalPath = message ? getCanonicalMessagePath(message) : `/message/${id}`
  return {
    title: `${message?.Id ?? parseMessageIdFromSlug(id)} - historical version`,
    robots: { index: false, follow: true },
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: `${message?.Id ?? parseMessageIdFromSlug(id)} - historical version`,
      url: `${canonicalPath}/v/${capturedAt}`,
    },
  }
}

export default async function VersionPage({ params }: Props) {
  const { id, capturedAt } = await params
  const messageId = parseMessageIdFromSlug(id)
  const history = getMessageHistory(messageId)
  const version = getMessageVersion(messageId, capturedAt)
  if (!history || !version) notFound()

  const latest = history.versions[history.versions.length - 1]
  const basePath = getCanonicalMessagePath(latest.message)
  const isLatest = version.capturedAt === latest.capturedAt
  const latestSlug = slugifyCapturedAt(latest.capturedAt)
  const versionSlug = slugifyCapturedAt(version.capturedAt)
  const sourceLabel = getMessageSourceLabel(version.message)

  return (
    <main className="page-shell min-w-0">
      <div className="flex min-w-0 flex-col items-start gap-5">
        <Link
          href={basePath}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft size={14} /> Back to latest version
        </Link>

        <div className="flex w-full flex-col gap-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/70 dark:text-amber-100">
          <div className="flex flex-wrap items-center gap-2">
            <History size={16} />
            <span>
              Historical snapshot from{" "}
              <strong>{getFormattedDate(version.capturedAt)}</strong>.
              {!isLatest && " This is not the latest version."}
            </span>
          </div>
          {!isLatest && (
            <div className="flex flex-wrap gap-3">
              <Link
                href={basePath}
                className="font-medium underline underline-offset-4"
              >
                View latest
              </Link>
              <Link
                href={`${basePath}/compare/${versionSlug}/${latestSlug}`}
                className="inline-flex items-center gap-1 font-medium underline underline-offset-4"
              >
                <GitCompare size={14} /> Compare to latest
              </Link>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{sourceLabel}</Badge>
          <Badge variant="secondary">
            {getFormattedDate(version.capturedAt)}
          </Badge>
        </div>

        <h1 className="max-w-6xl break-words text-3xl font-semibold leading-tight text-foreground md:text-5xl md:leading-tight">
          <span className="font-mono text-primary">{version.message.Id}</span>{" "}
          {version.message.Title}
        </h1>

        {!isLatest && (
          <section className="w-full space-y-4">
            <h2 className="text-sm font-semibold uppercase text-muted-foreground">
              Metadata at this snapshot
            </h2>
            <InfoCards id={messageId} layout="grid" message={version.message} />
          </section>
        )}

        {!isLatest && (
          <section className="w-full rounded-md border bg-card p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
              Changes since this version
            </h2>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="diff-del">removed text</span>
              <span className="diff-ins">added text</span>
            </div>
            <BodyDiff
              oldHtml={version.message.Body?.Content || ""}
              newHtml={latest.message.Body?.Content || ""}
              currentId={messageId}
            />
          </section>
        )}

        <section className="w-full rounded-md border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">
            Snapshot body
          </h2>
          <MessageContent
            html={linkifyMcIds(version.message.Body?.Content || "", messageId)}
          />
        </section>
      </div>
    </main>
  )
}
