import { Person } from "../type/model"
import fetch from "node-fetch"
import queryString from "querystring"

const {SERVER_ENDPOINT} = process.env

const updateExisting = (existing: Person & {id: number}, updated: Person) => {
    return fetch(SERVER_ENDPOINT, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: existing.id,
            ...updated,
        })
    })
}

const writePerson = (person: Person) => {
    return fetch(SERVER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(person)
    })
}

export const update = async (person: Person) => {
    if (!SERVER_ENDPOINT) throw Error("Couldn't find endpoint")

    try {
        const query = queryString.stringify(person)
        const res = await fetch(`${SERVER_ENDPOINT}?${query}`)
        const existing = res.status === 200 && await res.json()
        if (existing) return await updateExisting(existing, person)
        return await writePerson(person)
    } catch (e) {
        console.log(e)
    }
}
