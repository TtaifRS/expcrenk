'use client'

import { ReactLenis, useLenis } from 'lenis/react'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface ClientProvidersProps {
	children: React.ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
	const lenisRef = useRef<any>(null)

	// GSAP ticker sync (global, once)
	useEffect(() => {
		function update(time: number) {
			lenisRef.current?.lenis?.raf(time * 1000)
		}

		gsap.ticker.add(update)
		gsap.ticker.lagSmoothing(0)

		// Register ScrollTrigger (global)
		gsap.registerPlugin(ScrollTrigger)

		return () => {
			gsap.ticker.remove(update)
		}
	}, [])

	// Subscribe to scroll updates globally if needed
	useLenis((lenis) => {
		ScrollTrigger.update() // Ensures ScrollTrigger syncs with Lenis
	})

	return (
		<ReactLenis
			root // Uses <html> as scroll container
			options={{ autoRaf: false }} // Manual RAF for GSAP
			ref={lenisRef}
		>
			{children}
		</ReactLenis>
	)
}
