import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className="page">
      <div className="container">
        <div className={styles.hero}>
          <h1 className={styles.title}>Reply</h1>
          <p className={styles.subtitle}>
            인스타그램 스토리로
            <br />
            가게 쿠폰을 공유하세요
          </p>
        </div>

        <div className={styles.info}>
          <p className="text-muted text-center">
            테스트 가게 페이지로 이동하려면
            <br />
            아래 링크를 클릭하세요
          </p>

          <div className="mt-6">
            <Link href="/pasta" className="btn btn-primary">
              테스트 가게 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
