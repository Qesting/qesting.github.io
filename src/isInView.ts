export default function isInView(element: HTMLElement) {
    if (!element) return
    const rect: DOMRect = element.getBoundingClientRect()
    return rect.y >= 0
}