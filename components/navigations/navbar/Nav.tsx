'use client'

import { useEffect, useRef } from 'react'
import styles from './styles/nav.module.css'
import gsap from 'gsap'
import Body from './Body'
import ImageComp from './ImageComp'

const links = [
	{ title: 'Home', img: 'home.png' },
	{ title: 'Nakshi Katha', img: 'nakshi_katha.png' },
	{ title: 'Nakshi Chador', img: 'nakshi_chador.png' },
	{ title: 'About Us', img: 'about_us.png' },
	{ title: 'Contact', img: 'contact_us.png' },
]

export default function Nav({ isOpen }: { isOpen: boolean }) {
	const nav = useRef<HTMLDivElement>(null)

	useEffect(() => {
		// This controls the nav height animation
		gsap.to(nav.current, {
			height: isOpen ? '100vh' : 0,
			duration: 1,
			ease: 'power4.inOut',
		})
	}, [isOpen]) // Run when isOpen changes

	return (
		<div ref={nav} className={styles.nav}>
			<div className={styles.wrapper}>
				{/* Pass isOpen to Body to control when to animate */}
				<Body links={links} isOpen={isOpen} />
				<ImageComp links={links} />
			</div>
		</div>
	)
}
