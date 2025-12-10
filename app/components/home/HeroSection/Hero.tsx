'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { useLenis } from 'lenis/react'
import Lenis from 'lenis'
import styles from '../styles/Hero.module.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Marquee } from '@/components/marquee/Marquee'
import { useThrottledResize } from '@/hooks/useThrottledResize'

const modelUrl = '/models/blanket.glb'
const textureUrl = '/images/nakshi-1.png'

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

	// State to track mobile status
	const [isMobile, setIsMobile] = useState(false)

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

			// Update camera
			cameraRef.current.aspect = width / height
			cameraRef.current.updateProjectionMatrix()

			// Update renderer
			rendererRef.current.setSize(width, height)

			// Adjust camera position based on screen size
			if (modelGroupRef.current && maxDimRef.current > 0) {
				cameraRef.current.position.z =
					width > 900 ? maxDimRef.current * 0.6 : maxDimRef.current
			}
		},
		[]
	)

	// Use the custom resize hook
	useThrottledResize(handleResize, 200)

	useEffect(() => {
		if (!modelRef.current) return

		// Initialize Three.js scene
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

		// Optimize renderer for device
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

		// Conditional features for performance
		if (!initialIsMobile) {
			renderer.shadowMap.enabled = true
			renderer.shadowMap.type = THREE.PCFSoftShadowMap
		}

		renderer.toneMapping = THREE.ACESFilmicToneMapping
		renderer.toneMappingExposure = 1.2

		modelRef.current.appendChild(renderer.domElement)

		// Lighting setup (preserving all original lighting)
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

		// Animation variables
		const floatAmplitude = 0.2
		const floatSpeed = 1.5
		let isFloating = true

		// Setup Lenis for smooth scrolling
		let lenisInstance: Lenis | null = null
		if (typeof Lenis !== 'undefined') {
			lenisInstance = new Lenis()
			lenisInstance.on('scroll', ScrollTrigger.update)
			gsap.ticker.add((time) => lenisInstance?.raf(time * 1000))
			gsap.ticker.lagSmoothing(0)
		}
		ScrollTrigger.config({ ignoreMobileResize: true })

		// Optimized animation loop
		const animate = () => {
			if (modelGroupRef.current) {
				// Preserve floating animation
				if (isFloating) {
					const floatOffset =
						Math.sin(Date.now() * 0.001 * floatSpeed) * floatAmplitude
					modelGroupRef.current.position.y = floatOffset
				}

				// Preserve rotation based on scroll
				modelGroupRef.current.rotation.y =
					scrollProgressRef.current * Math.PI * 4 + 0.5
			}

			renderer.render(scene, camera)
			animationFrameRef.current = requestAnimationFrame(animate)
		}

		// Start animation
		animate()

		// Load model and texture
		const loader = new GLTFLoader()
		const textureLoader = new THREE.TextureLoader()

		loader.load(
			modelUrl,
			(gltf) => {
				const model = gltf.scene
				textureLoader.load(
					textureUrl,
					(texture: THREE.Texture) => {
						texture.flipY = false
						texture.colorSpace = THREE.SRGBColorSpace
						texture.wrapS = THREE.RepeatWrapping
						texture.wrapT = THREE.RepeatWrapping
						texture.repeat.set(1, 1)
						texture.minFilter = THREE.LinearMipmapLinearFilter
						texture.magFilter = THREE.LinearFilter
						texture.generateMipmaps = true
						texture.anisotropy = renderer.capabilities.getMaxAnisotropy()

						model.traverse((node: THREE.Object3D) => {
							if (node.type === 'Mesh') {
								const mesh = node as THREE.Mesh
								mesh.material = new THREE.MeshStandardMaterial({
									map: texture,
									metalness: 0,
									roughness: 0.8,
									emissive: new THREE.Color(0xf0e8d8),
									emissiveIntensity: 0.1,
									side: THREE.DoubleSide,
								})
								if (!initialIsMobile) {
									mesh.castShadow = true
									mesh.receiveShadow = true
								}
							}
						})

						const box = new THREE.Box3().setFromObject(model)
						const center = box.getCenter(new THREE.Vector3())
						model.position.sub(center)
						scene.add(model)
						modelGroupRef.current = model

						const size = box.getSize(new THREE.Vector3())
						maxDimRef.current = Math.max(size.x, size.y, size.z)

						// Update camera position based on model size
						handleResize(window.innerWidth, window.innerHeight, initialIsMobile)

						// Preserve entrance animation
						model.scale.set(0, 0, 0)
						model.rotation.set(Math.PI / 2, Math.PI + 0.5, 0)

						gsap.to(model.scale, {
							x: 1,
							y: 1,
							z: 1,
							duration: 1,
							ease: 'power2.out',
						})
					},
					undefined,
					(err: unknown) => console.error('Failed to load texture:', err)
				)
			},
			undefined,
			(err: unknown) => console.error('Failed to load model:', err)
		)

		// Handle page visibility changes
		const handleVisibilityChange = () => {
			isFloating = !document.hidden
		}
		document.addEventListener('visibilitychange', handleVisibilityChange)

		return () => {
			// Cleanup
			document.removeEventListener('visibilitychange', handleVisibilityChange)

			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current)
			}

			if (rendererRef.current) {
				rendererRef.current.dispose()
				if (modelRef.current && rendererRef.current.domElement) {
					modelRef.current.removeChild(rendererRef.current.domElement)
				}
			}

			// Clean up Three.js resources
			if (sceneRef.current) {
				sceneRef.current.traverse((object: THREE.Object3D) => {
					if (object.type === 'Mesh') {
						const mesh = object as THREE.Mesh
						mesh.geometry.dispose()
						const material = mesh.material
						if (Array.isArray(material)) {
							material.forEach((mat) => {
								if ('map' in mat && mat.map) {
									;(mat.map as THREE.Texture).dispose()
								}
								mat.dispose()
							})
						} else {
							if ('map' in material && material.map) {
								;(material.map as THREE.Texture).dispose()
							}
							material.dispose()
						}
					}
				})
			}

			if (lenisInstance) {
				lenisInstance.destroy()
			}
			gsap.ticker.remove((time) => lenisInstance?.raf(time * 1000))
		}
	}, [handleResize])

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
			<div ref={modelRef} className={styles.model}></div>

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
