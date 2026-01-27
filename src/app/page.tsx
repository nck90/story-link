'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoClick = () => {
    const newClicks = logoClicks + 1;
    if (newClicks >= 3) {
      router.push('/admin');
    } else {
      setLogoClicks(newClicks);
      setTimeout(() => setLogoClicks(0), 2000);
    }
  };

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
              Reply
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
            <Link href="/pasta" className="btn btn-primary">
              먹음직 온천천점 방문하기
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
