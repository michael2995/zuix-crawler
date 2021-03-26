import inquirer from "inquirer"
import { ElementHandle } from "puppeteer"
import {getBrowser} from "./module"
import {ensureRender} from "./util"
import fs from "fs"
import ora from "ora"

const spinner = ora()

async function test() {
    const browser = await getBrowser()
    const page = await browser.newPage()

    await page.setViewport({width: 1280, height: 720})

    await page.goto("https://www.docswave.com/ko", { waitUntil: "networkidle0" })
    const signinButtons = await page.waitForSelector(".signin-button")
    await signinButtons?.click()
    await page.waitForNavigation({ waitUntil: "networkidle0" })

    const emailInput = await page.waitForSelector("input[type=email]")
    const nextButton: ElementHandle | null = await new Promise((resolve) => {
        let catchedNextButton = false
        page.waitForSelector("#identifierNext button")
            .then((handle) => {
                if (!catchedNextButton) {
                    catchedNextButton = true
                    resolve(handle)
                }
            })
            .catch((e) => {})
        page.waitForSelector("input#next")
            .then((handle) => {
                if (!catchedNextButton) {
                    catchedNextButton = true
                    resolve(handle)
                }
            })
            .catch((e) => {})
    })

    //잘못 입력했을 경우도 핸들링해야함
    const id = await inquirer.prompt({
        type: "input",
        name: "id",
        message: "마이크로소프트 직방 계정 아이디를 입력해주세요",
        default: "doe@zigbang.com",
    }).then((value) => value.id)

    await emailInput?.type(id)
    await nextButton?.click()

    const msIdInput = await page.waitForSelector("input#i0116")
    await msIdInput?.type(id)

    await page.waitForSelector("input#idSIButton9")
    .then((next) => next?.click())

    const msPassInput = await page.waitForSelector("input#i0118")

    const pass = await inquirer.prompt({
        type: "password",
        name: "pass",
        message: "마이크로소프트 직방 계정 패스워드를 입력해주세요",
        default: "secret",
    }).then((value) => value.pass)

    spinner.text = "Logging in to docswave"
    spinner.start()

    await msPassInput?.type(pass)
    await page.waitForSelector("input#idSIButton9")
    .then((next) => next?.click())

    await page.waitForSelector("input#idSIButton9")
    .then((next) => next?.click())

    await page.waitForNavigation({ waitUntil: "networkidle0" })
    await page.waitForNavigation({ waitUntil: "networkidle0" })

    await ensureRender(page)

    spinner.succeed()
    spinner.text = "Navigating to member list"
    spinner.start()

    await page.goto("https://www.docswave.com/app/a/members", { waitUntil: "networkidle0" })

    await ensureRender(page)
    spinner.succeed()

    await page.waitForSelector(".card-wrapper")
    const cardWrapper = await page.$(".card-wrapper")

    let prevScrollHeight = 0
    const scrollToCardWrapperEnd = () => {
        return new Promise(async(resolve, reject) => {
            if (!cardWrapper) return reject("couldn't find card wrapper")
            const lastChild = await page.evaluateHandle((el: HTMLElement) => {
                const children = el.children
                return children[children.length - 1]
            }, cardWrapper)
            await lastChild?.evaluate((node: HTMLElement) => node.scrollIntoView())
            await ensureRender(page)
            const scrollHeight = await cardWrapper.evaluate((node) => node.scrollHeight)
            if (scrollHeight !== prevScrollHeight) {
                prevScrollHeight = scrollHeight
                resolve(scrollToCardWrapperEnd())
            } else {
                return resolve("ok")
            }
        })
    }

    spinner.text = "Scrolling to the end"
    spinner.start()

    await scrollToCardWrapperEnd()

    spinner.succeed()

    const cards = await cardWrapper?.$$("div.card")
    const mapCardToJson = async (card: ElementHandle) => {
        try {
            const name = await card.$("a.person-name").then((el) => el?.evaluate((node) => node.textContent.trim()))
            const role = await card.$("span.person-name").then((el) => el?.evaluate((node) => node.textContent.trim()))
            const part = await card.$("span.deps").then((el) => el?.evaluate((node) => node.textContent.trim()))
            const email = await card.$("a.dwsu-app-write-gmail-link").then((el) => el?.evaluate((node) => node.textContent.trim()))
            const phoneIcon = await card.$("span.cellphone")
            const phone = await page.evaluateHandle((node) => node?.nextElementSibling, phoneIcon)
                .then((el) => el?.evaluate((node) => node.textContent.trim()))
            return { name, role, part, email, phone }
        } catch (e) {
            return null
        }
    }

    if (!cards) throw Error("couldn't find people card");

    spinner.text = "Crawling pensonnel info"
    spinner.start()

    const people: Person[] = []
    for (let i = 0; i < cards.length; i += 1) {
        const person = await mapCardToJson(cards[i])
        if (person) people.push(person)
    }
    
    fs.writeFileSync("test.json", JSON.stringify(people))
    spinner.succeed()
    await browser.close()
}

test()

type Person = {
    name: string
    role: string
    part: string
    email: string
    phone: string
}
