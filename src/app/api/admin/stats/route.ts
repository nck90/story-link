import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { STORES } from '@/lib/stores'

export async function GET(request: Request) {
    // Simple password check for admin API
    // In production, use session/cookie auth. For now, query param or header.
    const { searchParams } = new URL(request.url)
    const password = searchParams.get('password')

    if (password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
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

        // For LinkGen, we need to handle it since it only has storeSlug, not storeID
        const linkStats = await prisma.linkGen.groupBy({
            by: ['storeSlug'],
            _count: {
                id: true
            }
        })

        // Fetch detailed coupons for each store
        const allCoupons = await prisma.coupon.findMany({
            orderBy: {
                issuedAt: 'desc'
            }
        })

        return NextResponse.json({
            linksval: totalLinks,
            coupons: totalCouponsIssued,
            used: totalCouponsUsed,
            breakdown: storeStats.map(s => {
                // Find all slugs associated with this storeId
                const storeObj = STORES.find(st => st.id === s.storeId)
                const storeSlugs = storeObj ? [storeObj.slug] : []

                // Sum up links for all slugs of this store
                const linksCount = linkStats
                    .filter(ls => storeSlugs.includes(ls.storeSlug as string))
                    .reduce((acc: number, curr: any) => acc + curr._count.id, 0)

                const storeCoupons = allCoupons.filter(c => c.storeId === s.storeId)

                return {
                    storeId: s.storeId,
                    storeName: s.storeName,
                    issued: s._count.id,
                    used: s._count.usedAt,
                    links: linksCount,
                    couponDetails: storeCoupons.map(c => ({
                        id: c.id,
                        code: c.code,
                        status: c.status,
                        issuedAt: c.issuedAt,
                        usedAt: c.usedAt,
                        expiresAt: c.expiresAt
                    }))
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
