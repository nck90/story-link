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
    const [editingCoupon, setEditingCoupon] = useState<CouponDetail | null>(null)
    const [editIssuedAt, setEditIssuedAt] = useState('')
    const [editExpiresAt, setEditExpiresAt] = useState('')
    const [saving, setSaving] = useState(false)
    const router = useRouter()

    const fetchStats = async () => {
        const password = sessionStorage.getItem('admin_password')
        try {
            const res = await fetch(`/api/admin/stats?password=${password}&storeId=${storeId}`)
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

    useEffect(() => {
        const password = sessionStorage.getItem('admin_password')
        if (!password) {
            router.push('/admin')
            return
        }

        fetchStats()
        const interval = setInterval(fetchStats, 10000)
        return () => clearInterval(interval)
    }, [router])

    const storeData = stats?.breakdown.find(s => s.storeId === storeId)

    const openEditModal = (coupon: CouponDetail) => {
        setEditingCoupon(coupon)
        setEditIssuedAt(formatDateTimeLocal(coupon.issuedAt))
        setEditExpiresAt(coupon.expiresAt ? formatDateTimeLocal(coupon.expiresAt) : '')
    }

    const formatDateTimeLocal = (dateStr: string) => {
        const date = new Date(dateStr)
        const offset = date.getTimezoneOffset() * 60000
        return new Date(date.getTime() - offset).toISOString().slice(0, 16)
    }

    const saveCouponEdit = async () => {
        if (!editingCoupon) return
        setSaving(true)
        const password = sessionStorage.getItem('admin_password')

        try {
            const res = await fetch(`/api/admin/coupon/${editingCoupon.id}?password=${password}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    issuedAt: new Date(editIssuedAt).toISOString(),
                    expiresAt: editExpiresAt ? new Date(editExpiresAt).toISOString() : null
                })
            })
            if (res.ok) {
                setEditingCoupon(null)
                fetchStats()
            }
        } catch (err) {
            console.error('Save error:', err)
        } finally {
            setSaving(false)
        }
    }

    const makeActivateNow = () => {
        // 즉시 활성화: issuedAt을 4시간 전으로 설정
        const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000)
        setEditIssuedAt(formatDateTimeLocal(fourHoursAgo.toISOString()))
    }

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
            <div className={styles.page}>
                <header className={styles.header}>
                    <div className={styles.headerContent}>
                        <div className={styles.logoArea}>
                            <div className={styles.logoIcon}></div>
                            <h1 className={styles.logoText}>매장 데이터를 로드 중...</h1>
                        </div>
                    </div>
                </header>
                <main className={styles.main}>
                    <section className={styles.section}>
                        <div className={styles.kpiGrid}>
                            <div className={`${styles.kpiCard} ${styles.skeleton} ${styles.kpiCardSkeleton}`}></div>
                            <div className={`${styles.kpiCard} ${styles.skeleton} ${styles.kpiCardSkeleton}`}></div>
                            <div className={`${styles.kpiCard} ${styles.skeleton} ${styles.kpiCardSkeleton}`}></div>
                        </div>
                    </section>
                    <section className={styles.section} style={{ marginTop: '40px' }}>
                        <div className={styles.couponGrid}>
                            <div className={`${styles.couponCard} ${styles.skeleton} ${styles.couponCardSkeleton}`}></div>
                            <div className={`${styles.couponCard} ${styles.skeleton} ${styles.couponCardSkeleton}`} style={{ animationDelay: '0.1s' }}></div>
                            <div className={`${styles.couponCard} ${styles.skeleton} ${styles.couponCardSkeleton}`} style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </section>
                </main>
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
                        <p className={styles.sectionDesc}>쿠폰 카드를 클릭하여 개별 수정할 수 있습니다.</p>
                    </div>

                    <div className={styles.couponGrid}>
                        {storeData.couponDetails.length > 0 ? storeData.couponDetails.map((c, i) => {
                            const status = getStatusLabel(c.status)
                            return (
                                <div
                                    key={i}
                                    className={styles.couponCard}
                                    onClick={() => openEditModal(c)}
                                    style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)'
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = ''
                                        e.currentTarget.style.boxShadow = ''
                                    }}
                                >
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
                                    <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--color-gray-400)', textAlign: 'center' }}>
                                        ✏️ 클릭하여 수정
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

            {/* 쿠폰 수정 모달 */}
            {editingCoupon && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                    onClick={() => setEditingCoupon(null)}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '32px',
                            width: '90%',
                            maxWidth: '480px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                            🎫 쿠폰 수정: {editingCoupon.code}
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', marginBottom: '24px' }}>
                            쿠폰 발급 후 <strong>3시간</strong> 뒤 활성화 → 활성화 후 <strong>2주간</strong> 사용 가능
                        </p>

                        {/* 발급 시점 (활성화 시간 결정) */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-gray-600)' }}>
                                📅 발급 시점
                            </label>
                            <input
                                type="datetime-local"
                                value={editIssuedAt}
                                onChange={(e) => setEditIssuedAt(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '14px',
                                    border: '1px solid var(--color-gray-200)',
                                    borderRadius: '8px',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-gray-500)' }}>
                                ⏰ 활성화 시점: <strong style={{ color: 'var(--color-primary)' }}>
                                    {editIssuedAt ? new Date(new Date(editIssuedAt).getTime() + 3 * 60 * 60 * 1000).toLocaleString('ko-KR') : '-'}
                                </strong>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                <button
                                    onClick={makeActivateNow}
                                    style={{
                                        padding: '8px 16px',
                                        background: 'var(--color-success)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    ⚡ 지금 바로 활성화
                                </button>
                                <span style={{ fontSize: '11px', color: 'var(--color-warning)', fontWeight: 500 }}>
                                    ⚠️ 주의: 발급 시간이 4시간 전으로 변경됩니다.
                                </span>
                            </div>
                        </div>

                        {/* 유효기간 만료일 */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-gray-600)' }}>
                                ⏳ 유효기간 만료일
                            </label>
                            <input
                                type="datetime-local"
                                value={editExpiresAt}
                                onChange={(e) => setEditExpiresAt(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '14px',
                                    border: '1px solid var(--color-gray-200)',
                                    borderRadius: '8px',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-gray-500)' }}>
                                이 날짜가 지나면 쿠폰 사용 불가
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => {
                                        // 활성화 시점 + 2주로 설정
                                        if (editIssuedAt) {
                                            const activationTime = new Date(editIssuedAt).getTime() + 3 * 60 * 60 * 1000
                                            const twoWeeksLater = new Date(activationTime + 14 * 24 * 60 * 60 * 1000)
                                            setEditExpiresAt(formatDateTimeLocal(twoWeeksLater.toISOString()))
                                        }
                                    }}
                                    style={{
                                        padding: '8px 12px',
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    📆 기본값 (활성화 + 2주)
                                </button>
                                <button
                                    onClick={() => {
                                        // 현재 시간 + 2분으로 설정 (테스트용)
                                        const twoMinsLater = new Date(Date.now() + 2 * 60 * 1000)
                                        setEditExpiresAt(formatDateTimeLocal(twoMinsLater.toISOString()))
                                    }}
                                    style={{
                                        padding: '8px 12px',
                                        background: 'var(--color-error)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    🧪 2분 뒤 만료 (테스트)
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setEditingCoupon(null)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: 'var(--color-gray-100)',
                                    color: 'var(--color-gray-600)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                취소
                            </button>
                            <button
                                onClick={saveCouponEdit}
                                disabled={saving}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    opacity: saving ? 0.7 : 1
                                }}
                            >
                                {saving ? '저장 중...' : '저장'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
