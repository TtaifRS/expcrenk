'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import Image from 'next/image'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'
import styles from '../styles/ProductGallery.module.css'
import productsData, { Product } from '@/lib/featuredProducts'

interface ProductGalleryProps {
	products?: Product[]
}

export default function ProductGallery({
	products: propProducts,
}: ProductGalleryProps) {
	const finalProducts = propProducts?.length ? propProducts : productsData

	const productContainerRef = useRef<HTMLUListElement>(null)
	const productNameRef = useRef<HTMLParagraphElement>(null)
	const productPreviewRef = useRef<HTMLDivElement>(null)
	const previewNameRef = useRef<HTMLParagraphElement>(null)
	const previewPriceRef = useRef<HTMLParagraphElement>(null)
	const previewTagRef = useRef<HTMLDivElement>(null)
	const previewUrlRef = useRef<HTMLAnchorElement>(null)
	const productBannerRef = useRef<HTMLDivElement>(null)
	const controllerInnerRef = useRef<HTMLDivElement>(null)
	const controllerOuterRef = useRef<HTMLDivElement>(null)
	const closeIconSpansRef = useRef<(HTMLSpanElement | null)[]>([])
	const prevBtnRef = useRef<HTMLDivElement>(null)
	const nextBtnRef = useRef<HTMLDivElement>(null)

	const [currentProductIndex, setCurrentProductIndex] = useState(0)
	const [isPreviewAnimating, setIsPreviewAnimating] = useState(false)
	const [isPreviewOpen, setIsPreviewOpen] = useState(false)

	const BUFFER_SIZE = 3
	const baseSpacing = 0.375
	const slideWidth = baseSpacing * 1000

	// Prevent scroll when preview is open
	useEffect(() => {
		if (isPreviewOpen) {
			const scrollY = window.scrollY
			const scrollbarWidth =
				window.innerWidth - document.documentElement.clientWidth
			document.body.style.position = 'fixed'
			document.body.style.top = `-${scrollY}px`
			document.body.style.width = '100%'
			document.body.style.overflow = 'hidden'
			document.body.style.paddingRight = `${scrollbarWidth}px`

			return () => {
				document.body.style.position = ''
				document.body.style.top = ''
				document.body.style.width = ''
				document.body.style.overflow = ''
				document.body.style.paddingRight = ''
				window.scrollTo(0, scrollY)
			}
		}
	}, [isPreviewOpen])

	if (!finalProducts.length) {
		return (
			<div className={styles.container}>
				<p>No products available.</p>
			</div>
		)
	}

	// Initialize slider
	useEffect(() => {
		initializeSlider()
	}, [finalProducts])

	// Initialize styles for animated elements
	useEffect(() => {
		if (controllerOuterRef.current) {
			gsap.set(controllerOuterRef.current, {
				clipPath: 'circle(50% at 50% 50%)',
			})
		}
		if (controllerInnerRef.current) {
			gsap.set(controllerInnerRef.current, {
				clipPath: 'circle(40% at 50% 50%)',
			})
		}
		closeIconSpansRef.current.forEach((span) => {
			if (span) {
				gsap.set(span, { width: '0px' })
			}
		})
		const navEls = document.querySelectorAll(
			`.${styles['controller-label']} p, .${styles['nav-btn']}`
		)
		gsap.set(navEls, { opacity: 1 })
		if (productPreviewRef.current) {
			gsap.set(productPreviewRef.current, { y: '100%' })
		}
		if (productBannerRef.current) {
			gsap.set(productBannerRef.current, { opacity: 0 })
		}
	}, [])

	// Add slide item
	const addSlideItem = useCallback(
		(relativeIndex: number) => {
			if (!productContainerRef.current) return

			const productIndex =
				(((currentProductIndex + relativeIndex) % finalProducts.length) +
					finalProducts.length) %
				finalProducts.length
			const product = finalProducts[productIndex]

			const li = document.createElement('li')

			const img = document.createElement('img')
			img.src = product.img
			img.alt = product.name
			img.style.objectFit = 'cover'
			img.style.width = '100%'
			img.style.height = '100%'

			li.appendChild(img)
			li.setAttribute('data-relative-index', relativeIndex.toString())

			gsap.set(li, {
				x: relativeIndex * slideWidth,
				scale: relativeIndex === 0 ? 1.25 : 0.75,
				zIndex: relativeIndex === 0 ? 100 : 1,
			})

			productContainerRef.current.appendChild(li)
		},
		[currentProductIndex, finalProducts, slideWidth]
	)

	// Remove slide items
	const removeSlideItems = useCallback((relativeIndex: number) => {
		if (!productContainerRef.current) return

		const items = productContainerRef.current.querySelectorAll(
			`li[data-relative-index="${relativeIndex}"]`
		)
		items.forEach((item) => item.remove())
	}, [])

	// Update slider position
	const updateSliderPosition = useCallback(() => {
		if (!productContainerRef.current) return

		const items = productContainerRef.current.querySelectorAll('li')
		items.forEach((item) => {
			const relativeIndex = Number(item.getAttribute('data-relative-index'))
			const isActive = relativeIndex === 0

			gsap.to(item, {
				x: relativeIndex * slideWidth,
				scale: isActive ? 1.25 : 0.75,
				zIndex: isActive ? 100 : 1,
				duration: 0.75,
				ease: 'power3.out',
			})
		})
	}, [slideWidth])

	// Update product name
	const updateProductName = useCallback(() => {
		const actualIndex =
			((currentProductIndex % finalProducts.length) + finalProducts.length) %
			finalProducts.length
		if (productNameRef.current) {
			productNameRef.current.textContent =
				finalProducts[actualIndex]?.name || 'N/A'
		}
	}, [currentProductIndex, finalProducts])

	// Update preview content
	const updatePreviewContent = useCallback(() => {
		const actualIndex =
			((currentProductIndex % finalProducts.length) + finalProducts.length) %
			finalProducts.length
		const currentProduct = finalProducts[actualIndex] || {}

		if (previewNameRef.current)
			previewNameRef.current.textContent = currentProduct.name || 'N/A'
		if (previewPriceRef.current)
			previewPriceRef.current.textContent = currentProduct.price || 'N/A'
		if (previewTagRef.current)
			previewTagRef.current.textContent = currentProduct.tag || 'N/A'
		if (previewUrlRef.current)
			previewUrlRef.current.href = currentProduct.url || '#'
		if (productBannerRef.current) {
			const img = productBannerRef.current.querySelector('img')
			if (img) {
				img.src = currentProduct.img || '/images/fallback.jpg'
				img.alt = currentProduct.name || 'Product image'
			}
		}
	}, [currentProductIndex, finalProducts])

	// Move next
	const moveNext = useCallback(() => {
		if (isPreviewAnimating || isPreviewOpen) return

		setCurrentProductIndex((prev) => prev + 1)

		removeSlideItems(-BUFFER_SIZE)

		if (productContainerRef.current) {
			const items = productContainerRef.current.querySelectorAll('li')
			items.forEach((item) => {
				const currentIndex = Number(item.getAttribute('data-relative-index'))
				const newIndex = currentIndex - 1
				item.setAttribute('data-relative-index', newIndex.toString())
			})
		}

		addSlideItem(BUFFER_SIZE)

		updateSliderPosition()
		updateProductName()
		updatePreviewContent()
	}, [
		isPreviewAnimating,
		isPreviewOpen,
		removeSlideItems,
		addSlideItem,
		updateSliderPosition,
		updateProductName,
		updatePreviewContent,
	])

	// Move previous
	const movePrev = useCallback(() => {
		if (isPreviewAnimating || isPreviewOpen) return

		setCurrentProductIndex((prev) => prev - 1)

		removeSlideItems(BUFFER_SIZE)

		if (productContainerRef.current) {
			const items = productContainerRef.current.querySelectorAll('li')
			items.forEach((item) => {
				const currentIndex = Number(item.getAttribute('data-relative-index'))
				const newIndex = currentIndex + 1
				item.setAttribute('data-relative-index', newIndex.toString())
			})
		}

		addSlideItem(-BUFFER_SIZE)

		updateSliderPosition()
		updateProductName()
		updatePreviewContent()
	}, [
		isPreviewAnimating,
		isPreviewOpen,
		removeSlideItems,
		addSlideItem,
		updateSliderPosition,
		updateProductName,
		updatePreviewContent,
	])

	// Update button states
	const updateButtonStates = useCallback(() => {
		if (!prevBtnRef.current || !nextBtnRef.current) return
		const isDisabled = isPreviewAnimating || isPreviewOpen
		prevBtnRef.current.classList.toggle(styles.disabled, isDisabled)
		nextBtnRef.current.classList.toggle(styles.disabled, isDisabled)
	}, [isPreviewAnimating, isPreviewOpen])

	// Get active slide
	const getActiveSlide = useCallback(() => {
		if (!productContainerRef.current) return null
		return productContainerRef.current.querySelector(
			'li[data-relative-index="0"]'
		)
	}, [])

	// Animate slide items
	const animateSlideItems = useCallback(
		(hide = false) => {
			if (!productContainerRef.current) return

			const activeSlide = getActiveSlide()
			const items = productContainerRef.current.querySelectorAll('li')

			items.forEach((item) => {
				const relativeIndex = Number(item.getAttribute('data-relative-index'))
				const absIndex = Math.abs(relativeIndex)

				if (absIndex === 1 || absIndex === 2) {
					gsap.to(item, {
						x: hide
							? relativeIndex * slideWidth * 1.5
							: relativeIndex * slideWidth,
						opacity: hide ? 0 : 1,
						duration: 0.75,
						ease: 'power3.inOut',
					})
				}
			})

			if (activeSlide) {
				gsap.to(activeSlide, {
					scale: hide ? 0.75 : 1.25,
					opacity: hide ? 0 : 1,
					duration: 0.75,
					ease: 'power3.inOut',
				})
			}
		},
		[slideWidth, getActiveSlide]
	)

	// Animate controller transition
	const animateControllerTransition = useCallback((opening = false) => {
		if (!controllerInnerRef.current || !controllerOuterRef.current) return

		const navEls = document.querySelectorAll(
			`.${styles['controller-label']} p, .${styles['nav-btn']}`
		)
		gsap.to(navEls, {
			opacity: opening ? 0 : 1,
			duration: 0.2,
			ease: 'power3.out',
			delay: opening ? 0 : 0.4,
		})

		gsap.to(controllerOuterRef.current, {
			clipPath: opening ? 'circle(0% at 50% 50%)' : 'circle(50% at 50% 50%)',
			duration: 0.75,
			ease: 'power3.inOut',
		})

		gsap.to(controllerInnerRef.current, {
			clipPath: opening ? 'circle(50% at 50% 50%)' : 'circle(40% at 50% 50%)',
			duration: 0.75,
			ease: 'power3.inOut',
		})

		closeIconSpansRef.current.forEach((span, index) => {
			if (span) {
				gsap.to(span, {
					width: opening ? '20px' : '0px',
					duration: opening ? 0.4 : 0.3,
					ease: opening ? 'power3.out' : 'power3.in',
					delay: opening ? 0.2 + index * 0.1 : index * 0.05,
				})
			}
		})
	}, [])

	// Toggle preview
	const togglePreview = useCallback(() => {
		if (isPreviewAnimating) return

		setIsPreviewAnimating(true)
		updateButtonStates()

		if (!isPreviewOpen) updatePreviewContent()

		gsap.to(productPreviewRef.current, {
			y: isPreviewOpen ? '100%' : '-50%',
			duration: 0.75,
			ease: 'power3.inOut',
		})

		gsap.to(productBannerRef.current, {
			opacity: isPreviewOpen ? 0 : 1,
			duration: 0.4,
			delay: isPreviewOpen ? 0 : 0.25,
			ease: 'power3.inOut',
		})

		animateSlideItems(!isPreviewOpen)
		animateControllerTransition(!isPreviewOpen)

		setTimeout(() => {
			setIsPreviewAnimating(false)
			setIsPreviewOpen((prev) => !prev)
			updateButtonStates()
		}, 600)
	}, [
		isPreviewAnimating,
		isPreviewOpen,
		updateButtonStates,
		updatePreviewContent,
		animateSlideItems,
		animateControllerTransition,
	])

	// Initialize slider
	const initializeSlider = useCallback(() => {
		if (!productContainerRef.current) return

		productContainerRef.current.innerHTML = ''

		for (let i = -BUFFER_SIZE; i <= BUFFER_SIZE; i++) {
			addSlideItem(i)
		}

		updateSliderPosition()
		updateProductName()
		updatePreviewContent()
		updateButtonStates()
	}, [
		addSlideItem,
		updateSliderPosition,
		updateProductName,
		updatePreviewContent,
		updateButtonStates,
	])

	// Update button states when animation states change
	useEffect(() => {
		updateButtonStates()
	}, [isPreviewAnimating, isPreviewOpen, updateButtonStates])

	// Clean up GSAP animations on unmount
	useEffect(() => {
		return () => {
			if (productContainerRef.current) {
				const slides = productContainerRef.current.querySelectorAll('li')
				if (slides) {
					gsap.killTweensOf(slides)
				}
			}
			document.body.style.position = ''
			document.body.style.top = ''
			document.body.style.width = ''
			document.body.style.overflow = ''
		}
	}, [])

	const currentProduct =
		finalProducts[
			((currentProductIndex % finalProducts.length) + finalProducts.length) %
				finalProducts.length
		] || {}

	return (
		<div className={styles.container}>
			<div className={styles.nav}>
				<div className={styles.logo}>
					<p>Nokshikabbo</p>
				</div>
				<div className={styles['product-name']}>
					<p ref={productNameRef}>{currentProduct.name || 'Loading...'}</p>
				</div>
			</div>

			<div className={styles.gallery}>
				<ul
					className={styles.products}
					ref={productContainerRef}
					role="listbox"
					aria-label="Product gallery"
				/>

				<div className={styles.controller}>
					<div
						className={styles['controller-inner']}
						ref={controllerInnerRef}
						onClick={togglePreview}
						onKeyDown={(e) => e.key === 'Enter' && togglePreview()}
						role="button"
						tabIndex={0}
						aria-label={isPreviewOpen ? 'Close preview' : 'Open preview'}
					>
						<div className={styles['close-icon']}>
							<span
								ref={(el) => {
									closeIconSpansRef.current[0] = el
								}}
							></span>
							<span
								ref={(el) => {
									closeIconSpansRef.current[1] = el
								}}
							></span>
						</div>
					</div>
					<div className={styles['controller-outer']} ref={controllerOuterRef}>
						<div className={styles['controller-label']}>
							<p>Menu</p>
						</div>
						<div
							className={`${styles['nav-btn']} ${styles.prev}`}
							ref={prevBtnRef}
							onClick={movePrev}
							onKeyDown={(e) => e.key === 'Enter' && movePrev()}
							role="button"
							tabIndex={0}
							aria-label="Previous product"
						>
							<FaAngleLeft />
						</div>
						<div
							className={`${styles['nav-btn']} ${styles.next}`}
							ref={nextBtnRef}
							onClick={moveNext}
							onKeyDown={(e) => e.key === 'Enter' && moveNext()}
							role="button"
							tabIndex={0}
							aria-label="Next product"
						>
							<FaAngleRight />
						</div>
					</div>
				</div>

				<div className={styles['product-banner']} ref={productBannerRef}>
					<Image
						src={currentProduct.img || '/images/fallback.jpg'}
						alt={currentProduct.name || 'Product image'}
						width={600}
						height={400}
						sizes="(max-width: 768px) 80vw, 50vw"
						loading="eager"
						priority
						style={{ objectFit: 'cover', transform: 'scale(1.25)' }}
					/>
				</div>

				<div className={styles['product-preview']} ref={productPreviewRef}>
					<div className={styles['product-preview-info']}>
						<div className={styles['product-preview-name']}>
							<p ref={previewNameRef}>{currentProduct.name || 'Loading...'}</p>
						</div>
						<p
							className={styles['product-preview-price']}
							ref={previewPriceRef}
						>
							{currentProduct.price || 'N/A'}
						</p>
						<div className={styles['product-preview-tag']} ref={previewTagRef}>
							{currentProduct.tag || 'N/A'}
						</div>
					</div>
					<div className={styles['product-preview-img']}>
						<Image
							src={currentProduct.img || '/images/fallback.jpg'}
							alt={currentProduct.name || 'Product image'}
							width={400}
							height={400}
							sizes="(max-width: 768px) 60vw, 40vw"
							loading="eager"
							style={{ objectFit: 'cover' }}
						/>
					</div>
					<div className={styles['product-url']}>
						<div className={styles.btn}>
							<a ref={previewUrlRef} href={currentProduct.url || '#'}>
								View Details
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
