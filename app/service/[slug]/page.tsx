import { Metadata } from "next"
import { notFound } from "next/navigation"

import MessagesTable from "@/components/table/messages-table"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { siteConfig } from "@/config/site"
import {
  getAllServices,
  getArchiveMessages,
  getMessagesByService,
} from "@/lib/messages"
import { findServiceBySlug } from "@/lib/filters"
import { slugifyService } from "@/lib/slugs.mjs"
import { getServiceIcon } from "@/components/message/message-icons"

type Props = {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return getAllServices().map((service) => ({
    slug: slugifyService(service),
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const service = findServiceBySlug(slug, getAllServices())
  
  if (!service) {
    return { title: "Not Found" }
  }

  return {
    title: `${service} updates`,
    description: `Microsoft 365 Message Center and Roadmap updates for ${service}.`,
    alternates: {
      canonical: `/service/${slugifyService(service)}`,
    },
    openGraph: {
      title: `${service} updates | ${siteConfig.name}`,
      description: `Microsoft 365 Message Center and Roadmap updates for ${service}.`,
      url: `/service/${slugifyService(service)}`,
      images: ["/og-default.png"],
    },
  }
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params
  const service = findServiceBySlug(slug, getAllServices())
  
  if (!service) notFound()
  const messages = getMessagesByService(service)
  const archiveMessages = getArchiveMessages().filter((item) =>
    item.Services?.includes(service)
  )

  if (messages.length === 0 && archiveMessages.length === 0) notFound()

  const ServiceIcon = getServiceIcon(service)

  return (
    <main className="page-shell">
      <Breadcrumb items={[{ label: "Service" }, { label: service }]} />
      <section className="page-intro">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line react-hooks/static-components */}
            <ServiceIcon size={36} className="text-primary" />
            <h1 className="page-title text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70">
              {service}
            </h1>
          </div>
          <p className="page-description">
            Message Center and Roadmap announcements for this Microsoft 365
            service.
          </p>
        </div>
      </section>

      <MessagesTable
        messages={messages}
        archiveMessages={archiveMessages}
        includeArchiveFetch={false}
      />
    </main>
  )
}

