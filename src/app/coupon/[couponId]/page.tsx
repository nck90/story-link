'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'

interface CouponData {
    id: string
    storeId: string
    storeName: string
    benefit: string
    status: 'ISSUED' | 'USED'
    pinCode?: string
}

interface PageProps {
    params: Promise<{ couponId: string }>
}

export default function CouponPage({ params }: PageProps) {
    const [couponId, setCouponId] = useState<string>('')
    const [coupon, setCoupon] = useState<CouponData | null>(null)
    const [mode, setMode] = useState<'view' | 'use' | 'success'>('view')
    const [pin, setPin] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        params.then(p => {
            setCouponId(p.couponId)
            // Mock Data Load (In real app, fetch from server)
            try {
                const data = localStorage.getItem(`coupon_${p.couponId}`)
                if (data) {
                    const parsed = JSON.parse(data)
                    setCoupon(parsed)
                    if (parsed.status === 'USED') {
                        setMode('success')
                    }
                } else {
                    // PRD 7-4: ID Example PASTA-7B1
                    // Fallback Mock
                    setCoupon({
                        id: p.couponId,
                        storeId: '1',
                        storeName: '먹음직 온천천점',
                        benefit: '소주 or 맥주 한 병 무료',
                        status: 'ISSUED',
                        pinCode: '0000'
                    })
                }
            } catch (e) {
                console.error(e)
            }
        })
    }, [params])

    const handleUseClick = () => {
        setMode('use')
    }

    const handlePinSubmit = () => {
        if (!coupon) return

        if (pin === (coupon.pinCode || '0000')) {
            const updated = { ...coupon, status: 'USED' as const }
            localStorage.setItem(`coupon_${couponId}`, JSON.stringify(updated))
            setCoupon(updated)
            setMode('success')
        } else {
            setError('PIN 번호가 올바르지 않습니다')
            setPin('')
        }
    }

    if (!coupon) return <div className="p-10 text-center">Loading...</div>

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <p className={styles.storeName}>{coupon.storeName}</p>
                <h1 className={styles.title}>{coupon.benefit}</h1>
                <p className="text-sm text-gray-500 mb-6 font-medium">
                    고기 3인분 이상 주문 시
                </p>

                {/* PRD 7-4: Coupon Generation Complete Page */}
                {mode === 'view' && (
                    <>
                        <div className={styles.couponCodeBox}>
                            <p className={styles.codeLabel}>COUPON CODE</p>
                            <p className={styles.codeValue}>{coupon.id}</p>
                        </div>

                        {/* Share Buttons (Mock) */}
                        <div className={styles.shareSection}>
                            <div className={`${styles.shareButton} ${styles.kakaoButton}`}>
                                카카오톡 공유
                            </div>
                            <div className={`${styles.shareButton} ${styles.smsButton}`}>
                                문자 공유
                            </div>
                        </div>

                        {/* Save Guide */}
                        <p className={styles.guideText}>
                            이 화면을 캡처하거나 링크를 저장해주세요
                        </p>

                        <div className={styles.buttonGroup}>
                            <button
                                className="btn btn-primary"
                                onClick={handleUseClick}
                                style={{ height: '56px', fontSize: '16px', fontWeight: 700 }}
                            >
                                사용하기
                            </button>
                        </div>
                    </>
                )}

                {/* PRD 7-5: Coupon Usage Page */}
                {mode === 'use' && (
                    <>
                        {/* Guide Text: "직원 확인 후 눌러주세요" -> Actually in the PRD, this is a guide BEFORE getting here or ON this page? 
                           PRD 7-5 UI says: "직원 확인 후 눌러주세요" guide. 
                           However, flow says: 1. [Use] click -> 2. PIN Input Display. 
                           So the guide should probably be on the PIN page or the previous page. 
                           Let's put it clearly here: "직원이 가게 고유 PIN 입력"
                        */}
                        <div className={styles.pinInputContainer}>
                            <p className="font-bold mb-8 text-lg">직원 확인 후 눌러주세요</p>
                            <input
                                type="tel"
                                className={styles.pinInput}
                                maxLength={4}
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="0000"
                                autoFocus
                            />
                            {error && <p className="text-red-500 text-sm mt-4 font-bold">{error}</p>}
                        </div>
                        <div className={styles.buttonGroup}>
                            <button
                                className="btn btn-primary"
                                onClick={handlePinSubmit}
                                disabled={pin.length < 4}
                                style={{ height: '56px', fontSize: '16px', fontWeight: 700 }}
                            >
                                확인
                            </button>
                            <button className="text-sm text-gray-400 p-2" onClick={() => setMode('view')}>
                                취소
                            </button>
                        </div>
                    </>
                )}

                {/* PRD 7-5: Use Complete */}
                {mode === 'success' && (
                    <div className="py-8">
                        <h2 className={styles.successMessage}>맛있는 식사 되세요!</h2>
                        <p className="text-gray-500 mt-2">쿠폰 사용이 완료되었습니다</p>
                    </div>
                )}
            </div>
        </div>
    )
}
