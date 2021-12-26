export interface GenericService {
    method: string,
    endpoint: string | RegExp,
    action?: (req: any, res: any) => any
    path?: string,
    pages?: string[],
    opts?: any
}

export type Services = GenericService[]

export interface StaticDirectoryService extends GenericService {
    method: "STATIC",
    path: string
}

export interface HTMLFileService extends GenericService {
    method: "HTML",
    endpoint: string,
    pages: string[]
}

export interface WebService extends GenericService {
    method: "GET" | "POST" | "PUT" | "DELETE",
    action: (req: any, res: any) => any
}

export interface TimerOptions {
    period: number
}

export interface DatabaseService extends GenericService {
    path: string,
    opts: TimerOptions
}