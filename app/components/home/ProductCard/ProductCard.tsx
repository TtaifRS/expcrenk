import Image from 'next/image'
import styles from '../styles/ProductCard.module.css'

interface ProductCardProps {
	href?: string
	imageSrc: string
	imageAlt?: string
	category: string
	title: string
	price: number | string
	currency?: string
}

export default function ProductCard({
	href = '#',
	imageSrc,
	imageAlt = '',
	category,
	title,
	price,
	currency = '€',
}: ProductCardProps) {
	return (
		<a href={href} className={styles.cardProduct}>
			<div className="relative">
				<div className={styles.imageContainer}>
					<div className={styles.imageWrapper}>
						<Image
							src={imageSrc}
							alt={imageAlt}
							fill
							sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw"
							className={styles.image}
							priority={false}
						/>
					</div>

					<div className={styles.hoverCta}>
						<div className={`${styles.square} ${styles.squareTopLeft}`}></div>
						<div className={styles.ctaFlex}>
							<span className={styles.body10}>{category}</span>
						</div>
						<div className={styles.discoverBtn}>Discover</div>
					</div>

					<div className={styles.hoverBorder}></div>
				</div>

				<div className={styles.titleBarWrapper}>
					<div className={styles.hoverTitle}>
						<div
							className={`${styles.square} ${styles.squareBottomLeft}`}
						></div>
						<div className={`${styles.square} ${styles.squareTopRight}`}></div>

						<div className={styles.titleContent}>
							<div className={styles.body20}>{title}</div>
						</div>

						<div className={styles.priceContainer}>
							<div className={styles.priceRow}>
								<span>{price}</span>
								<span>{currency}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className={styles.desktopTitle}>
				<span className={styles.body20}>{title}</span>
			</div>
		</a>
	)
}
