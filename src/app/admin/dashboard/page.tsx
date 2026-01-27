'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './Dashboard.module.css'

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
    linksval: number
    coupons: number
    used: number
    breakdown: StoreStat[]
}

export default function AdminDashboardPage() {
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

    if (loading && !stats) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p className={styles.sectionDesc}>데이터 동기화 중...</p>
            </div>
        )
    }

    if (!stats) return null

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.logoArea}>
                        <div className={styles.logoIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h1 className={styles.logoText}>관리자용 대시보드 <span className={styles.betaTag}>Beta</span></h1>
                    </div>

                    <div className={styles.headerActions}>
                        <div className={styles.systemStatus}>
                            <div className={styles.statusDot}></div>
                            <span>실시간 연결 활성화</span>
                        </div>
                        <button
                            onClick={() => {
                                sessionStorage.removeItem('admin_password')
                                router.push('/admin')
                            }}
                            className={styles.signOutBtn}
                        >
                            로그아웃
                        </button>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>전체 비즈니스 성과</h2>
                        <p className={styles.sectionDesc}>인스타그램 스토리 마케팅 통합 현황</p>
                    </div>

                    <div className={styles.kpiGrid}>
                        <div className={styles.kpiCard}>
                            <dt className={styles.kpiLabel}>스토리 링크 공유수</dt>
                            <dd className={styles.kpiValue}>{stats.linksval}</dd>
                            <div className={styles.kpiSub}>공유 활성도: 매우 높음</div>
                        </div>
                        <div className={styles.kpiCard}>
                            <dt className={styles.kpiLabel}>총 쿠폰 발행량</dt>
                            <dd className={`${styles.kpiValue} ${styles.primaryValue}`}>{stats.coupons}</dd>
                            <div className={styles.kpiSub}>잠재 방문객 확보</div>
                        </div>
                        <div className={styles.kpiCard}>
                            <dt className={styles.kpiLabel}>최종 방문 전환율</dt>
                            <dd className={styles.kpiValue}>
                                {stats.coupons > 0 ? `${Math.round((stats.used / stats.coupons) * 100)}%` : '0%'}
                            </dd>
                            <div className={styles.kpiSub}>매장 실제 유입률</div>
                        </div>
                    </div>
                </section>

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>매장별 데이터 현황</h2>
                        <p className={styles.sectionDesc}>매장을 클릭하면 상세 페이지로 이동하여 깊이 있는 데이터를 확인하실 수 있습니다.</p>
                    </div>

                    <div className={styles.tableWrapper}>
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead className={styles.thead}>
                                    <tr>
                                        <th className={styles.th}>매장 이름</th>
                                        <th className={styles.th}>링크 생성</th>
                                        <th className={styles.th}>쿠폰 발급</th>
                                        <th className={styles.th}>실제 사용</th>
                                        <th className={styles.th}>전환 성과</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.breakdown && stats.breakdown.length > 0 ? stats.breakdown.map((s, i) => (
                                        <tr key={i} className={`${styles.tr} ${styles.trSelected}`} onClick={() => router.push(`/admin/dashboard/${s.storeId}`)}>
                                            <td className={styles.td}>
                                                <span className={styles.storeName}>{s.storeName}</span>
                                            </td>
                                            <td className={styles.td}>
                                                <span className={styles.badge}>{s.links}</span>
                                            </td>
                                            <td className={`${styles.td} ${styles.numValue}`}>{s.issued}</td>
                                            <td className={`${styles.td} ${styles.numValue}`}>{s.used}</td>
                                            <td className={styles.td}>
                                                <div className={styles.conversionArea}>
                                                    <div className={styles.progressBar}>
                                                        <div
                                                            className={styles.progressFill}
                                                            style={{ width: s.issued > 0 ? `${Math.min((s.used / s.issued) * 100, 100)}%` : '0%' }}
                                                        ></div>
                                                    </div>
                                                    <span className={styles.percentText}>
                                                        {s.issued > 0 ? Math.round((s.used / s.issued) * 100) : 0}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className={styles.td} style={{ textAlign: 'center', padding: '100px 0' }}>
                                                <p className={styles.sectionDesc}>현재 활동 중인 데이터가 없습니다.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <section className={styles.diagnostics}>
                    <div className={styles.diagAccent}></div>
                    <div className={styles.diagLeft}>
                        <div className={styles.sectionHeader}>
                            <h3 className={styles.diagTitle}>실시간 인프라<br />진단 보고서</h3>
                            <p className={styles.diagLabel} style={{ color: 'var(--color-gray-600)' }}>데이터베이스 및 보안 시스템 엔진 상태</p>
                        </div>
                        <div className={styles.diagGrid}>
                            <div className={styles.diagItem}><div className={styles.diagLabel}>분석 엔진</div><div className={styles.diagValue}>Reply A.I v2</div></div>
                            <div className={styles.diagItem}><div className={styles.diagLabel}>업타임 레이트</div><div className={styles.diagValue}>99.998%</div></div>
                            <div className={styles.diagItem}><div className={styles.diagLabel}>데이터 스토리지</div><div className={styles.diagValue}>Edge/Turso DB</div></div>
                            <div className={styles.diagItem}><div className={styles.diagLabel}>보안 트래픽</div><div className={styles.diagValue}>E2EE 암호화</div></div>
                        </div>
                    </div>
                    <div className={styles.diagRight}>
                        <div className={styles.securityBox}>
                            <div className={styles.securityIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className={styles.securityTitle}>지능형 보안 프로토콜</h3>
                            <p className={styles.securityText}>모든 통신은 실시간으로 암호화되며, 비정상적인 접근 패턴 발생 시 즉각적으로 차단됩니다.</p>
                        </div>
                        <div className={styles.diagFooter}><span>REPLY CORP. 2026</span><span>v0.8.5 STABLE BUILD</span></div>
                    </div>
                </section>
            </main>
        </div>
    )
}
