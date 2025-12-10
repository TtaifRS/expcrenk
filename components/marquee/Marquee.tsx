'use client'

import { useRef } from 'react'
import styles from './Marquee.module.css'
import { useMarqueeAnimation } from '@/hooks/useMarqueeAnimation'

interface MarqueeProps {
	promoCode: string
	discountAmount: string
	minOrder: string
	repeatCount?: number
	speed?: number
	className?: string
}

export const Marquee: React.FC<MarqueeProps> = ({
	promoCode,
	discountAmount,
	minOrder,
	repeatCount = 3,
	speed = 1,
	className,
}) => {
	const marqueeRef = useRef<HTMLDivElement>(null)

	useMarqueeAnimation(marqueeRef)

	const promoText = `Use the promo code "${promoCode}" to get ${discountAmount} discount on orders over ${minOrder}`

	const repeatedItems = Array.from({ length: repeatCount }, () => promoText)

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(promoCode)
		} catch (err) {
			console.error('Failed to copy: ', err)
		}
	}

	return (
		<div className={`${styles.marqueeContainer} ${className || ''}`}>
			<div ref={marqueeRef} className={styles.cardMarquee}>
				<div className={styles.marquee}>
					{repeatedItems.map((text, i) => (
						<p key={i}>
							{text.split(`"${promoCode}"`).map((part, j) => (
								<span key={j}>
									{part}
									{j === 0 && (
										<span
											className={styles.copyableCode}
											onClick={handleCopy}
											role="button"
											tabIndex={0}
											onKeyDown={(e) => e.key === 'Enter' && handleCopy()}
											aria-label={`Copy promo code ${promoCode}`}
										>
											{promoCode}
										</span>
									)}
								</span>
							))}
						</p>
					))}
				</div>
			</div>
		</div>
	)
}
