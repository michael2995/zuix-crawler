import { ElementHandle } from "puppeteer";

export const scrollToEnd = async (handle: ElementHandle) => {
    const lastScrollHeight = await handle.evaluate((node: HTMLElement) => {
        node.scrollTo({top: node.scrollHeight})
        return node.scrollHeight
    })
    return lastScrollHeight
}
