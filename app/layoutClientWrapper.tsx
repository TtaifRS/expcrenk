'use client'

import { useState, useEffect } from 'react'
import ClientProviders from './components/ClientProviders'
import Header from '@/components/navigations/navbar/Header'
import LoadingScreen from '@/components/loadingScreen/LoadingScreen'

export default function LayoutClientWrapper({
	children,
}: {
	children: React.ReactNode
}) {
	const [isLoading, setIsLoading] = useState(true)
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		const checkImages = () => {
			const images = Array.from(document.images)
			const total = images.length

			if (total === 0) {
				setProgress(100)
				setTimeout(() => setIsLoading(false), 300)
				return
			}

			let loaded = 0

			const updateProgress = () => {
				loaded++
				const newProgress = Math.round((loaded / total) * 100)
				setProgress(newProgress)

				if (loaded === total) {
					setTimeout(() => setIsLoading(false), 300)
				}
			}

			images.forEach((img) => {
				if (img.complete) {
					updateProgress()
				} else {
					img.addEventListener('load', updateProgress)
					img.addEventListener('error', updateProgress)
				}
			})
		}

		const timer = setTimeout(checkImages, 100)
		const fallback = setTimeout(() => setIsLoading(false), 5000)

		return () => {
			clearTimeout(timer)
			clearTimeout(fallback)
		}
	}, [])

	// Prevent scrolling during loading
	useEffect(() => {
		if (isLoading) {
			document.documentElement.classList.add('no-scroll')
			document.body.classList.add('loading')
		} else {
			document.documentElement.classList.remove('no-scroll')
			document.body.classList.remove('loading')
		}

		return () => {
			document.documentElement.classList.remove('no-scroll')
			document.body.classList.remove('loading')
		}
	}, [isLoading])

	if (isLoading) {
		return <LoadingScreen />
	}

	return (
		<ClientProviders>
			<Header />
			<div className="content-fade-in">{children}</div>
		</ClientProviders>
	)
}
