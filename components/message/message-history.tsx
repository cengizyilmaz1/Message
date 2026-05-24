import { Clock } from "lucide-react"

import {
  getFormattedDate,
  getMessageHistory,
  summarizeChanges,
} from "@/lib/messages"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function formatDateTime(iso: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  const date = getFormattedDate(iso)
  const time = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })
  return `${date} - ${time}`
}

export default function MessageHistory(props: { id: string }) {
  const history = getMessageHistory(props.id)
  if (!history || history.versions.length < 2) return null

  // Versions are stored chronologically asc; for the timeline we display
  // newest at the top.
  const reversed = [...history.versions].reverse()
  const displayedVersions = reversed.slice(0, 8)
  const totalVersions = history.versions.length

  // The original (oldest) version sits at the end of the reversed array.
  const original = reversed[reversed.length - 1]

  // Pre-compute "what changed since the previous version" for each entry.
  const summaries = displayedVersions.map((v, i) => {
    // The "previous" version (older) is the next one in the reversed array.
    const prev = reversed[i + 1]?.message
    return summarizeChanges(prev, v.message)
  })

  return (
    <Card className="w-full overflow-hidden rounded-[0.5rem] border bg-background shadow-sm md:shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Clock size={18} />
          Version history
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {totalVersions} versions tracked
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Updated {totalVersions - 1}{" "}
          {totalVersions - 1 === 1 ? "time" : "times"} since{" "}
          <span className="font-medium text-foreground">
            {getFormattedDate(original.capturedAt)}
          </span>
          . Microsoft 365 Message Center only shows the current version; this
          archive preserves tracked history.
        </p>

        <ol className="relative space-y-5 border-l border-border pl-5">
          {displayedVersions.map((v, i) => {
            const isLatest = i === 0
            const versionNumber = totalVersions - i
            return (
              <li key={v.capturedAt} className="relative">
                <span
                  className={
                    "absolute -left-[27px] mt-1.5 inline-block h-3 w-3 rounded-full border-2 border-background " +
                    (isLatest ? "bg-emerald-500" : "bg-muted-foreground/60")
                  }
                  aria-hidden
                />
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-semibold text-foreground">
                    {formatDateTime(v.capturedAt)}
                  </span>
                  {isLatest ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100">
                      Latest - v{versionNumber}
                    </span>
                  ) : versionNumber === 1 ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      Original - v1
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      v{versionNumber}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Changed: {summaries[i].join(", ")}
                </p>
              </li>
            )
          })}
        </ol>
        {totalVersions > displayedVersions.length && (
          <p className="text-xs text-muted-foreground">
            Showing the latest {displayedVersions.length} snapshots. Older
            snapshots remain preserved in the generated history data.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
