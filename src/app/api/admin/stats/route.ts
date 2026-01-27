import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { STORES } from '@/lib/stores'

export async function GET(request: Request) {
    // Simple password check for admin API
    // In production, use session/cookie auth. For now, query param or header.
    const { searchParams } = new URL(request.url)
    const password = searchParams.get('password')

    const storeId = searchParams.get('storeId')

    if (password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Optimization: Define common aggregations
        const [totalLinks, totalCouponsIssued, totalCouponsUsed, storeStats] = await Promise.all([
            prisma.linkGen.count(),
            prisma.coupon.count(),
            prisma.coupon.count({
                where: {
                    status: 'USED',
                },
            }),
            prisma.coupon.groupBy({
                by: ['storeId', 'storeName'],
                _count: {
                    id: true,
                    usedAt: true,
                },
            })
        ])

        // Fetch link stats
        const linkStats = await prisma.linkGen.groupBy({
            by: ['storeSlug'],
            _count: {
                id: true
            }
        })

        // Optimization: Only fetch coupon details if a specific storeId is requested
        let couponDetails: any[] = []
        if (storeId) {
            couponDetails = await prisma.coupon.findMany({
                where: { storeId },
                orderBy: {
                    issuedAt: 'desc'
                }
            })
        }

        return NextResponse.json({
            linksval: totalLinks,
            coupons: totalCouponsIssued,
            used: totalCouponsUsed,
            breakdown: storeStats.map((s: any) => {
                // Find all slugs associated with this storeId
                const storeObj = STORES.find(st => st.id === s.storeId)
                const storeSlugs = storeObj ? [storeObj.slug] : []

                // Sum up links for all slugs of this store
                const linksCount = linkStats
                    .filter((ls: any) => storeSlugs.includes(ls.storeSlug as string))
                    .reduce((acc: number, curr: any) => acc + (curr._count?.id || 0), 0)

                // Only return detailed coupons if they belong to the requested storeId
                const det = (storeId === s.storeId) ? couponDetails.map((c: any) => ({
                    id: c.id,
                    code: c.code,
                    status: c.status,
                    issuedAt: c.issuedAt,
                    usedAt: c.usedAt,
                    expiresAt: c.expiresAt
                })) : []

                return {
                    storeId: s.storeId,
                    storeName: s.storeName,
                    issued: s._count.id,
                    used: s._count.usedAt,
                    links: linksCount,
                    couponDetails: det
                }
            })
        })
    } catch (error) {
        console.error('Failed to fetch admin stats:', error)
        // Return fallback stats when database is unavailable
        return NextResponse.json({
            linksval: 0,
            coupons: 0,
            used: 0,
            breakdown: [],
            dbStatus: 'disconnected'
        })
    }
}
