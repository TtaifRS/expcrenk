'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { useLenis } from 'lenis/react'
import Lenis from 'lenis'
import styles from '../styles/Hero.module.css'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Marquee } from '@/components/marquee/Marquee'
import { useThrottledResize } from '@/hooks/useThrottledResize'
import { usePreloadAssets } from '@/hooks/usePreloadAssets'

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)
}

export default function Hero() {
	const modelRef = useRef<HTMLDivElement>(null)
	const outroRef = useRef<HTMLDivElement>(null)
	const outroTitleRef = useRef<HTMLParagraphElement>(null)
	const modelGroupRef = useRef<THREE.Group | null>(null)
	const scrollProgressRef = useRef<number>(0)
	const maxDimRef = useRef<number>(0)

	// Refs for Three.js objects
	const sceneRef = useRef<THREE.Scene | null>(null)
	const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
	const animationFrameRef = useRef<number | null>(null)

	// Use preloaded assets
	const {
		model: preloadedModel,
		texture: preloadedTexture,
		isLoaded: assetsLoaded,
	} = usePreloadAssets()

	// State to track mobile status
	const [isMobile, setIsMobile] = useState(false)
	const [isThreeJsReady, setIsThreeJsReady] = useState(false)
	const [showThreeJs, setShowThreeJs] = useState(false)

	useLenis((lenis: Lenis) => {
		scrollProgressRef.current =
			lenis.scroll /
			(document.documentElement.scrollHeight - window.innerHeight)
	})

	// Handle resize with custom hook
	const handleResize = useCallback(
		(width: number, height: number, mobile: boolean) => {
			setIsMobile(mobile)

			if (!cameraRef.current || !rendererRef.current) return

			cameraRef.current.aspect = width / height
			cameraRef.current.updateProjectionMatrix()
			rendererRef.current.setSize(width, height)

			if (modelGroupRef.current && maxDimRef.current > 0) {
				cameraRef.current.position.z =
					width > 900 ? maxDimRef.current * 0.6 : maxDimRef.current
			}
		},
		[]
	)

	// Use the custom resize hook
	useThrottledResize(handleResize, 200)

	// Initialize Three.js once assets are loaded
	useEffect(() => {
		if (!assetsLoaded || !preloadedModel || !modelRef.current) return

		console.log('Initializing Three.js...')

		// Initialize scene
		const scene = new THREE.Scene()
		sceneRef.current = scene

		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		)
		camera.position.z = 5
		cameraRef.current = camera

		// Optimize renderer
		const initialIsMobile = window.innerWidth < 768
		setIsMobile(initialIsMobile)

		const renderer = new THREE.WebGLRenderer({
			antialias: !initialIsMobile,
			alpha: true,
			powerPreference: 'high-performance',
		})
		rendererRef.current = renderer

		renderer.setClearColor(0x000000, 0)
		renderer.setSize(window.innerWidth, window.innerHeight)
		renderer.setPixelRatio(
			initialIsMobile
				? Math.min(window.devicePixelRatio, 1)
				: window.devicePixelRatio
		)

		// Configure texture if available
		if (preloadedTexture && rendererRef.current) {
			preloadedTexture.anisotropy = renderer.capabilities.getMaxAnisotropy()
		}

		// Performance settings
		if (!initialIsMobile) {
			renderer.shadowMap.enabled = true
			renderer.shadowMap.type = THREE.PCFSoftShadowMap
		}

		renderer.toneMapping = THREE.ACESFilmicToneMapping
		renderer.toneMappingExposure = 1.2

		// Clear and add canvas
		if (modelRef.current) {
			modelRef.current.innerHTML = ''
			modelRef.current.appendChild(renderer.domElement)
		}

		// Lighting setup
		const ambientLight = new THREE.AmbientLight(0xffffff, 1.0)
		scene.add(ambientLight)

		const mainLight = new THREE.DirectionalLight(0xffffff, 0.5)
		mainLight.position.set(0.5, 7.5, 2.5)
		if (!initialIsMobile) {
			mainLight.castShadow = true
		}
		scene.add(mainLight)

		const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
		fillLight.position.set(-15, 0, -5)
		scene.add(fillLight)

		const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbbbbbb, 0.8)
		hemiLight.position.set(0, 0, 0)
		scene.add(hemiLight)

		// Clone model and apply texture
		const model = preloadedModel.clone()

		// Apply texture properly
		model.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				const mesh = child as THREE.Mesh

				// Check if texture is available
				if (preloadedTexture && preloadedTexture.image) {
					console.log('Applying texture to mesh')

					// Ensure texture is ready
					if (preloadedTexture.image.complete) {
						preloadedTexture.needsUpdate = true

						mesh.material = new THREE.MeshStandardMaterial({
							map: preloadedTexture,
							metalness: 0,
							roughness: 0.8,
							emissive: new THREE.Color(0xf0e8d8),
							emissiveIntensity: 0.1,
							side: THREE.DoubleSide,
						})

						mesh.material.needsUpdate = true
					} else {
						// Texture not ready, use fallback
						console.log('Texture not ready, using fallback')
						mesh.material = new THREE.MeshStandardMaterial({
							color: 0xf0e8d8,
							metalness: 0,
							roughness: 0.8,
							side: THREE.DoubleSide,
						})
					}
				} else {
					// No texture, use colored material
					console.log('No texture available, using colored material')
					mesh.material = new THREE.MeshStandardMaterial({
						color: 0xf0e8d8,
						metalness: 0,
						roughness: 0.8,
						side: THREE.DoubleSide,
					})
				}

				mesh.castShadow = !initialIsMobile
				mesh.receiveShadow = !initialIsMobile
			}
		})

		// Center model
		const box = new THREE.Box3().setFromObject(model)
		const center = box.getCenter(new THREE.Vector3())
		model.position.sub(center)

		const size = box.getSize(new THREE.Vector3())
		maxDimRef.current = Math.max(size.x, size.y, size.z)

		scene.add(model)
		modelGroupRef.current = model

		// Initial animation state
		model.scale.set(0, 0, 0)
		model.rotation.set(Math.PI / 2, Math.PI + 0.5, 0)

		// Camera positioning
		handleResize(window.innerWidth, window.innerHeight, initialIsMobile)

		// Setup Lenis
		let lenisInstance: Lenis | null = null
		if (typeof Lenis !== 'undefined') {
			lenisInstance = new Lenis()
			lenisInstance.on('scroll', ScrollTrigger.update)
			gsap.ticker.add((time) => lenisInstance?.raf(time * 1000))
			gsap.ticker.lagSmoothing(0)
		}
		ScrollTrigger.config({ ignoreMobileResize: true })

		// Entrance animation
		gsap.to(model.scale, {
			x: 1,
			y: 1,
			z: 1,
			duration: 1.5,
			ease: 'power3.out',
			onComplete: () => {
				console.log('Three.js ready')
				setIsThreeJsReady(true)
				setShowThreeJs(true)
			},
		})

		// Animation variables
		const floatAmplitude = 0.2
		const floatSpeed = 1.5
		let isFloating = true

		// Animation loop
		const animate = () => {
			if (modelGroupRef.current) {
				// Floating animation
				if (isFloating) {
					const floatOffset =
						Math.sin(Date.now() * 0.001 * floatSpeed) * floatAmplitude
					modelGroupRef.current.position.y = floatOffset
				}

				// Scroll-based rotation
				modelGroupRef.current.rotation.y =
					scrollProgressRef.current * Math.PI * 4 + 0.5
			}

			renderer.render(scene, camera)
			animationFrameRef.current = requestAnimationFrame(animate)
		}

		animate()

		// Cleanup
		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current)
			}

			if (rendererRef.current) {
				rendererRef.current.dispose()
				if (modelRef.current && rendererRef.current.domElement) {
					modelRef.current.removeChild(rendererRef.current.domElement)
				}
			}

			if (sceneRef.current) {
				sceneRef.current.traverse((object) => {
					if (object instanceof THREE.Mesh) {
						const mesh = object
						mesh.geometry.dispose()
						if (mesh.material) {
							if (Array.isArray(mesh.material)) {
								mesh.material.forEach((mat) => mat.dispose())
							} else {
								mesh.material.dispose()
							}
						}
					}
				})
			}

			if (lenisInstance) {
				lenisInstance.destroy()
			}

			setIsThreeJsReady(false)
			setShowThreeJs(false)
		}
	}, [assetsLoaded, preloadedModel, preloadedTexture, handleResize])

	// GSAP animations (keep your existing code)
	useGSAP(
		() => {
			const outroTitle = outroTitleRef.current
			if (!outroTitle || !outroRef.current) return

			const splitText = new SplitText(outroTitle, {
				type: 'lines',
				linesClass: 'line',
			})

			splitText.lines.forEach((line: Element) => {
				const text = line.innerHTML
				line.innerHTML = `<span style="display: block;">${text}</span>`
			})

			gsap.set(outroTitle.querySelectorAll('.line span'), {
				y: 70,
				force3D: true,
			})

			setTimeout(() => {
				ScrollTrigger.refresh()
			}, 100)

			ScrollTrigger.create({
				trigger: outroRef.current,
				start: 'top 80%',
				end: 'bottom 20%',
				onEnter: () => {
					gsap.to(outroTitle.querySelectorAll('.line span'), {
						y: 0,
						duration: 1,
						stagger: 0.1,
						ease: 'power3.out',
						force3D: true,
					})
				},
				onLeaveBack: () => {
					gsap.to(outroTitle.querySelectorAll('.line span'), {
						y: 70,
						duration: 1,
						stagger: 0.1,
						ease: 'power3.out',
						force3D: true,
					})
				},
				toggleActions: 'play reverse play reverse',
			})

			return () => {
				if (splitText.revert) {
					splitText.revert()
				}
				ScrollTrigger.getAll().forEach((trigger) => {
					if (trigger.trigger === outroRef.current) {
						trigger.kill()
					}
				})
			}
		},
		{ scope: outroRef }
	)

	return (
		<div className={styles.heroWrapper}>
			{/* Three.js Canvas Container - Completely hidden until ready */}
			<div
				ref={modelRef}
				className={styles.model}
				style={{
					opacity: showThreeJs ? 1 : 0,
					pointerEvents: showThreeJs ? 'auto' : 'none',
				}}
			/>

			<section className={styles.intro}>
				<div className={styles['header-row']}>
					<p className={styles.phrase}>Stories in</p>
				</div>
				<div className={styles['header-row']}>
					<p className={styles.phrase}>Stitch</p>
					<p className={styles.description}>
						Timeless Nakshi Kantha quilts handcrafted by artisans in rural
						Bangladesh. Sustainable, bespoke textile art blending tradition and
						functionality for modern homes.
					</p>
				</div>
				<div className={styles['header-row']}>
					<p className={styles.phrase}>Living Here</p>
				</div>
			</section>

			<section ref={outroRef} className={styles.outro}>
				<div className={styles['outro-copy']}>
					<p ref={outroTitleRef} className={styles.outroTitle}>
						We are a Bangladeshi artisan collective specializing in Nakshi
						Kantha embroidery, preserving centuries-old quilting traditions
						through bespoke textiles, installations, and immersive storytelling
						experiences.
					</p>
				</div>

				<p className={styles.contactRow}>
					Contact
					<span className={styles.emailSpan}>hello@nokshikabbo.com</span>
				</p>
				<Marquee
					className={styles.fullWidthMarquee}
					promoCode="Discount20"
					discountAmount="200 Taka"
					minOrder="2000 taka"
				/>
			</section>
		</div>
	)
}
