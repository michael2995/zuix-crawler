import { ElementHandle } from "puppeteer";

export const nodeToJson = async(handle: ElementHandle) => {
    await handle.evaluate(() => {
        const parseNodeToJson = (node: Element): DomJSON => {
            const children = Array.from(node.children)
            return {
                id: node.id,
                class: Array.from(node.classList),
                children: children.length ? children.map(parseNodeToJson) : null,
                textContent: node.textContent?.trim(),
                tag: node.tagName,
            }
        }

        const domJSON = parseNodeToJson(document.body)
        return domJSON
    })
}

type DomJSON = {
    id: string
    class: string[],
    children: DomJSON[] | null
    textContent?: string
    tag: string
}