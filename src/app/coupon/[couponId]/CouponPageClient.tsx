'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './CouponPage.module.css'

interface Coupon {
    id: string
    code: string // For now, this can be just the ID or generated
    status: 'ISSUED' | 'USED' | 'VOID'
    createdAt: string
    usedAt: string | null
    storeId: string
    storeName: string
    benefit: string
    // Simplified store object for display
    store: {
        name: string
        benefitText: string
        usageCondition: string
    }
}

interface CouponPageClientProps {
    couponId: string
}

export default function CouponPageClient({ couponId }: CouponPageClientProps) {
    const router = useRouter()
    const [coupon, setCoupon] = useState<Coupon | null>(null)
    const [loading, setLoading] = useState(true)
    const [showPinModal, setShowPinModal] = useState(false)
    const [pin, setPin] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [copied, setCopied] = useState(false)
    const [mileage, setMileage] = useState<number | null>(null)

    useEffect(() => {
        // Load coupon from LocalStorage
        const loadCoupon = () => {
            try {
                const stored = localStorage.getItem(`coupon_${couponId}`)
                if (!stored) {
                    setLoading(false)
                    return
                }

                const data = JSON.parse(stored)
                // Adapt stored data to Component state structure if needed
                // In StorePageClient we saved: { id, storeId, storeName, benefit, issuedAt, status }
                // We need to map this to the structure the view expects

                const hydratedCoupon: Coupon = {
                    id: data.id,
                    code: data.id.substring(0, 8).toUpperCase(),
                    status: data.status,
                    createdAt: data.issuedAt,
                    usedAt: data.usedAt || null,
                    storeId: data.storeId,
                    storeName: data.storeName,
                    benefit: data.benefit,
                    store: {
                        name: data.storeName,
                        benefitText: data.benefit,
                        usageCondition: '직원에게 문의해주세요' // Simplified as we didn't save condition
                    }
                }
                setCoupon(hydratedCoupon)

                if (hydratedCoupon.status === 'USED') {
                    setSuccess(true)
                }
            } catch (e) {
                console.error('Failed to load coupon', e)
            } finally {
                setLoading(false)
            }
        }
        loadCoupon()
    }, [couponId])

    if (loading) return <div className="page"><div className="container text-center pt-20">로딩중...</div></div>

    if (!coupon) {
        return (
            <div className="page">
                <div className="container text-center pt-20">
                    <h1 className="text-xl font-bold mb-4">쿠폰을 찾을 수 없습니다</h1>
                    <p className="text-muted">잘못된 접근이거나 이미 삭제된 쿠폰입니다.</p>
                    <button className="btn btn-primary mt-6" onClick={() => router.push('/')}>홈으로 돌아가기</button>
                </div>
            </div>
        )
    }

    const isUsed = coupon.status === 'USED'
    const isVoid = coupon.status === 'VOID'
    const canUse = coupon.status === 'ISSUED'

    const handleUseClick = () => {
        if (!canUse) return
        setShowPinModal(true)
        setPin('')
        setError(null)
    }

    const handlePinSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!pin.trim()) {
            setError('PIN을 입력해주세요')
            return
        }

        // Client-side verification (Mock)
        setLoading(true)
        await new Promise(r => setTimeout(r, 800)) // Simulate network delay

        // Accepting any 4 digit PIN for now, or specific one "1234"
        if (pin === '1234') {
            const usedAt = new Date().toISOString()
            const updatedCoupon = {
                ...coupon,
                status: 'USED' as const,
                usedAt
            }
            setCoupon(updatedCoupon)
            setSuccess(true)

            // Update LocalStorage
            try {
                // We need to fetch original stored object and update it
                const stored = localStorage.getItem(`coupon_${couponId}`)
                if (stored) {
                    const data = JSON.parse(stored)
                    data.status = 'USED'
                    data.usedAt = usedAt
                    localStorage.setItem(`coupon_${couponId}`, JSON.stringify(data))
                }
            } catch (e) {
                console.error('Failed to update storage', e)
            }

            setMileage(100) // Mock mileage

            setTimeout(() => {
                setShowPinModal(false)
            }, 3000)
        } else {
            setError('PIN 번호가 올바르지 않습니다 (테스트: 1234)')
        }
        setLoading(false)
    }

    const handleCopyLink = async () => {
        const couponUrl = window.location.href
        try {
            await navigator.clipboard.writeText(couponUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            const textArea = document.createElement('textarea')
            textArea.value = couponUrl
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div className="page">
            <div className="container">
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        {success ? '사용 완료!' : isUsed ? '사용된 쿠폰' : '쿠폰이 생성되었습니다'}
                    </h1>
                    {!isUsed && !success && (
                        <p className={styles.subtitle}>이제 이 쿠폰을 사용할 수 있어요!</p>
                    )}
                </div>

                {/* Coupon Card */}
                <div className={styles.couponCard}>
                    <div className={styles.couponHeader}>
                        <span className={styles.couponLabel}>쿠폰 받은 링크</span>
                        <button
                            className={styles.copyBtn}
                            onClick={handleCopyLink}
                            title="링크 복사"
                        >
                            {copied ? '복사됨' : '복사'}
                        </button>
                    </div>

                    <div className={styles.couponUrl}>
                        {typeof window !== 'undefined' ? window.location.host : ''}/coupon/{coupon.id.slice(0, 8)}
                    </div>

                    <div className="divider" />

                    <div className={styles.storeInfo}>
                        <h2 className={styles.storeName}>{coupon.store.name}</h2>
                        <div className={styles.benefitBox}>
                            <span className={styles.benefitLabel}>혜택</span>
                            <span className={styles.benefitText}>{coupon.store.benefitText}</span>
                        </div>
                    </div>

                    {coupon.store.usageCondition && (
                        <p className={styles.condition}>{coupon.store.usageCondition}</p>
                    )}

                    {/* Status */}
                    <div className={styles.statusSection}>
                        {isUsed && (
                            <>
                                <span className="badge badge-error">사용 완료</span>
                                {coupon.usedAt && (
                                    <p className={styles.usedAt}>
                                        사용일시: {formatDate(coupon.usedAt)}
                                    </p>
                                )}
                            </>
                        )}
                        {isVoid && (
                            <span className="badge badge-error">무효화됨</span>
                        )}
                        {canUse && (
                            <span className="badge badge-success">사용 가능</span>
                        )}
                    </div>

                    {/* Coupon Code */}
                    <div className={styles.codeSection}>
                        <span className={styles.codeLabel}>쿠폰 코드</span>
                        <span className={styles.code}>{coupon.code}</span>
                    </div>
                </div>

                {/* Actions */}
                {!isUsed && !isVoid && (
                    <div className={styles.actions}>
                        <button
                            className="btn btn-secondary"
                            onClick={handleCopyLink}
                        >
                            링크 복사하기
                        </button>

                        <button
                            className="btn btn-primary"
                            onClick={handleUseClick}
                            disabled={!canUse}
                        >
                            사용하기
                        </button>

                        <p className="text-muted text-sm text-center mt-4">
                            직원 확인 후 눌러주세요
                        </p>
                    </div>
                )}

                {/* PIN Modal */}
                {showPinModal && (
                    <div className="overlay" onClick={() => !loading && setShowPinModal(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            {success ? (
                                <div className={styles.successContent}>
                                    <div className={styles.successIcon}>✓</div>
                                    <h2>사용 완료</h2>
                                    {mileage && (
                                        <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#F0FDFA', borderRadius: '8px', color: '#0F766E' }}>
                                            <p style={{ fontWeight: 'bold' }}>+{mileage}P 마일리지 적립!</p>
                                        </div>
                                    )}
                                    <p className="text-muted" style={{ marginTop: '12px' }}>쿠폰이 정상적으로 사용되었습니다</p>
                                </div>
                            ) : (
                                <>
                                    <h2 className={styles.modalTitle}>직원 PIN 입력</h2>
                                    <p className={styles.modalDesc}>
                                        가게 직원에게 PIN을 입력받으세요
                                    </p>

                                    <form onSubmit={handlePinSubmit}>
                                        <input
                                            type="password"
                                            inputMode="numeric"
                                            maxLength={6}
                                            value={pin}
                                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                            placeholder="PIN 입력"
                                            className={styles.pinInput}
                                            autoFocus
                                        />

                                        {error && (
                                            <p className="text-error text-sm mt-2">{error}</p>
                                        )}

                                        <div className={styles.modalActions}>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => setShowPinModal(false)}
                                                disabled={loading}
                                            >
                                                취소
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={loading || !pin}
                                            >
                                                {loading ? <span className="spinner" /> : '확인'}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
