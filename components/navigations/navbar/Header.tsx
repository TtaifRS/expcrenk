'use client'

import gsap from 'gsap'
import { useRef, useState } from 'react'
import styles from './styles/header.module.css'
import Nav from './Nav'

export default function Header() {
	const [isActive, setIsActive] = useState(false)
	const burger = useRef<HTMLDivElement>(null)
	const menuLabel = useRef<HTMLSpanElement>(null)
	const closeLabel = useRef<HTMLSpanElement>(null)
	const shopContainer = useRef<HTMLDivElement>(null)
	const background = useRef<HTMLDivElement>(null)

	const toggleMenu = () => {
		const willOpen = !isActive
		setIsActive(willOpen)

		burger.current?.classList.toggle(styles.burgerActive, willOpen)

		gsap.to(menuLabel.current, { opacity: willOpen ? 0 : 1, duration: 0.2 })
		gsap.to(closeLabel.current, { opacity: willOpen ? 1 : 0, duration: 0.2 })

		gsap.to(shopContainer.current, {
			opacity: willOpen ? 0 : 1,
			x: willOpen ? 30 : 0,
			duration: 0.4,
			ease: 'power2.out',
		})

		gsap.to(background.current, {
			scale: willOpen ? 1 : 0,
			opacity: willOpen ? 1 : 0,
			duration: 0.6,
			ease: 'power3.inOut',
		})

		// No longer need the custom event
		// document.dispatchEvent(new CustomEvent('navToggle', { detail: willOpen }))
	}

	return (
		<>
			<header className={styles.header}>
				<div className={styles.bar}>
					<a href="/">Nokhshi Kabbo</a>

					{/* This is the EXACT structure from the original blog */}
					<div onClick={toggleMenu} className={styles.el}>
						<div ref={burger} className={styles.burger} />
						<div className={styles.label}>
							<span ref={menuLabel}>Menu</span>
							<span
								ref={closeLabel}
								style={{
									opacity: 0,
									position: 'absolute',
									inset: 0,
									display: 'flex',
									alignItems: 'center',
								}}
							>
								Close
							</span>
						</div>
					</div>

					{/* Shop + Cart — now correctly positioned inside .bar */}
					<div ref={shopContainer} className={styles.shopContainer}>
						<p className={styles.shop}>Shop</p>
						<div className={styles.el}>
							<svg width="19" height="20" viewBox="0 0 19 20">
								<path
									d="M2.5 3.5H16.5L15 12.5H4L2.5 3.5Z"
									stroke="currentColor"
									strokeWidth="1.5"
									fill="none"
								/>
							</svg>
							<p>Cart(0)</p>
						</div>
					</div>
				</div>
			</header>

			{/* Pass isActive as isOpen prop to Nav */}
			<Nav isOpen={isActive} />

			<div
				ref={background}
				className={styles.background}
				style={{ transform: 'scale(0)', opacity: 0 }}
			/>
		</>
	)
}
