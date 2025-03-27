import { useState } from 'react'
import { Clipboard2Fill as BIconClipboard2Fill, Clipboard2CheckFill as BIconClipboard2CheckFill } from 'react-bootstrap-icons'

interface CopyItemLinkProps {
    item?: object,
    sectionName: string
}

export default function CopyItemLink({ item, sectionName }: CopyItemLinkProps) {
    const [ copied, setCopied ] = useState<boolean>(false)
    const itemLink = item && item?.type === "section" ? `>${item.name}` : item.name
    async function handleClick() {
        await self.navigator.clipboard.writeText(`${self.location.origin}/#/${sectionName}${item ? "/" + itemLink : ""}`)
        setCopied(true)
        self.setTimeout(() => setCopied(false), 1000)
    }
    return (
        <button 
            className={`absolute top-0 bottom-2 left-0 !outline-none focus:text-accent hover:text-accent dark:focus:text-accentDark dark:hover:text-accentDark transition-[color,transform] duration-200 ${copied ? 'dark:text-accentDark text-accent scale-110' : ''}`} 
            onClick={handleClick}
            aria-label="kopiuj link"
        >
            {
                copied ? <BIconClipboard2CheckFill/>
                : <BIconClipboard2Fill/>
            }
        </button>
    )
}