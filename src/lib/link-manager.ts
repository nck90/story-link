import { prisma } from '@/lib/prisma'
import { generateShortId } from '@/lib/utils'

export class LinkManager {
    /**
     * Generate a unique link ID efficiently
     * Checks for collision and retries if necessary
     */
    static async createUniqueStoryLink(storeId: string, uploaderId: string) {
        let attempts = 0
        const maxAttempts = 3

        while (attempts < maxAttempts) {
            try {
                const id = generateShortId(6)

                const storyLink = await prisma.storyLink.create({
                    data: {
                        id,
                        storeId,
                        uploaderId
                    }
                })

                return storyLink
            } catch (error: any) {
                // If collision (P2002), retry
                if (error.code === 'P2002') {
                    attempts++
                    continue
                }
                throw error
            }
        }

        throw new Error('Failed to generate unique link after multiple attempts')
    }

    /**
     * Generate the full URL for a story link
     */
    static getStoryLinkUrl(storeSlug: string, linkId: string, origin: string = '') {
        // Use the configured production URL as fallback if origin not provided, or default to relative
        const cleanOrigin = origin.replace(/\/$/, '')
        return `${cleanOrigin}/${storeSlug}?source=story&link=${linkId}`
    }
}
