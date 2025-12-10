'use client'

import { useEffect } from 'react'
import Image, { ImageProps } from 'next/image'
import { useLoading } from '@/context/LoadingContext'

interface ImageWithLoaderProps extends Omit<ImageProps, 'onLoad'> {
	assetId?: string
}

export default function ImageWithLoader({
	src,
	alt,
	assetId,
	...props
}: ImageWithLoaderProps) {
	const { markAssetLoaded, registerAsset } = useLoading()

	// Generate asset ID if not provided
	const imageAssetId =
		assetId || `image:${typeof src === 'string' ? src : 'unknown'}`

	useEffect(() => {
		registerAsset(imageAssetId)
	}, [imageAssetId, registerAsset])

	const handleLoad = () => {
		markAssetLoaded(imageAssetId)
	}

	return (
		<Image
			src={src}
			alt={alt}
			onLoad={handleLoad}
			onError={handleLoad}
			{...props}
		/>
	)
}
