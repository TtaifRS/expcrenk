'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useThrottledResize } from '@/hooks/useThrottledResize'
import styles from '../styles/ProductDescription.module.css'
import AnimatedImage from '@/components/animatedImage/AnimatedImage'

interface ProductDescriptionSectionProps {
	imageRight?: boolean
	heading: string
	subHeading: string
	paragraph: string
	smallImageSrc: string
	largeImageSrc: string
}

gsap.registerPlugin(ScrollTrigger, SplitText)

export default function ProductDescription({
	imageRight = true,
	heading,
	subHeading,
	paragraph,
	smallImageSrc,
	largeImageSrc,
}: ProductDescriptionSectionProps) {
	const sectionRef = useRef<HTMLDivElement>(null)
	const paragraphRef = useRef<HTMLParagraphElement>(null)
	const splitTextRef = useRef<SplitText | null>(null)
	const [flexDirection, setFlexDirection] = useState<
		'row' | 'row-reverse' | 'column'
	>('row')

	useThrottledResize((width, height, isMobile) => {
		// Update flexDirection based on screen width
		setFlexDirection(
			width <= 900 ? 'column' : imageRight ? 'row' : 'row-reverse'
		)

		if (paragraphRef.current && sectionRef.current) {
			// Revert previous SplitText to avoid duplication
			if (splitTextRef.current) {
				splitTextRef.current.revert()
			}

			// Create new SplitText instance
			const splitText = new SplitText(paragraphRef.current, {
				type: 'lines',
				linesClass: 'line',
			})
			splitTextRef.current = splitText

			splitText.lines.forEach((line: Element) => {
				const text = line.innerHTML
				line.innerHTML = `<span style="display: block">${text}</span>`
			})

			// Set initial animation state
			gsap.set(paragraphRef.current.querySelectorAll('.line span'), {
				y: isMobile ? 40 : 70,
				force3D: true,
			})

			// Update ScrollTrigger
			ScrollTrigger.getAll().forEach((trigger) => {
				if (trigger.trigger === sectionRef.current) trigger.kill()
			})

			ScrollTrigger.create({
				trigger: sectionRef.current,
				start: 'top 80%',
				end: 'bottom 20%',
				onEnter: () => {
					if (!paragraphRef.current) return
					gsap.to(paragraphRef.current.querySelectorAll('.line span'), {
						y: 0,
						duration: 1,
						stagger: 0.1,
						ease: 'power3.out',
						force3D: true,
					})
				},
				onLeaveBack: () => {
					if (!paragraphRef.current) return
					gsap.to(paragraphRef.current.querySelectorAll('.line span'), {
						y: isMobile ? 40 : 70,
						duration: 1,
						stagger: 0.1,
						ease: 'power3.out',
						force3D: true,
					})
				},
				toggleActions: 'play reverse play reverse',
			})
		}
	}, 250)

	return (
		<section
			ref={sectionRef}
			className={styles.descriptionWrapper}
			style={{ flexDirection }}
		>
			<div className={styles.textContent}>
				<div>
					<h2 className={styles.heading}>
						{heading} <br /> {subHeading}
					</h2>
					<p ref={paragraphRef} className={styles.paragraph}>
						{paragraph}
					</p>
				</div>
				<AnimatedImage
					src={smallImageSrc}
					alt="decorative chador"
					size="small"
				/>
			</div>
			<div className={styles.imageContent}>
				<AnimatedImage src={largeImageSrc} alt="large chador" size="large" />
			</div>
		</section>
	)
}
