import { nanoid } from 'nanoid'

export function generateShortId(length: number = 6): string {
    return nanoid(length)
}

export function generateCouponCode(storePrefix: string): string {
    const suffix = nanoid(4).toUpperCase()
    return `${storePrefix}-${suffix}`
}
