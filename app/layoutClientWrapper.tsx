'use client'

import { usePreloadAssets } from '@/hooks/usePreloadAssets'
import { PreloadedAssetsProvider } from '@/context/PreloadedAssetsContext'
import LoadingScreen from '@/components/loadingScreen/LoadingScreen'
import Header from '@/components/navigations/navbar/Header'
import ClientProviders from './components/ClientProviders'
import { useEffect } from 'react'

export default function LayoutClientWrapper({
	children,
}: {
	children: React.ReactNode
}) {
	const assets = usePreloadAssets() // ← THIS LINE MUST BE HERE

	useEffect(() => {
		document.body.classList.toggle('loaded', assets.isLoaded)
		document.documentElement.classList.toggle('no-scroll', !assets.isLoaded)
	}, [assets.isLoaded])

	return (
		<ClientProviders>
			{!assets.isLoaded && <LoadingScreen progress={assets.progress} />}

			<PreloadedAssetsProvider
				model={assets.model}
				texture={assets.texture}
				isLoaded={assets.isLoaded}
				progress={assets.progress}
			>
				<Header />
				{children}
			</PreloadedAssetsProvider>
		</ClientProviders>
	)
}
