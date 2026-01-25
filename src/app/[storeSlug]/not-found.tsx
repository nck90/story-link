import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="page">
            <div className="container">
                <div style={{
                    textAlign: 'center',
                    paddingTop: '120px'
                }}>
                    <h1 style={{ marginBottom: '16px' }}>가게를 찾을 수 없습니다</h1>
                    <p className="text-muted">
                        요청하신 가게 페이지가 존재하지 않습니다.
                    </p>
                    <div style={{ marginTop: '32px' }}>
                        <Link href="/" className="btn btn-primary" style={{ maxWidth: '200px', margin: '0 auto' }}>
                            홈으로 돌아가기
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
