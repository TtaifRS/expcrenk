import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import ClientProviders from './components/ClientProviders'
import Header from '@/components/navigations/navbar/Header'

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
			<body className={inter.className}>
				<ClientProviders>
					<Header />
					{children}
				</ClientProviders>
			</body>
		</html>
	)
}
