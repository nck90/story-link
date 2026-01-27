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
    issuedAt?: string
    expiresAt?: string
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
    const [timeLeft, setTimeLeft] = useState('')
    const [canUse, setCanUse] = useState(false)

    useEffect(() => {
        params.then(p => {
            setCouponId(p.couponId)

            // Initialize Kakao SDK
            if (window.Kakao && !window.Kakao.isInitialized()) {
                const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY || 'demo_key'
                window.Kakao.init(kakaoKey)
            }

            // Fetch coupon from API
            fetch(`/api/coupon/${p.couponId}`)
                .then(res => {
                    if (res.ok) return res.json()
                    throw new Error('Coupon not found')
                })
                .then(data => {
                    setCoupon(data)
                    if (data.status === 'USED') {
                        setMode('success')
                    }
                })
                .catch(err => {
                    console.error('Failed to fetch coupon:', err)
                    // Fallback to local storage if API fails
                    const localData = localStorage.getItem(`coupon_${p.couponId}`)
                    if (localData) {
                        setCoupon(JSON.parse(localData))
                    }
                })
        })
    }, [params])

    // Timer Logic
    useEffect(() => {
        if (!coupon || mode !== 'view') return

        const checkTime = () => {
            // Anchor to expiresAt from server
            let expiryTime: number
            if (coupon.expiresAt) {
                expiryTime = new Date(coupon.expiresAt).getTime()
            } else if (coupon.issuedAt) {
                // Fallback for legacy data: issuedAt + 3h
                expiryTime = new Date(coupon.issuedAt).getTime() + 3 * 60 * 60 * 1000
            } else {
                setCanUse(true)
                return
            }

            const now = new Date().getTime()
            const diff = expiryTime - now

            if (diff <= 0) {
                setCanUse(true)
                setTimeLeft('')
            } else {
                setCanUse(false)
                const hours = Math.floor(diff / (1000 * 60 * 60))
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                const seconds = Math.floor((diff % (1000 * 60)) / 1000)
                setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
            }
        }

        checkTime() // Initial check
        const timer = setInterval(checkTime, 1000)

        return () => clearInterval(timer)
    }, [coupon, mode])

    const handleUseClick = () => {
        if (!canUse) return
        setMode('use')
    }

    const handlePinSubmit = async () => {
        if (!coupon) return

        if (pin === (coupon.pinCode || '0000')) {
            try {
                const res = await fetch('/api/coupon/use', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ couponId: coupon.id })
                })

                if (res.ok) {
                    const updated = await res.json()
                    setCoupon(updated)
                    setMode('success')
                    // Update local backup
                    localStorage.setItem(`coupon_${couponId}`, JSON.stringify(updated))
                } else {
                    const errorData = await res.json()
                    setError(errorData.error || '쿠폰 사용 처리 중 오류가 발생했습니다.')
                }
            } catch (err) {
                setError('네트워크 오류가 발생했습니다.')
            }
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
                <p className={styles.storeName}>온천천 먹음직</p>
                <h1 className={styles.title}>방문 시, 쿠폰 혜택</h1>
                <p className="text-sm text-gray-500 mb-6 font-medium">
                    {coupon.benefit}
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
                                className={`btn btn-primary ${!canUse ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handleUseClick}
                                disabled={!canUse}
                                style={{ height: '56px', fontSize: '16px', fontWeight: 700 }}
                            >
                                {canUse ? '사용하기' : `${timeLeft} 후 사용 가능`}
                            </button>
                            {!canUse && (
                                <p className="text-xs text-red-500 mt-2 font-bold animate-pulse">
                                    스토리 업로드 후, 매장 직원에게 문의하세요.
                                </p>
                            )}
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
