'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './Admin.module.css'

export default function AdminLoginPage() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const res = await fetch(`/api/admin/stats?password=${password}`)
            if (res.ok) {
                sessionStorage.setItem('admin_password', password)
                router.push('/admin/dashboard')
            } else {
                setError('Invalid Access Key')
            }
        } catch (err) {
            setError('System Error')
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.gridBackground}></div>

            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <div className={styles.logoBox}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h2 className={styles.title}>Admin Access</h2>
                    <p className={styles.subtitle}>Reply Management Portal</p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>Security Key</label>
                        <input
                            id="password"
                            type="password"
                            required
                            className={styles.input}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <button type="submit" className={styles.submitBtn}>
                        Authorize Session
                    </button>
                </form>

                <div className={styles.footer}>
                    <p className={styles.footerText}>Authorized Personnel Only</p>
                </div>
            </div>

            <div className={styles.accentOrange}></div>
            <div className={styles.accentBlack}></div>
        </div>
    )
}
