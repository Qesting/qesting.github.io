import { useState } from "react"
import {
  Clipboard2Fill as BIconClipboard2Fill,
  Clipboard2CheckFill as BIconClipboard2CheckFill,
} from "react-bootstrap-icons"
import { RPCItem, RPCSection, rootParent } from "../helpers/types"

interface CopyItemLinkProps {
  item?: RPCItem
}

export default function CopyItemLink({ item }: CopyItemLinkProps) {
  if (!item) return
  const section: RPCSection|null = rootParent(item)
  if (!section) return
  const [copied, setCopied] = useState<boolean>(false)
  const itemLink = item
    ? item?.type === "section"
      ? `>${item.name}`
      : item.name
    : null
  async function handleClick() {
    await self.navigator.clipboard.writeText(
      `${self.location.origin}/#/${section?.name + "|" + section?.source}${item ? "/" + itemLink + "|" + item.source : ""}`,
    )
    setCopied(true)
    self.setTimeout(() => setCopied(false), 1000)
  }
  return (
    <button
      className={`copy-item-link absolute top-0 bottom-2 left-0 !outline-none focus:text-accent hover:text-accent dark:focus:text-accentDark dark:hover:text-accentDark transition-[color,transform] duration-200 ${copied ? "dark:text-accentDark text-accent scale-150" : ""}`}
      onClick={handleClick}
      aria-label="kopiuj link"
    >
      {copied ? <BIconClipboard2CheckFill /> : <BIconClipboard2Fill />}
    </button>
  )
}
