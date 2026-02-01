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
    storeAddress?: string
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
    const [addressCopied, setAddressCopied] = useState(false)

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

    // Timer Logic - 활성화 시점(issuedAt + 3시간) 및 만료 시점 체크
    useEffect(() => {
        if (!coupon || mode !== 'view') return

        const checkTime = () => {
            const now = new Date().getTime()

            // 1. 만료 체크
            if (coupon.expiresAt) {
                const expiryTime = new Date(coupon.expiresAt).getTime()
                if (now > expiryTime) {
                    setCanUse(false)
                    setTimeLeft('expired') // 특별한 상태 값
                    return
                }
            }

            // 2. 활성화 체크 (발급 후 3시간)
            if (!coupon.issuedAt) {
                setCanUse(true)
                return
            }

            const activationTime = new Date(coupon.issuedAt).getTime() + 3 * 60 * 60 * 1000
            const diff = activationTime - now

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

        if (pin === (coupon.pinCode || '0001')) {
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

    const handleCopyAddress = async () => {
        if (!coupon?.storeAddress) return
        try {
            await navigator.clipboard.writeText(coupon.storeAddress)
            setAddressCopied(true)
            setTimeout(() => setAddressCopied(false), 2000)
        } catch {
            const textArea = document.createElement('textarea')
            textArea.value = coupon.storeAddress
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            setAddressCopied(true)
            setTimeout(() => setAddressCopied(false), 2000)
        }
    }

    if (!coupon) return <div className="p-10 text-center">Loading...</div>

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <p className={styles.storeName}>{coupon.storeName}</p>
                <h1 className={styles.title}>방문 시, 쿠폰 혜택</h1>
                <p className="text-sm text-gray-500 mb-6 font-medium">
                    {coupon.benefit}
                </p>

                {coupon.storeAddress && (
                    <div className={styles.addressBox}>
                        <span className={styles.addressText}>📍 {coupon.storeAddress}</span>
                        <button
                            onClick={handleCopyAddress}
                            className={styles.copyAddressBtn}
                        >
                            {addressCopied ? '복사됨' : '주소 복사'}
                        </button>
                    </div>
                )}

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
                                카카오톡 나에게 공유(필수)
                            </button>
                        </div>

                        <p className="text-xs text-red-500 my-6 font-bold text-center">
                            친구의 소중했던 경험을<br />
                            직접 체험해보세요!
                        </p>

                        {/* 사용 가능 상태일 때만 유효기간 표시 */}
                        {canUse && coupon.expiresAt && (
                            <div className="text-sm text-gray-500 mb-6 bg-gray-50 py-3 px-4 rounded-lg text-center" style={{ margin: '0 20px 24px' }}>
                                <p style={{ fontSize: '13px', marginBottom: '4px' }}>유효기간: {new Date(coupon.expiresAt).toLocaleString('ko-KR', {
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</p>
                                <p className="text-xs text-red-500 font-bold">
                                    {(() => {
                                        const now = new Date().getTime()
                                        const expiry = new Date(coupon.expiresAt).getTime()
                                        const diff = expiry - now

                                        if (diff <= 0) return '만료된 쿠폰입니다'

                                        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                                        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                                        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

                                        if (days > 0) return `⏰ ${days}일 ${hours}시간 남음`
                                        return `⏰ ${hours}시간 ${minutes}분 남음`
                                    })()}
                                </p>
                            </div>
                        )}

                        <div className={styles.buttonGroup}>
                            <button
                                className={`btn btn-primary ${!canUse ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handleUseClick}
                                disabled={!canUse}
                                style={{
                                    height: '56px',
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    backgroundColor: timeLeft === 'expired' ? 'var(--color-gray-400)' : undefined,
                                    borderColor: timeLeft === 'expired' ? 'var(--color-gray-400)' : undefined
                                }}
                            >
                                {timeLeft === 'expired'
                                    ? '만료됨'
                                    : canUse
                                        ? '사용하기'
                                        : `${timeLeft} 후 사용 가능`
                                }
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
