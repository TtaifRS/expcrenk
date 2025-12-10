'use client'

import { useEffect, useRef } from 'react' // Add useRef
import ClientProviders from './components/ClientProviders'
import Header from '@/components/navigations/navbar/Header'
import LoadingScreen from '@/components/loadingScreen/LoadingScreen'
import { LoadingProvider, useLoading } from '@/context/LoadingContext'

// Separate component that uses the loading context
function LoadingContent({ children }: { children: React.ReactNode }) {
	const { isLoading, progress, markAssetLoaded, registerAsset } = useLoading()
	const hasTrackedImages = useRef(false) // Track if images already tracked

	// Track all images on the page - ONLY ONCE
	useEffect(() => {
		if (hasTrackedImages.current || !isLoading) return

		const trackAllImages = () => {
			const images = document.querySelectorAll('img')
			console.log(`Found ${images.length} images to track`)

			if (images.length === 0) {
				// Register a dummy asset to avoid division by zero
				registerAsset('dummy:no-images')
				markAssetLoaded('dummy:no-images')
				hasTrackedImages.current = true
				return
			}

			images.forEach((img, index) => {
				const src = img.src || img.getAttribute('src') || `image-${index}`
				if (!src) return

				const assetId = `image:${src}`
				registerAsset(assetId)

				if (img.complete) {
					console.log(`Image already complete: ${src}`)
					markAssetLoaded(assetId)
				} else {
					img.addEventListener('load', () => {
						console.log(`Image loaded: ${src}`)
						markAssetLoaded(assetId)
					})
					img.addEventListener('error', () => {
						console.log(`Image failed to load: ${src}`)
						markAssetLoaded(assetId) // Count errors as loaded
					})
				}
			})

			hasTrackedImages.current = true
		}

		// Wait for Next.js hydration and DOM to be ready
		const timer = setTimeout(trackAllImages, 300)

		return () => clearTimeout(timer)
	}, [registerAsset, markAssetLoaded, isLoading])

	// Prevent scrolling during loading
	useEffect(() => {
		if (isLoading) {
			document.documentElement.classList.add('no-scroll')
			document.body.classList.add('loading')
		} else {
			setTimeout(() => {
				document.documentElement.classList.remove('no-scroll')
				document.body.classList.remove('loading')
			}, 300)
		}

		return () => {
			document.documentElement.classList.remove('no-scroll')
			document.body.classList.remove('loading')
		}
	}, [isLoading])

	if (isLoading) {
		return <LoadingScreen progress={progress} />
	}

	return (
		<>
			<Header />
			<div className="content-fade-in">{children}</div>
		</>
	)
}

export default function LayoutClientWrapper({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<LoadingProvider>
			<ClientProviders>
				<LoadingContent>{children}</LoadingContent>
			</ClientProviders>
		</LoadingProvider>
	)
}
