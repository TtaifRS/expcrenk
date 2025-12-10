'use client'

import { useState, useEffect, useRef } from 'react'
import ClientProviders from './components/ClientProviders'
import Header from '@/components/navigations/navbar/Header'
import LoadingScreen from '@/components/loadingScreen/LoadingScreen'

interface AssetTracker {
	url: string
	loaded: boolean
	error: boolean
}

export default function LayoutClientWrapper({
	children,
}: {
	children: React.ReactNode
}) {
	const [isLoading, setIsLoading] = useState(true)
	const [progress, setProgress] = useState(0)
	const [loadingPhase, setLoadingPhase] = useState<
		'initial' | 'images' | 'complete'
	>('initial')

	const assetTrackersRef = useRef<AssetTracker[]>([])
	const hasStartedRef = useRef(false)
	const observerRef = useRef<MutationObserver | null>(null)
	const timeoutRef = useRef<NodeJS.Timeout | null>(null)

	// Function to track all assets on the page
	const trackAllAssets = useRef(() => {
		if (hasStartedRef.current) return
		hasStartedRef.current = true

		console.log('Starting asset tracking...')

		// Start with a minimum loading time for better UX
		const startTime = Date.now()
		const MIN_LOADING_TIME = 1500 // 1.5 seconds minimum

		// Phase 1: Track initial images
		setTimeout(() => {
			setLoadingPhase('images')

			const collectAndTrackImages = () => {
				// Get all images including Next.js Image components
				const allImages: HTMLImageElement[] = []

				// Regular img tags
				const imgElements = Array.from(document.querySelectorAll('img'))
				allImages.push(...imgElements)

				// Next.js Image components (they have data-nimg attribute)
				const nextImageWrappers = document.querySelectorAll('[data-nimg]')
				nextImageWrappers.forEach((wrapper) => {
					const img = wrapper.querySelector('img')
					if (img) allImages.push(img)
				})

				// Filter out duplicates and empty src
				const uniqueImages = allImages.filter(
					(img, index, self) =>
						img.src &&
						img.src !== '' &&
						self.findIndex((i) => i.src === img.src) === index
				)

				console.log(`Found ${uniqueImages.length} images to track`)

				if (uniqueImages.length === 0) {
					completeLoading(startTime, MIN_LOADING_TIME)
					return
				}

				assetTrackersRef.current = uniqueImages.map((img) => ({
					url: img.src,
					loaded: img.complete,
					error: false,
				}))

				// Check how many are already loaded
				const alreadyLoaded = assetTrackersRef.current.filter(
					(a) => a.loaded
				).length
				if (alreadyLoaded > 0) {
					updateProgress(alreadyLoaded, uniqueImages.length)
				}

				// Track each image
				uniqueImages.forEach((img, index) => {
					if (!img.complete) {
						img.addEventListener('load', () => {
							if (assetTrackersRef.current[index]) {
								assetTrackersRef.current[index].loaded = true
							}
							const loadedCount = assetTrackersRef.current.filter(
								(a) => a.loaded
							).length
							updateProgress(loadedCount, uniqueImages.length)

							if (loadedCount === uniqueImages.length) {
								completeLoading(startTime, MIN_LOADING_TIME)
							}
						})

						img.addEventListener('error', () => {
							if (assetTrackersRef.current[index]) {
								assetTrackersRef.current[index].loaded = true // Count errors as loaded
								assetTrackersRef.current[index].error = true
							}
							const loadedCount = assetTrackersRef.current.filter(
								(a) => a.loaded
							).length
							updateProgress(loadedCount, uniqueImages.length)

							if (loadedCount === uniqueImages.length) {
								completeLoading(startTime, MIN_LOADING_TIME)
							}
						})
					}
				})

				// If all were already loaded
				if (alreadyLoaded === uniqueImages.length) {
					completeLoading(startTime, MIN_LOADING_TIME)
				}
			}

			// Run initial collection
			collectAndTrackImages()

			// Set up MutationObserver to catch dynamically added images
			observerRef.current = new MutationObserver((mutations) => {
				let newImagesFound = false

				mutations.forEach((mutation) => {
					mutation.addedNodes.forEach((node) => {
						if (node.nodeType === Node.ELEMENT_NODE) {
							const element = node as Element

							// Check for new img elements
							const images = element.querySelectorAll('img')
							images.forEach((img) => {
								if (
									img.src &&
									!assetTrackersRef.current.some((a) => a.url === img.src)
								) {
									newImagesFound = true

									assetTrackersRef.current.push({
										url: img.src,
										loaded: img.complete,
										error: false,
									})

									if (!img.complete) {
										img.addEventListener('load', () => {
											const tracker = assetTrackersRef.current.find(
												(a) => a.url === img.src
											)
											if (tracker) tracker.loaded = true
											updateProgressFromTrackers()
										})

										img.addEventListener('error', () => {
											const tracker = assetTrackersRef.current.find(
												(a) => a.url === img.src
											)
											if (tracker) {
												tracker.loaded = true
												tracker.error = true
											}
											updateProgressFromTrackers()
										})
									}
								}
							})
						}
					})
				})

				if (newImagesFound) {
					updateProgressFromTrackers()
				}
			})

			// Start observing
			observerRef.current.observe(document.body, {
				childList: true,
				subtree: true,
			})
		}, 500) // Wait 500ms before starting image tracking

		// Safety timeout - always hide loading screen after 8 seconds
		timeoutRef.current = setTimeout(() => {
			console.log('Safety timeout reached, forcing loading to complete')
			completeLoading(startTime, 0)
		}, 8000)
	})

	// Helper function to update progress from trackers
	const updateProgressFromTrackers = () => {
		const loadedCount = assetTrackersRef.current.filter((a) => a.loaded).length
		const totalCount = assetTrackersRef.current.length
		updateProgress(loadedCount, totalCount)

		if (loadedCount === totalCount && totalCount > 0) {
			const startTime = Date.now()
			completeLoading(startTime, 500) // Wait at least 500ms more
		}
	}

	// Helper function to update progress with smoothing
	const updateProgress = (loaded: number, total: number) => {
		const newProgress = Math.round((loaded / total) * 100)
		setProgress((prev) => {
			// Smooth the progress - don't go backwards, and add some easing
			if (newProgress > prev) {
				return Math.min(newProgress, prev + 10) // Max 10% jump at a time
			}
			return prev
		})
	}

	// Helper function to complete loading
	const completeLoading = (startTime: number, minTime: number) => {
		const elapsed = Date.now() - startTime
		const remaining = Math.max(0, minTime - elapsed)

		setTimeout(() => {
			setLoadingPhase('complete')
			setProgress(100)

			// Small delay for smooth transition
			setTimeout(() => {
				setIsLoading(false)
			}, 300)
		}, remaining)
	}

	useEffect(() => {
		// Start tracking
		trackAllAssets.current()

		// Cleanup
		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect()
			}
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [])

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
		<ClientProviders>
			<Header />
			<div className="content-fade-in">{children}</div>
		</ClientProviders>
	)
}
