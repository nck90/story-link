'use client'

import { useState, memo } from 'react'
import { useRouter } from 'next/navigation'
import { nanoid } from 'nanoid'
import styles from './StorePage.module.css'
import { Store } from '@/lib/stores'

interface StorePageClientProps {
    store: Store
    isFromStory: boolean
    storyLinkId: string | null
}

function StorePageClient({ store, isFromStory, storyLinkId }: StorePageClientProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [generatedLink, setGeneratedLink] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [viewMode, setViewMode] = useState<'landing' | 'link_created'>('landing')
    const [logoClicks, setLogoClicks] = useState(0)

    const handleLogoClick = () => {
        const newClicks = logoClicks + 1
        if (newClicks >= 3) {
            router.push('/admin')
        } else {
            setLogoClicks(newClicks)
            // Optional: reset after 2 seconds of inactivity
            setTimeout(() => setLogoClicks(0), 2000)
        }
    }

    // Handle Create Story Link
    const handleCreateStoryLink = async () => {
        setLoading(true)

        try {
            const linkId = nanoid(8) // PRD 7-2: 6~8 digits

            // Call API to track link creation based on store slug
            await fetch('/api/link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: linkId,
                    storeSlug: store.slug,
                }),
            })

            const shortLink = `${window.location.host}/${store.slug}/${linkId}` // Showing host/slug/id for visual

            setGeneratedLink(shortLink)
            setViewMode('link_created')
        } catch (error) {
            console.error('Failed to create link:', error)
            // Fallback to client-side generation if API fails, to not block user
            const linkId = nanoid(8)
            const shortLink = `${window.location.host}/${store.slug}/${linkId}`
            setGeneratedLink(shortLink)
            setViewMode('link_created')
        } finally {
            setLoading(false)
        }
    }

    const handleGetCoupon = async () => {
        setLoading(true)

        try {
            // Call API to issue coupon
            const res = await fetch('/api/coupon/issue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    storeId: store.id,
                    storeName: store.name,
                    benefit: store.benefitText,
                    linkGenId: storyLinkId, // Pass the link ID from URL if available
                }),
            })

            if (res.ok) {
                const coupon = await res.json()
                // Store in local storage as backup / cache specific to device
                // But source of truth is DB now
                localStorage.setItem(`coupon_${coupon.id}`, JSON.stringify(coupon))

                router.push(`/coupon/${coupon.id}`)
            } else {
                const errorData = await res.json()
                alert(errorData.error || '쿠폰 발급 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
                setLoading(false)
            }
        } catch (error) {
            console.error('Error issuing coupon:', error)
            alert('일시적인 시스템 오류가 발생했습니다. 네트워크 상태를 확인해주세요.')
            setLoading(false)
        }
    }

    const handleCopyLink = async () => {
        if (!generatedLink) return
        const fullLink = `${window.location.protocol}//${generatedLink}`
        try {
            await navigator.clipboard.writeText(fullLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Fallback
        }
    }

    /* PRD 7-2: Link Creation Page */
    if (viewMode === 'link_created') {
        return (
            <div className={styles.container}>
                <div className={styles.linkCreationWrapper}>
                    <div className={styles.linkCreationHeader}>
                        <h2 className={styles.linkCreationTitle}>링크 생성 완료</h2>
                        <p className={styles.linkCreationDesc}>아래 링크를 복사하여 인스타 스토리에 올려주세요</p>
                    </div>

                    <div className={styles.linkDisplayBox}>
                        <p className={styles.linkDisplayText}>{generatedLink}</p>
                    </div>

                    <div className={styles.uploaderBenefitBox}>
                        <p className={styles.uploaderBenefitTitle}>업로더에 대한 혜택</p>
                        <p className={styles.uploaderBenefitText}>음료 한 병 무료</p>
                    </div>

                    <button
                        className={`btn btn-primary ${styles.copyButton}`}
                        onClick={handleCopyLink}
                    >
                        {copied ? '복사 완료' : '링크 복사하기'}
                    </button>

                    <div className={styles.linkGuideBox}>
                        <p className={styles.linkGuideText}>
                            쿠폰을 스토리와 함께 업로드 후<br />
                            직원에게 문의 해주세요!
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    /* PRD 7-1 & 7-3: Store Landing & Pre-Coupon */
    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <div className={styles.heroImageWrapper}>
                <img
                    src={store.images[0]}
                    alt={store.name}
                    className={styles.heroImage}
                />
                {store.logoUrl && (
                    <img
                        src={store.logoUrl}
                        alt="Logo"
                        className={styles.logoOverlay}
                        onClick={handleLogoClick}
                        style={{ cursor: 'pointer' }}
                    />
                )}
                <div className={styles.imageOverlay}>
                    <span className={styles.categoryTag}>{store.category}</span>
                    <h1 className={styles.storeName}>{store.name}</h1>
                    <p className={styles.introText}>{store.intro}</p>
                </div>
            </div>

            {/* Content Section */}
            <div className={styles.contentSection}>
                {/* Description first per PRD 7-3 "Store Intro" */}
                {/* Actually PRD 7-3 says: Image -> Intro -> Benefit -> Condition -> "Friend's text" -> Button */}
                {/* Let's follow that order generally, but visual hierarchy matters. */}

                <div className="mb-6">
                    <p className="text-sm text-gray-800 leading-relaxed font-medium">
                        {store.description}
                    </p>
                </div>

                {/* Benefits */}
                <div className={styles.benefitCard}>
                    <span className={styles.benefitLabel}>혜택 상세</span>
                    <p className={styles.benefitText}>{store.benefitText}</p>
                    <p className={styles.conditionText}>{store.usageCondition}</p>
                </div>

                {/* Address Section */}
                <div className="mb-8 p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                        📍 매장 위치
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        {store.address || '주소 정보가 없습니다.'}
                    </p>
                    <button
                        onClick={() => {
                            if (store.address) {
                                navigator.clipboard.writeText(store.address)
                                // 간단한 토스트나 알림 대신 버튼 텍스트 변경 등으로 피드백
                                const btn = document.getElementById('addr-copy-btn')
                                if (btn) {
                                    const originalText = btn.innerText
                                    btn.innerText = '✅ 복사 완료'
                                    setTimeout(() => {
                                        btn.innerText = originalText
                                    }, 2000)
                                }
                            }
                        }}
                        id="addr-copy-btn"
                        className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg border border-gray-200 transition-colors flex items-center justify-center gap-1"
                    >
                        📋 주소 복사하기
                    </button>
                </div>

                {/* Visitor Info Text for 7-3 */}
                {isFromStory && (
                    <div className="text-center mb-8 bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-800 font-bold">
                            친구가 방문했던 가게,<br />
                            온천천 먹음직을 방문해 보세요!
                        </p>
                    </div>
                )}

                {/* Gallery */}
                <div className={styles.gallerySection}>
                    <h3 className={styles.sectionTitle}>매장 둘러보기</h3>

                    {/* ... gallery items (no changes needed here but including context for replace) ... */}
                    <div className={styles.galleryScroll}>
                        {store.images.map((img, idx) => (
                            <div key={idx} className={styles.galleryItem}>
                                <img
                                    src={img}
                                    alt={`매장 사진 ${idx + 1}`}
                                    className={styles.galleryImage}
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className={styles.ctaBar}>
                <button
                    className="btn btn-primary"
                    onClick={isFromStory ? handleGetCoupon : handleCreateStoryLink}
                    disabled={loading}
                    style={{ height: '56px', fontSize: '16px', fontWeight: 700 }}
                >
                    {loading ? '처리중...' : (
                        isFromStory ? '쿠폰 받기' : '스토리용 쿠폰 생성하기' // PRD 7-1 Modified Button Text check? PRD says "스토리용 쿠폰 생성하기" (Modified) & "쿠폰 받기" (Source=Story)
                    )}
                </button>
            </div>
        </div>
    )
}

export default memo(StorePageClient)
