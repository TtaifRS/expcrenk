'use client'

import { useEffect, useState } from 'react'
import { useImageLoader } from '@/hooks/useImageLoader'
import styles from './LoadingScreen.module.css'

export default function LoadingScreen() {
	const { isLoaded, progress } = useImageLoader()
	const [show, setShow] = useState(true)
	const [displayProgress, setDisplayProgress] = useState(0)
	const [dotCount, setDotCount] = useState(0)

	// Smooth progress animation
	useEffect(() => {
		const timer = setTimeout(() => {
			setDisplayProgress(progress)
		}, 50)
		return () => clearTimeout(timer)
	}, [progress])

	// Animate dots
	useEffect(() => {
		const interval = setInterval(() => {
			setDotCount((prev) => (prev + 1) % 4)
		}, 400)

		return () => clearInterval(interval)
	}, [])

	// Handle exit animation
	useEffect(() => {
		if (isLoaded) {
			const timer = setTimeout(() => setShow(false), 300)
			return () => clearTimeout(timer)
		}
	}, [isLoaded])

	if (!show) return null

	const dots = '.'.repeat(dotCount)

	return (
		<div
			className={`${styles.loadingOverlay} ${isLoaded ? styles.hidden : ''}`}
		>
			<div className={styles.loadingContent}>
				<div className={styles.progressContainer}>
					<div className={styles.progressBackground}></div>
					<div
						className={styles.progressFill}
						style={{ width: `${displayProgress}%` }}
					></div>
					<div className={styles.progressGlow}></div>
				</div>

				<div className={styles.loadingText}>
					Loading<span className={styles.dots}>{dots}</span>
					<span className={styles.percentage}>{displayProgress}%</span>
				</div>
			</div>
		</div>
	)
}
