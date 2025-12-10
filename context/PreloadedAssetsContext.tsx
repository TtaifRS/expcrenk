// context/PreloadedAssetsContext.tsx
'use client'

import { createContext, useContext, ReactNode } from 'react'
import * as THREE from 'three'

interface PreloadedAssets {
	model: THREE.Group | null
	texture: THREE.Texture | null
	isLoaded: boolean
	progress: number
}

const PreloadedAssetsContext = createContext<PreloadedAssets | null>(null)

export function PreloadedAssetsProvider({
	children,
	model,
	texture,
	isLoaded,
	progress,
}: PreloadedAssets & { children: ReactNode }) {
	return (
		<PreloadedAssetsContext.Provider
			value={{ model, texture, isLoaded, progress }}
		>
			{children}
		</PreloadedAssetsContext.Provider>
	)
}

export const usePreloadedAssets = () => {
	const context = useContext(PreloadedAssetsContext)
	if (!context) {
		throw new Error(
			'usePreloadedAssets must be used within PreloadedAssetsProvider'
		)
	}
	return context
}
