import Link from "next/link"
import { Archive, Milestone, Rss } from "lucide-react"

import MessagesTable from "@/components/table/messages-table"
import { siteConfig } from "@/config/site"

export default function IndexPage() {
  return (
    <main className="page-shell">
      <section className="page-intro">
        <div className="flex min-w-0 flex-col gap-3">
          <h1 className="page-title text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70">
            {siteConfig.name}
          </h1>
          <p className="page-description">
            A fast, searchable archive of Microsoft 365 Message Center
            announcements and Roadmap items. Track tenant-relevant changes,
            rollout dates, and service updates.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/roadmap"
            className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent"
          >
            <Milestone size={15} />
            Roadmap
          </Link>
          <Link
            href="/archive"
            className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent"
          >
            <Archive size={15} />
            Archive
          </Link>
          <a
            href="/rss.xml"
            className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent"
          >
            <Rss size={15} />
            RSS
          </a>
        </div>
      </section>

      <section>
        <MessagesTable />
      </section>
    </main>
  )
}
