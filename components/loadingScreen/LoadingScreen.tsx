'use client'

import { useEffect, useState } from 'react'
import styles from './LoadingScreen.module.css'

interface LoadingScreenProps {
	progress: number
}

export default function LoadingScreen({ progress }: LoadingScreenProps) {
	const [displayProgress, setDisplayProgress] = useState(0)
	const [dotCount, setDotCount] = useState(0)
	const [isVisible, setIsVisible] = useState(true)

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
		}, 500)
		return () => clearInterval(interval)
	}, [])

	// Auto-hide after progress reaches 100%
	useEffect(() => {
		if (progress >= 100) {
			const timer = setTimeout(() => {
				setIsVisible(false)
			}, 800)
			return () => clearTimeout(timer)
		}
	}, [progress])

	if (!isVisible) return null

	const dots = '.'.repeat(dotCount)

	return (
		<div
			className={`${styles.loadingOverlay} ${
				progress >= 100 ? styles.fadeOut : ''
			}`}
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

				{/* Optional: Show what's being loaded */}
				{displayProgress < 100 && (
					<div className={styles.loadingDetails}>
						<small>Loading images & 3D model...</small>
					</div>
				)}
			</div>
		</div>
	)
}
