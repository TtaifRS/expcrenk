// components/Hero.tsx
'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useLenis } from 'lenis/react'
import styles from '../styles/Hero.module.css'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Marquee } from '@/components/marquee/Marquee'
import { useThrottledResize } from '@/hooks/useThrottledResize'
import { usePreloadedAssets } from '@/context/PreloadedAssetsContext'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText)

export default function Hero() {
	const modelRef = useRef<HTMLDivElement>(null)
	const outroRef = useRef<HTMLDivElement>(null)
	const outroTitleRef = useRef<HTMLParagraphElement>(null)
	const modelGroupRef = useRef<THREE.Group | null>(null)
	const scrollProgressRef = useRef<number>(0)
	const maxDimRef = useRef<number>(0)
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
	const animationFrameRef = useRef<number | null>(null)

	const { model: preloadedModel, texture: preloadedTexture } =
		usePreloadedAssets()
	const [showThreeJs, setShowThreeJs] = useState(false)

	useLenis(({ scroll, limit }) => {
		scrollProgressRef.current = limit > 0 ? scroll / limit : 0
	})

	const handleResize = useCallback((w: number, h: number) => {
		if (!rendererRef.current) return
		rendererRef.current.setSize(w, h)
	}, [])

	useThrottledResize(handleResize, 100)

	useEffect(() => {
		if (!preloadedModel || !preloadedTexture || !modelRef.current) return

		const scene = new THREE.Scene()
		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		)
		const isMobile = window.innerWidth < 768

		const renderer = new THREE.WebGLRenderer({
			antialias: !isMobile,
			alpha: true,
			powerPreference: 'high-performance',
		})
		renderer.setPixelRatio(
			isMobile
				? Math.min(window.devicePixelRatio, 1.5)
				: window.devicePixelRatio
		)
		renderer.setSize(window.innerWidth, window.innerHeight)
		renderer.setClearColor(0x000000, 0)
		renderer.toneMapping = THREE.ACESFilmicToneMapping
		renderer.toneMappingExposure = 1.2
		rendererRef.current = renderer

		modelRef.current.innerHTML = ''
		modelRef.current.appendChild(renderer.domElement)

		scene.add(new THREE.AmbientLight(0xffffff, 1.2))
		const light = new THREE.DirectionalLight(0xffffff, 2)
		light.position.set(5, 10, 7.5)
		scene.add(light)

		const model = preloadedModel.clone()

		model.traverse((child) => {
			if ((child as THREE.Mesh).isMesh) {
				const mesh = child as THREE.Mesh

				console.log('APPLYING TEXTURE TO MESH:', mesh.name || 'unnamed')

				// DO NOT DISPOSE OLD MATERIAL — THIS BREAKS THE MESH
				// Just create a new one and assign
				mesh.material = new THREE.MeshStandardMaterial({
					map: preloadedTexture,
					metalness: 0,
					roughness: 0.8,
					emissive: new THREE.Color(0xf0e8d8),
					emissiveIntensity: 0.1,
					side: THREE.DoubleSide,
				})

				// Force texture update
				if (preloadedTexture) {
					const stdMaterial = mesh.material as THREE.MeshStandardMaterial
					stdMaterial.map = preloadedTexture
					stdMaterial.map.anisotropy = 16
					stdMaterial.map.needsUpdate = true
				}

				mesh.material.needsUpdate = true
			}
		})
		const box = new THREE.Box3().setFromObject(model)
		model.position.sub(box.getCenter(new THREE.Vector3()))
		maxDimRef.current = Math.max(...box.getSize(new THREE.Vector3()).toArray())

		scene.add(model)
		modelGroupRef.current = model
		model.scale.set(0.001, 0.001, 0.001)
		model.rotation.set(Math.PI / 2, Math.PI + 0.5, 0)
		camera.position.z = isMobile ? maxDimRef.current : maxDimRef.current * 0.6

		gsap.to(model.scale, {
			x: 1,
			y: 1,
			z: 1,
			duration: 2,
			ease: 'power3.out',
			delay: 0.6,
			onComplete: () => setShowThreeJs(true),
		})

		const animate = () => {
			if (modelGroupRef.current) {
				modelGroupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.15
				modelGroupRef.current.rotation.y =
					scrollProgressRef.current * Math.PI * 4 + 0.5
			}
			renderer.render(scene, camera)
			animationFrameRef.current = requestAnimationFrame(animate)
		}
		animate()

		return () => {
			if (animationFrameRef.current)
				cancelAnimationFrame(animationFrameRef.current)
			renderer.dispose()
			scene.clear()
			modelRef.current?.removeChild(renderer.domElement)
		}
	}, [preloadedModel, preloadedTexture])

	useGSAP(
		() => {
			if (!outroTitleRef.current) return
			const split = new SplitText(outroTitleRef.current, { type: 'lines' })
			gsap.set(split.lines, { y: 120, opacity: 0 })
			ScrollTrigger.create({
				trigger: outroRef.current,
				start: 'top 70%',
				onEnter: () =>
					gsap.to(split.lines, {
						y: 0,
						opacity: 1,
						duration: 1.2,
						stagger: 0.15,
						ease: 'power3.out',
					}),
				onLeaveBack: () => gsap.set(split.lines, { y: 120, opacity: 0 }),
			})
			return () => split.revert()
		},
		{ scope: outroRef }
	)

	return (
		<div className={styles.heroWrapper}>
			<div
				ref={modelRef}
				className={styles.model}
				style={{
					opacity: showThreeJs ? 1 : 0,
					transition: 'opacity 1.4s ease',
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
					Contact{' '}
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
