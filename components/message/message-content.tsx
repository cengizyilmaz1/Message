import MessageImageLightbox from "@/components/message/message-image-lightbox"

export default function MessageContent({ html }: { html: string }) {
  return (
    <>
      <div
        className="message-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <MessageImageLightbox />
    </>
  )
}
