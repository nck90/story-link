'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'

// Kakao SDK types
declare global {
    interface Window {
        Kakao: any;
    }
}

interface CouponData {
    id: string
    storeId: string
    storeName: string
    benefit: string
    status: 'ISSUED' | 'USED'
    pinCode?: string
    storeImage?: string
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
    const [linkCopied, setLinkCopied] = useState(false)

    useEffect(() => {
        params.then(p => {
            setCouponId(p.couponId)

            // Initialize Kakao SDK
            if (window.Kakao && !window.Kakao.isInitialized()) {
                const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY || 'demo_key'
                window.Kakao.init(kakaoKey)
            }

            try {
                const data = localStorage.getItem(`coupon_${p.couponId}`)
                if (data) {
                    const parsed = JSON.parse(data)
                    setCoupon(parsed)
                    if (parsed.status === 'USED') {
                        setMode('success')
                    }
                } else {
                    setCoupon({
                        id: p.couponId,
                        storeId: '1',
                        storeName: '먹음직 온천천점',
                        benefit: '소주 or 맥주 한 병 무료',
                        status: 'ISSUED',
                        pinCode: '0000',
                        storeImage: '/main.jpeg'
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

    const handleKakaoShare = () => {
        if (!window.Kakao || !coupon) return

        const currentUrl = window.location.href
        const absoluteImageUrl = coupon.storeImage
            ? (coupon.storeImage.startsWith('http')
                ? coupon.storeImage
                : `${window.location.origin}${coupon.storeImage}`)
            : `${window.location.origin}/main.jpeg`

        window.Kakao.Share.sendCustom({
            templateId: 128640,
            templateArgs: {
                STORE_NAME: coupon.storeName,
                BENEFIT: coupon.benefit,
                COUPON_CODE: coupon.id,
                IMAGE_URL: absoluteImageUrl,
                WEB_URL: currentUrl,
            },
        })
    }

    const handleCopyLink = async () => {
        const currentUrl = window.location.href
        try {
            await navigator.clipboard.writeText(currentUrl)
            setLinkCopied(true)
            setTimeout(() => setLinkCopied(false), 2000)
        } catch {
            const textArea = document.createElement('textarea')
            textArea.value = currentUrl
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            setLinkCopied(true)
            setTimeout(() => setLinkCopied(false), 2000)
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

                {mode === 'view' && (
                    <>
                        <div className={styles.couponCodeBox}>
                            <p className={styles.codeLabel}>COUPON CODE</p>
                            <p className={styles.codeValue}>{coupon.id}</p>
                        </div>

                        <div className={styles.shareSection}>
                            <button
                                className={`${styles.shareButton} ${styles.kakaoButton}`}
                                onClick={handleKakaoShare}
                            >
                                카카오톡 공유
                            </button>
                            <button
                                className={`${styles.shareButton} ${styles.smsButton}`}
                                onClick={handleCopyLink}
                            >
                                {linkCopied ? '복사 완료' : '링크 복사'}
                            </button>
                        </div>

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

                {mode === 'use' && (
                    <>
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
