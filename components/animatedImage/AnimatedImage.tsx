'use client'

import { useEffect, useRef } from 'react'
import styles from './AnimatedImage.module.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useThrottledResize, ResizeCallback } from '@/hooks/useThrottledResize'

gsap.registerPlugin(ScrollTrigger)

interface AnimatedImageProps {
	src: string
	alt: string
	size: 'large' | 'small'
	className?: string
}

const AnimatedImage = ({ src, alt, size, className }: AnimatedImageProps) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const imgRef = useRef<HTMLImageElement>(null)
	const tlRef = useRef<gsap.core.Timeline | null>(null)
	const stRef = useRef<ScrollTrigger | null>(null)
	const versionRef = useRef(0)

	const prefersReducedMotion =
		typeof window !== 'undefined'
			? window.matchMedia('(prefers-reduced-motion: reduce)').matches
			: false

	const getParams = (isMobile: boolean) => ({
		scale: isMobile ? 1.2 : 1.4,
		duration: isMobile ? 3 : 6,
		delay: isMobile ? -0.5 : -1,
	})

	const createTimeline = (isMobile: boolean, version: number) => {
		if (!containerRef.current || !imgRef.current) return null
		if (version !== versionRef.current) return null

		tlRef.current?.kill()
		tlRef.current = null

		const container = containerRef.current
		const img = imgRef.current
		const { scale, duration, delay } = getParams(isMobile)

		const tl = gsap.timeline({ ease: 'power3.out' })

		tl.set(container, {
			visibility: 'visible',
			opacity: 1,
			pointerEvents: 'auto',
		})
		container.classList.add(styles.revealed)

		tl.fromTo(
			container,
			{
				clipPath: 'circle(0% at 0% 100%)',
				webkitClipPath: 'circle(0% at 0% 100%)',
			},
			{
				clipPath: 'circle(150% at 0% 100%)',
				webkitClipPath: 'circle(150% at 0% 100%)',
				duration: 1.5,
				ease: 'power3.out',
			},
			0
		)

		if (prefersReducedMotion) {
			tl.from(img, { opacity: 0, duration: 0.8 }, 0.3)
		} else if (!isMobile || size === 'large') {
			tl.from(
				img,
				{
					scale,
					duration,
					ease: 'power3.out',
					delay,
				},
				size === 'small' && !isMobile ? 0.2 : 0
			)
		} else {
			tl.from(
				img,
				{ y: 30, opacity: 0, duration: 1.5, ease: 'power3.out' },
				0.3
			)
		}

		tlRef.current = tl
		return tl
	}

	const setupScrollTrigger = (isMobile: boolean, version: number) => {
		if (!containerRef.current) return

		stRef.current?.kill()
		stRef.current = ScrollTrigger.create({
			trigger: containerRef.current,
			start: 'top 80%',
			end: 'bottom 20%',
			toggleActions: 'play none none none',
			onEnter: () => {
				if (version === versionRef.current) {
					createTimeline(isMobile, version)?.play()
				}
			},
			onEnterBack: () => {
				if (version === versionRef.current) {
					createTimeline(isMobile, version)?.play()
				}
			},
			onLeave: () => tlRef.current?.pause(),
			onLeaveBack: () => tlRef.current?.pause(),
		})
	}

	const handleResize: ResizeCallback = (width) => {
		if (!containerRef.current || !imgRef.current) return

		const isMobile = width < 768
		const version = ++versionRef.current

		setupScrollTrigger(isMobile, version)
	}

	useThrottledResize(handleResize, 250)

	useEffect(() => {
		const container = containerRef.current
		const img = imgRef.current
		if (!container || !img) return

		let mounted = true
		const version = ++versionRef.current

		const init = () => {
			if (!mounted || version !== versionRef.current) return
			const isMobile = window.innerWidth < 768
			setupScrollTrigger(isMobile, version)
		}

		if (img.complete && img.naturalWidth > 0) {
			init()
		} else {
			img.onload = init
		}

		return () => {
			mounted = false
			img.onload = null
			stRef.current?.kill()
			tlRef.current?.kill()
			versionRef.current = 0
		}
	}, [size])

	return (
		<div
			ref={containerRef}
			className={`${styles.reveal} ${styles[size]} ${className ?? ''}`}
		>
			<img
				ref={imgRef}
				src={src}
				alt={alt}
				loading="lazy"
				decoding="async"
				style={{ width: '100%', height: '100%', objectFit: 'cover' }}
			/>
		</div>
	)
}

export default AnimatedImage
