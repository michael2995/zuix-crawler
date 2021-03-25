import { Page } from "puppeteer";

export const ensureRender = async (page: Page): Promise<boolean> => {
    await page.evaluate(() => {
        let entryCount = 0

        const ensure = (): Promise<string> => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const entries = window.performance.getEntries()
                    if (entries.length !== entryCount) {
                        entryCount = entries.length
                        resolve(ensure())
                    } else {
                        resolve("ok")
                    }
                }, 1000)
            })
        }

        return ensure()
    })

    return true
}