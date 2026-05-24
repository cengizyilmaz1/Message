import { getAllMessages, getMessageSource } from "@/lib/messages"
import { getCanonicalMessagePath } from "@/lib/slugs.mjs"
import { MessageSource } from "@/types/message"
import { SearchCommand } from "./search-command"

export function SearchCommandWrapper() {
  const items = getAllMessages()
    .slice(0, 2000)
    .map((m) => ({
      id: m.Id,
      title: m.Title,
      href: getCanonicalMessagePath(m),
      source: getMessageSource(m) === MessageSource.Roadmap ? "roadmap" : "messageCenter",
      service: m.Services ?? [],
    }))

  return <SearchCommand messages={items} />
}
