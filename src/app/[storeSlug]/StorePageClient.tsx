'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './StorePage.module.css'

interface Store {
    id: string
    name: string
    slug: string
    description: string | null
    imageUrl: string | null
    benefitText: string
    usageCondition: string | null
}

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
    const [uploaderBenefit, setUploaderBenefit] = useState<string | null>(null)

    const handleCreateStoryLink = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/story-links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId: store.id }),
            })

            if (!res.ok) throw new Error('Failed to create link')

            const data = await res.json()
            const fullUrl = `${window.location.origin}/${store.slug}?source=story&link=${data.id}`
            setGeneratedLink(fullUrl)

            if (data.uploaderBenefit) {
                setUploaderBenefit(data.uploaderBenefit)
            }
        } catch (error) {
            console.error(error)
            alert('링크 생성에 실패했습니다')
        } finally {
            setLoading(false)
        }
    }

    const handleGetCoupon = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeId: store.id,
                    storyLinkId: storyLinkId
                }),
            })

            if (!res.ok) throw new Error('Failed to create coupon')

            const data = await res.json()
            router.push(`/coupon/${data.id}`)
        } catch (error) {
            console.error(error)
            alert('쿠폰 발급에 실패했습니다')
        } finally {
            setLoading(false)
        }
    }

    const handleCopyLink = async () => {
        if (!generatedLink) return

        try {
            await navigator.clipboard.writeText(generatedLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea')
            textArea.value = generatedLink
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="page">
            <div className="container">
                {/* Store Header */}
                <div className={styles.header}>
                    {store.imageUrl && (
                        <div className={styles.imageWrapper}>
                            <img
                                src={store.imageUrl}
                                alt={store.name}
                                className={styles.image}
                            />
                        </div>
                    )}
                    <h1 className={styles.storeName}>{store.name}</h1>
                    {store.description && (
                        <p className={styles.description}>{store.description}</p>
                    )}
                </div>

                {/* Benefit Section */}
                <div className={styles.benefitSection}>
                    <div className={styles.benefitCard}>
                        <p className={styles.benefitLabel}>혜택</p>
                        <p className={styles.benefitText}>{store.benefitText}</p>
                    </div>

                    {store.usageCondition && (
                        <div className={styles.conditionCard}>
                            <p className={styles.conditionLabel}>사용 조건</p>
                            <p className={styles.conditionText}>{store.usageCondition}</p>
                        </div>
                    )}
                </div>

                {/* Info Text */}
                <div className={styles.infoSection}>
                    <p className="text-muted text-center">
                        이 가게를 다녀간 사람이
                        <br />
                        인스타 스토리에 올린 사진을 보고
                        <br />
                        나중에 방문한 분들을 위한 페이지입니다.
                    </p>

                    {isFromStory && (
                        <ul className={styles.bulletList}>
                            <li>앱 설치 없이 바로 사용</li>
                            <li>스토리 보고 온 첫 한 가능</li>
                        </ul>
                    )}
                </div>

                {/* CTA Section */}
                <div className={styles.ctaSection}>
                    {!generatedLink ? (
                        <button
                            className="btn btn-primary"
                            onClick={isFromStory ? handleGetCoupon : handleCreateStoryLink}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="spinner" />
                            ) : isFromStory ? (
                                '쿠폰 받기'
                            ) : (
                                '인스타 스토리용 링크 생성하기'
                            )}
                        </button>
                    ) : (
                        <div className={styles.linkGenerated}>
                            <h2 className={styles.linkTitle}>링크가 생성되었습니다</h2>

                            <div className="copy-box">
                                <span className={styles.linkUrl}>{generatedLink}</span>
                            </div>

                            <button
                                className="btn btn-primary mt-4"
                                onClick={handleCopyLink}
                            >
                                {copied ? '복사됨!' : '링크 복사하기'}
                            </button>

                            <p className="text-muted text-sm text-center mt-4 mb-6">
                                이 링크를 인스타 스토리 링크 스티커에 붙이고
                                <br />
                                텍스트를 reply로 바꿔주세요.
                            </p>

                            {uploaderBenefit && (
                                <div className={styles.uploaderBenefitBadge}>
                                    <p className={styles.uploaderBenefitTitle}>🎁 업로더 특별 혜택</p>
                                    <p className={styles.uploaderBenefitText}>{uploaderBenefit}</p>
                                    <div className="divider" style={{ margin: '12px 0' }} />
                                    <p className="text-xs text-muted">직원에게 이 화면을 보여주면 혜택을 받을 수 있습니다.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
