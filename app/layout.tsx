import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import LayoutClientWrapper from './layoutClientWrapper'

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
})

const playfair = Playfair_Display({
	subsets: ['latin'],
	variable: '--font-playfair',
})

export const metadata: Metadata = {
	title: 'Nokshi Kabbo - Nakshi Kantha Quilts',
	description: 'Handcrafted Nakshi Kantha quilts from Bangladesh artisans.',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en" className={`${inter.variable} ${playfair.variable}`}>
			<head>
				{/* Preload critical assets for faster loading */}
				<link rel="preload" href="/images/hero.jpg" as="image" />
				<link rel="preconnect" href="https://images.unsplash.com" />
			</head>
			<body className={inter.className}>
				<LayoutClientWrapper>{children}</LayoutClientWrapper>
			</body>
		</html>
	)
}
