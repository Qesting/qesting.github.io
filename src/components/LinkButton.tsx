import { Link } from "react-router-dom";
import capitalize from '../helpers/capitalize';
import isInView from '../helpers/isInView';
import { itemIsSection, rootParent, RPCItem, RPCSection } from '../helpers/types';

export default function LinkButton({elementId, innerText, additionalClasses}: { elementId: string, innerText: string, additionalClasses?: string|string[] }) {
    const isFootnoteLink = elementId.startsWith("footnote")
    const sectionStart = elementId.indexOf('-') + 1;
    const sectionEnd = elementId.startsWith('item') ? elementId.lastIndexOf('-') : undefined;
    const section = elementId.substring(sectionStart, sectionEnd);
    const itemPos = isFootnoteLink ? sectionStart - 1 : elementId.lastIndexOf("-")
    const item = itemPos !== -1 ? elementId.substring(itemPos + 1) : null
    const scrollFunction = () => {
        if (!item) return
        const element = self.document.querySelector<HTMLElement>(`[id$="${item}"]`)
        if (!element) return
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        if (!isInView(element)) element?.scrollIntoView({
            behavior: "smooth"
        })
        element?.focus()
    }

    const isSubSection = elementId.startsWith("section") && item !== section    
    const ac = !additionalClasses ? [] : typeof additionalClasses === 'string' ? [additionalClasses] : additionalClasses 

    return (
        isFootnoteLink
            ? <button onClick={scrollFunction} className={["btn"].concat(ac).join(' ')}>{capitalize(innerText)}</button>
            : <Link to={"/" + section.split('-')[0] + (item && isSubSection ? `/>${item}` : item !== section ? `/${item}` : "")} className={["btn"].concat(ac).join(' ')}>{capitalize(innerText)}</Link>
        )
}

export function nameAndSource(item: RPCItem): string {
    return `${item.name}|${item.source}`
}

export function makeItemElementId(item: RPCItem): string {
    const parents: RPCSection[] = []
    let p = item.parent
    while (p) {
        parents.push(p)
        p = p.parent
    }
    return `${(itemIsSection(item) ? 'section' : 'item')}${parents.length ? '-' : ''}${parents.reverse().map(p => nameAndSource(p)).join('-')}-${nameAndSource(item)}`
}

export function ItemLinkButton({ item, innerText, additionalClasses } : { item: RPCItem|null, innerText?: string, additionalClasses?: string|string[] }) {
    if (!item) return
    const rootSection = rootParent(item)
    if (!rootSection) return
    const ac = !additionalClasses ? [] : typeof additionalClasses === 'string' ? [additionalClasses] : additionalClasses 
    const link = "/" + nameAndSource(rootSection) + (itemIsSection(item) ? item.parent !== null ? `/>${nameAndSource(item)}` : '' : `/${nameAndSource(item)}`)
    return <Link to={link} className={['btn'].concat(ac).join(' ')}>{capitalize(innerText ?? item.displayName ?? '')}</Link>
}

export function makeFootnoteElementId(section: RPCSection, index: number): string {
    const parents: RPCSection[] = []
    let p: RPCSection|undefined = section
    while (p) {
        parents.push(p)
        p = p.parent
    }
    return `footnote-${parents.reverse().map(p => nameAndSource(p)).join('-')}-${index}`
}

export function FootnoteLinkButton({ section, index, displayIndex, additionalClasses }: { section: RPCSection, index: number, displayIndex?: number, additionalClasses?: string|string[] }) {
        const scrollFunction = () => {
        const element = self.document.getElementById(makeFootnoteElementId(section, index))
        if (!element) return
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        if (!isInView(element)) element?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        })
        element?.focus()
    }
    const ac = !additionalClasses ? [] : typeof additionalClasses === 'string' ? [additionalClasses] : additionalClasses 
    return <button onClick={scrollFunction} className={['btn'].concat(ac).join(' ')}>{ '\u2020'.repeat(displayIndex ?? index) }</button>
}