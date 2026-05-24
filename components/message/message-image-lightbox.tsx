"use client"

import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface LightboxState {
  src: string
  alt: string
}

export default function MessageImageLightbox() {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null)

  useEffect(() => {
    const imgs = Array.from(document.querySelectorAll(".message-content img"))
    imgs.forEach((img) => {
      img.classList.add("message-content-img")
      img.setAttribute("role", "button")
      img.setAttribute("tabindex", "0")
      if (!img.getAttribute("alt")) img.setAttribute("alt", "Embedded image")
    })

    const openImage = (img: HTMLImageElement) => {
      setLightbox({
        src: img.currentSrc || img.src,
        alt: img.alt || "Embedded image",
      })
    }

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      const img = target?.closest(".message-content img") as HTMLImageElement | null
      if (!img) return
      e.preventDefault()
      openImage(img)
    }

    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (!target?.matches(".message-content img")) return
      if (e.key !== "Enter" && e.key !== " ") return
      e.preventDefault()
      openImage(target as HTMLImageElement)
    }

    document.addEventListener("click", handleClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("click", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [])

  const close = useCallback(() => setLightbox(null), [])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [lightbox, close])

  if (!lightbox) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onClick={close}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={close}
        aria-label="Close image preview"
        className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Close (Esc)
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={lightbox.src}
        alt={lightbox.alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[95vh] max-w-[95vw] cursor-default rounded-md object-contain shadow-2xl"
      />
    </div>,
    document.body
  )
}
