'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import styles from './styles/nav.module.css'

if (typeof window !== 'undefined') {
	gsap.registerPlugin(SplitText)
}

export default function Body({
	links,
	isOpen = false,
}: {
	links: any[]
	isOpen?: boolean
}) {
	const container = useRef<HTMLDivElement>(null)
	const splitTextRefs = useRef<SplitText[]>([])

	// Initialize SplitText
	useEffect(() => {
		if (!container.current) return

		const linkElements = container.current.querySelectorAll(`.${styles.link}`)

		linkElements.forEach((link, index) => {
			const split = new SplitText(link as HTMLElement, {
				type: 'chars',
				charsClass: 'char',
			})

			splitTextRefs.current[index] = split

			// Only set transform/opacity, NOT color
			gsap.set(split.chars, {
				y: '100%',
				opacity: 0,
				willChange: 'transform, opacity', // Remove 'color' from here
			})
		})

		return () => {
			splitTextRefs.current.forEach((split) => split?.revert())
		}
	}, [])

	// Handle animation
	useEffect(() => {
		if (splitTextRefs.current.length === 0) return

		const allChars = container.current?.querySelectorAll('.char')
		if (allChars) {
			gsap.killTweensOf(allChars)
		}

		if (isOpen) {
			splitTextRefs.current.forEach((split, index) => {
				if (!split?.chars) return

				gsap.to(split.chars, {
					y: 0,
					opacity: 1,
					duration: 0.9,
					stagger: 0.015,
					ease: 'power3.out',
					delay: index * 0.1,
					overwrite: 'auto',
				})
			})
		} else {
			splitTextRefs.current.forEach((split) => {
				if (!split?.chars) return

				gsap.to(split.chars, {
					y: '100%',
					opacity: 0,
					duration: 0.6,
					stagger: 0.01,
					ease: 'power2.in',
					overwrite: 'auto',
				})
			})
		}
	}, [isOpen])

	// Only dispatch event for ImageComp, don't animate colors
	const handleMouseEnter = (index: number) => {
		document.dispatchEvent(new CustomEvent('linkHover', { detail: index }))
	}

	return (
		<div ref={container} className={styles.body}>
			{links.map((link, i) => (
				<Link
					key={i}
					href="/"
					className={styles.link}
					onMouseEnter={() => handleMouseEnter(i)}
					style={{
						display: 'block',
						overflow: 'hidden',
						cursor: 'pointer',
					}}
				>
					{link.title}
				</Link>
			))}
		</div>
	)
}
