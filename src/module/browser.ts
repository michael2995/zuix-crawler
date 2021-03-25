import puppeteer from "puppeteer"

let browser: puppeteer.Browser

(async() => {
    browser = await puppeteer.launch({
        headless: false,
    })
})()

export const getBrowser = (): Promise<puppeteer.Browser> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (browser === undefined) {
                resolve(getBrowser())
            } else {
                resolve(browser)
            }
        }, 100)
    })
}