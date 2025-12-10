'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import styles from './styles/nav.module.css'

export default function ImageComp({ links }: { links: any[] }) {
	const container = useRef<HTMLDivElement>(null)
	const imageWrappers = useRef<(HTMLDivElement | null)[]>([])

	useEffect(() => {
		const handleLinkHover = (e: Event) => {
			const idx = (e as CustomEvent).detail

			gsap.killTweensOf(imageWrappers.current)

			gsap.to(imageWrappers.current, {
				opacity: 0,
				duration: 0.4,
				ease: 'power2.out',
			})

			const targetWrapper = imageWrappers.current[idx]
			if (targetWrapper) {
				gsap.to(targetWrapper, {
					opacity: 1,
					duration: 0.6,
					ease: 'power3.out',
					delay: 0.1,
				})
			}
		}

		document.addEventListener('linkHover', handleLinkHover)

		return () => {
			document.removeEventListener('linkHover', handleLinkHover)
			gsap.killTweensOf(imageWrappers.current)
		}
	}, [])

	// Initialize first image as visible
	useEffect(() => {
		if (imageWrappers.current[0]) {
			gsap.set(imageWrappers.current[0], { opacity: 1 })
		}
	}, [])

	return (
		<div ref={container} className={styles.imageContainer}>
			{links.map((link, i) => (
				<div
					key={i}
					ref={(el) => {
						imageWrappers.current[i] = el
					}}
					className={styles.imageWrapper}
					style={{
						opacity: i === 0 ? 1 : 0,
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
					}}
				>
					<Image
						src={`/images/${link.img}`}
						fill
						alt={link.title || ''}
						className={styles.image}
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					/>
				</div>
			))}
		</div>
	)
}
