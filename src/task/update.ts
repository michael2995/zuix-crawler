import { Person } from "../type/model"
import fetch from "node-fetch"
import queryString from "querystring"

const {SERVER_ENDPOINT} = process.env

export const update = async (person: Person) => {
    if (!SERVER_ENDPOINT) throw Error("Couldn't find endpoint")

    try {
        const res = await fetch(`${SERVER_ENDPOINT}?${queryString.stringify(person)}`)
        const existing = res.status === 200 && await res.json()
        if (existing) {
            await fetch(SERVER_ENDPOINT, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: existing.id,
                    ...person,
                })
            })
        } else {
            await fetch(SERVER_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(person)
            })
        }
    } catch (e) {
        console.log(e)
    }
}
