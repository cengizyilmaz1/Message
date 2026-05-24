import { Metadata } from "next"

import { Milestone } from "lucide-react"

import MessagesTable from "@/components/table/messages-table"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { siteConfig } from "@/config/site"
import { MessageSource } from "@/types/message"
import { getMessagesBySource } from "@/lib/messages"

export const metadata: Metadata = {
  title: "Microsoft 365 Roadmap",
  description:
    "Microsoft 365 Roadmap items indexed alongside Message Center announcements.",
  alternates: {
    canonical: "/roadmap",
  },
  openGraph: {
    title: `Microsoft 365 Roadmap | ${siteConfig.name}`,
    description:
      "Microsoft 365 Roadmap items indexed alongside Message Center announcements.",
    url: "/roadmap",
    images: ["/og-default.png"],
  },
}

export default function RoadmapPage() {
  const messages = getMessagesBySource(MessageSource.Roadmap)

  return (
    <main className="page-shell">
      <Breadcrumb items={[{ label: "Roadmap" }]} />
      <section className="page-intro">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Milestone size={36} className="text-primary" />
            <h1 className="page-title text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70">
              Microsoft 365 Roadmap
            </h1>
          </div>
          <p className="page-description">
            Roadmap records normalized into the same searchable archive as Message
            Center posts.
          </p>
        </div>
      </section>

      <MessagesTable
        messages={messages}
        includeArchiveFetch={false}
        initialSourceFilter="roadmap"
      />
    </main>
  )
}

