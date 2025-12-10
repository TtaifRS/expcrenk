'use client'

import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
	useCallback,
	useRef,
} from 'react'

interface LoadingContextType {
	isLoading: boolean
	progress: number
	markAssetLoaded: (assetId: string) => void
	registerAsset: (assetId: string) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
	const [isLoading, setIsLoading] = useState(true)
	const [progress, setProgress] = useState(0)

	// Use refs instead of state for assets to avoid re-renders
	const registeredAssets = useRef<Set<string>>(new Set())
	const loadedAssets = useRef<Set<string>>(new Set())

	const [minTimeElapsed, setMinTimeElapsed] = useState(false)
	const hasTriggeredCompletion = useRef(false)

	// Minimum loading time of 2.5 seconds
	useEffect(() => {
		const timer = setTimeout(() => {
			setMinTimeElapsed(true)
		}, 2500)
		return () => clearTimeout(timer)
	}, [])

	// Register an asset to track - STABLE FUNCTION
	const registerAsset = useCallback((assetId: string) => {
		// Only add if not already registered
		if (!registeredAssets.current.has(assetId)) {
			registeredAssets.current.add(assetId)
			console.log('Registered asset:', assetId)

			// Update progress immediately
			updateProgress()
		}
	}, [])

	// Mark an asset as loaded - STABLE FUNCTION
	const markAssetLoaded = useCallback((assetId: string) => {
		// Only mark if not already loaded
		if (!loadedAssets.current.has(assetId)) {
			loadedAssets.current.add(assetId)
			console.log('Asset loaded:', assetId)

			// Update progress immediately
			updateProgress()
		}
	}, [])

	// Update progress based on current state
	const updateProgress = useCallback(() => {
		const total = registeredAssets.current.size || 1 // Avoid division by zero
		const loaded = loadedAssets.current.size
		const newProgress = Math.round((loaded / total) * 100)
		console.log(`Progress: ${loaded}/${total} = ${newProgress}%`)
		setProgress(newProgress)
	}, [])

	// Check if we should stop loading
	const checkCompletion = useCallback(() => {
		if (hasTriggeredCompletion.current) return

		const allLoaded =
			loadedAssets.current.size > 0 &&
			loadedAssets.current.size === registeredAssets.current.size

		if (allLoaded && minTimeElapsed) {
			hasTriggeredCompletion.current = true
			console.log('All assets loaded, hiding loading screen')
			setTimeout(() => {
				setIsLoading(false)
			}, 500)
		}
	}, [minTimeElapsed])

	// Run completion check when progress changes or min time elapses
	useEffect(() => {
		checkCompletion()
	}, [progress, minTimeElapsed, checkCompletion])

	// Fallback timeout - always hide after 8 seconds
	useEffect(() => {
		const timer = setTimeout(() => {
			if (isLoading) {
				console.log('Fallback timeout reached, forcing loading to complete')
				setIsLoading(false)
			}
		}, 8000)

		return () => clearTimeout(timer)
	}, [isLoading])

	return (
		<LoadingContext.Provider
			value={{
				isLoading,
				progress,
				markAssetLoaded,
				registerAsset,
			}}
		>
			{children}
		</LoadingContext.Provider>
	)
}

export const useLoading = () => {
	const context = useContext(LoadingContext)
	if (!context) {
		throw new Error('useLoading must be used within LoadingProvider')
	}
	return context
}
