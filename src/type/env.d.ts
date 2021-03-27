declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MS_ACCOUNT: string
            MS_PASSWORD: string
            SERVER_ENDPOINT: string
        }
    }
}

export {}