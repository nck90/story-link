'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { STORES } from "@/lib/stores";

export default function Home() {
  const router = useRouter();
  const [logoClicks, setLogoClicks] = useState(0);
  const [showStoreList, setShowStoreList] = useState(false);

  const handleLogoClick = () => {
    const newClicks = logoClicks + 1;
    if (newClicks >= 3) {
      router.push('/admin');
    } else {
      setLogoClicks(newClicks);
      setTimeout(() => setLogoClicks(0), 2000);
    }
  };

  if (showStoreList) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.headerTitle}>Story Link</h1>
            <div className={styles.profileIcon}></div>
          </header>

          <main className={styles.listMain}>
            <h2 className={styles.sectionTitle}>제휴 매장 목록</h2>

            <div className={styles.storeList}>
              {STORES.map((store) => (
                <Link href={`/${store.slug}`} key={store.id} className={styles.storeCardWrapper}>
                  <div className={styles.storeCard}>
                    <div className={styles.cardImageWrapper}>
                      <img src={store.images[0]} alt={store.name} className={styles.cardImage} />
                      <div className={styles.categoryTag}>
                        {store.category}
                      </div>
                    </div>
                    <div className={styles.cardContent}>
                      <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>{store.name}</h3>
                        {store.logoUrl && <img src={store.logoUrl} className={styles.cardLogo} alt="logo" />}
                      </div>
                      <p className={styles.cardIntro}>{store.intro}</p>
                      <div className={styles.benefitBadge}>
                        <span className={styles.benefitLabel}>🎁 혜택</span>
                        <span className={styles.benefitText}>{store.benefitText}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.brand}>
            <h1
              className={styles.title}
              onClick={handleLogoClick}
              style={{ cursor: 'pointer' }}
            >
              Story Link
            </h1>
            <p className={styles.tagline}>
              친구들이 다녀간 맛집,<br />
              스토리에서 바로 확인하세요
            </p>
          </div>

          <div className={styles.visualPlaceholder}>
            {/* Abstract circle or geometric shape for visual interest */}
            <div className={styles.circle1} />
            <div className={styles.circle2} />
          </div>

          <div className={styles.bottomSection}>
            <p className={styles.guideText}>
              지금 체험해보세요
            </p>
            <button
              onClick={() => setShowStoreList(true)}
              className="btn btn-primary w-full"
            >
              Story Link 입장하기
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

