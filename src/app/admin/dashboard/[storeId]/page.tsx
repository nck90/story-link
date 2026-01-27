'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../Dashboard.module.css'

interface CouponDetail {
    id: string
    code: string
    status: string
    issuedAt: string
    usedAt: string | null
    expiresAt: string | null
}

interface StoreStat {
    storeId: string
    storeName: string
    issued: number
    used: number
    links: number
    couponDetails: CouponDetail[]
}

interface AdminStats {
    breakdown: StoreStat[]
}

export default function StoreDetailPage({ params }: { params: Promise<{ storeId: string }> }) {
    const { storeId } = use(params)
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const password = sessionStorage.getItem('admin_password')
        if (!password) {
            router.push('/admin')
            return
        }

        const fetchStats = async () => {
            try {
                const res = await fetch(`/api/admin/stats?password=${password}`)
                if (res.ok) {
                    const data = await res.json()
                    setStats(data)
                } else {
                    router.push('/admin')
                }
            } catch (err) {
                console.error('Fetch error:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
        const interval = setInterval(fetchStats, 10000)
        return () => clearInterval(interval)
    }, [router])

    const storeData = stats?.breakdown.find(s => s.storeId === storeId)

    const getTimeDiff = (dateStr: string) => {
        const now = new Date()
        const target = new Date(dateStr)
        const diffInMs = Math.abs(now.getTime() - target.getTime())

        const minutes = Math.floor(diffInMs / (1000 * 60))
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (days > 0) return `${days}일 전`
        if (hours > 0) return `${hours}시간 전`
        if (minutes > 0) return `${minutes}분 전`
        return '방금 전'
    }

    const getTimeRemaining = (dateStr: string | null) => {
        if (!dateStr) return '-'
        const now = new Date()
        const target = new Date(dateStr)
        const diffInMs = target.getTime() - now.getTime()

        if (diffInMs < 0) return '만료됨'

        const minutes = Math.floor(diffInMs / (1000 * 60))
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (days > 0) return `${days}일 남음`
        if (hours > 0) return `${hours}시간 남음`
        return `${minutes}분 남음`
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'USED': return { label: '사용 완료', class: styles.statusUsed }
            case 'EXPIRED': return { label: '만료됨', class: styles.statusExpired }
            default: return { label: '활성', class: styles.statusActive }
        }
    }

    if (loading && !stats) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p className={styles.sectionDesc}>매장 데이터를 분석 중입니다...</p>
            </div>
        )
    }

    if (!storeData) {
        return (
            <div className={styles.page}>
                <main className={styles.main}>
                    <p className={styles.sectionDesc}>매장 데이터를 찾을 수 없습니다.</p>
                    <button onClick={() => router.push('/admin/dashboard')} className={styles.signOutBtn} style={{ marginTop: '20px' }}>대시보드로 돌아가기</button>
                </main>
            </div>
        )
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.logoArea} onClick={() => router.push('/admin/dashboard')} style={{ cursor: 'pointer' }}>
                        <div className={styles.logoIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h1 className={styles.logoText}>대시보드로 돌아가기</h1>
                    </div>
                    <div className={styles.headerActions}>
                        <div className={styles.systemStatus}>
                            <div className={styles.statusDot}></div>
                            <span>실시간 데이터 수신 중</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.modalHeader} style={{ border: 'none', padding: '0 0 40px 0' }}>
                    <div className={styles.modalHeaderInfo}>
                        <h2 className={styles.sectionTitle} style={{ fontSize: '32px' }}>{storeData.storeName}</h2>
                        <p className={styles.sectionDesc}>개별 쿠폰 성과 및 라이프사이클 상세 분석</p>
                    </div>
                </div>

                <section className={styles.section}>
                    <div className={styles.kpiGrid}>
                        <div className={styles.kpiCard}>
                            <dt className={styles.kpiLabel}>스토리 링크 공유</dt>
                            <dd className={styles.kpiValue}>{storeData.links}</dd>
                            <div className={styles.kpiSub}>마케팅 노출 활성도</div>
                        </div>
                        <div className={styles.kpiCard}>
                            <dt className={styles.kpiLabel}>쿠폰 발급량</dt>
                            <dd className={`${styles.kpiValue} ${styles.primaryValue}`}>{storeData.issued}</dd>
                            <div className={styles.kpiSub}>잠재적 방문 고객</div>
                        </div>
                        <div className={styles.kpiCard}>
                            <dt className={styles.kpiLabel}>최종 매장 방문</dt>
                            <dd className={styles.kpiValue}>{storeData.used}</dd>
                            <div className={styles.kpiSub}>실제 매출 전환 성공</div>
                        </div>
                    </div>
                </section>

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>개별 쿠폰 상세 내역</h3>
                        <p className={styles.sectionDesc}>최근 발행된 쿠폰부터 순차적으로 표시됩니다.</p>
                    </div>

                    <div className={styles.couponGrid}>
                        {storeData.couponDetails.length > 0 ? storeData.couponDetails.map((c, i) => {
                            const status = getStatusLabel(c.status)
                            return (
                                <div key={i} className={styles.couponCard}>
                                    <div className={styles.couponHeader}>
                                        <span className={styles.couponCode}>{c.code}</span>
                                        <span className={`${styles.statusTag} ${status.class}`}>{status.label}</span>
                                    </div>
                                    <div className={styles.couponMetrics}>
                                        <div className={styles.metricItem}>
                                            <span className={styles.metricLabel}>최초 발급 시점</span>
                                            <span className={styles.metricVal}>{getTimeDiff(c.issuedAt)}</span>
                                        </div>
                                        <div className={styles.metricItem}>
                                            <span className={styles.metricLabel}>실제 사용 시점</span>
                                            <span className={styles.metricVal}>{c.usedAt ? getTimeDiff(c.usedAt) : '미사용 (방문 대기)'}</span>
                                        </div>
                                        <div className={styles.metricItem}>
                                            <span className={styles.metricLabel}>쿠폰 활성 기간</span>
                                            <span className={styles.metricVal} style={{ color: c.status === 'USED' ? 'var(--color-gray-400)' : 'var(--color-primary)' }}>
                                                {getTimeRemaining(c.expiresAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        }) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 0' }}>
                                <p className={styles.sectionDesc}>아직 이 매장에 대한 쿠폰 데이터가 존재하지 않습니다.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    )
}
