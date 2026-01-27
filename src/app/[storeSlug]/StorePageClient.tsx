'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { nanoid } from 'nanoid'
import styles from './StorePage.module.css'
import { Store } from '@/lib/stores'

interface StorePageClientProps {
    store: Store
    isFromStory: boolean
    storyLinkId: string | null
}

export default function StorePageClient({ store, isFromStory, storyLinkId }: StorePageClientProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [generatedLink, setGeneratedLink] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [viewMode, setViewMode] = useState<'landing' | 'link_created'>('landing')

    // Handle Create Story Link
    const handleCreateStoryLink = async () => {
        setLoading(true)
        await new Promise(resolve => setTimeout(resolve, 500))

        const linkId = nanoid(8) // PRD 7-2: 6~8 digits
        const shortLink = `${window.location.host}/${store.slug}/${linkId}` // Showing host/slug/id for visual

        setGeneratedLink(shortLink)
        setViewMode('link_created')
        setLoading(false)
    }

    const handleGetCoupon = async () => {
        setLoading(true)
        await new Promise(resolve => setTimeout(resolve, 500))
        const couponId = `${store.slug.toUpperCase()}-${nanoid(3).toUpperCase()}` // PRD 7-4: PASTA-7B1 style
        router.push(`/coupon/${couponId}`)
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

                    <button
                        className={`btn btn-primary ${styles.copyButton}`}
                        onClick={handleCopyLink}
                    >
                        {copied ? '복사 완료' : '링크 복사하기'}
                    </button>

                    <div className={styles.linkGuideBox}>
                        <p className={styles.linkGuideText}>쿠폰을 스토리와 함께 올려보세요!</p>
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
                    <img src={store.logoUrl} alt="Logo" className={styles.logoOverlay} />
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
