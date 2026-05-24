import { Metadata } from "next"
import { notFound } from "next/navigation"

import { CompareHistoryClient } from "@/components/message/history-page-client"
import {
  getAllComparePairs,
  getMessageData,
  getMessageSource,
  getMessageVersion,
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
  const message = getMessageData(messageId)
  const fromVersion = getMessageVersion(messageId, from)
  const toVersion = getMessageVersion(messageId, to)

  if (!fromVersion || !toVersion) notFound()
  if (getMessageSource(toVersion.message) !== MessageSource.Roadmap) notFound()

  const basePath = message ? getCanonicalMessagePath(message) : `/roadmap/${id}`

  return (
    <main className="page-shell min-w-0">
      <CompareHistoryClient
        basePath={basePath}
        from={from}
        messageId={messageId}
        to={to}
      />
    </main>
  )
}
