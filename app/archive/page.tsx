import { Metadata } from "next"

import { Archive } from "lucide-react"

import MessagesTable from "@/components/table/messages-table"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { siteConfig } from "@/config/site"
import { getArchiveMessages } from "@/lib/messages"

export const metadata: Metadata = {
  title: "Archive",
  description:
    "Expired Microsoft 365 Message Center announcements preserved for reference.",
  alternates: {
    canonical: "/archive",
  },
  openGraph: {
    title: `Archive | ${siteConfig.name}`,
    description:
      "Expired Microsoft 365 Message Center announcements preserved for reference.",
    url: "/archive",
    images: ["/og-default.png"],
  },
}

export default function ArchivePage() {
  const archiveMessages = getArchiveMessages()

  return (
    <main className="page-shell">
      <Breadcrumb items={[{ label: "Archive" }]} />
      <section className="page-intro">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Archive size={36} className="text-primary" />
            <h1 className="page-title text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70">
              Expired Message Center archive
            </h1>
          </div>
          <p className="page-description">
            Historical Message Center posts that are no longer active in the live
            feed, kept as a searchable index for reference and citation.
          </p>
        </div>
      </section>

      <MessagesTable
        messages={[]}
        archiveMessages={archiveMessages}
        includeArchiveFetch={false}
        initialSourceFilter="messageCenter"
      />
    </main>
  )
}

