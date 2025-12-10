// hooks/useThrottledResize.ts
import { useEffect, useRef, useCallback } from 'react'

export interface ResizeCallback {
  (width: number, height: number, isMobile: boolean): void
}

export const useThrottledResize = (
  callback: ResizeCallback,
  throttleMs: number = 250
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef<ResizeCallback>(callback)
  
  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const handleResize = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isMobile = width < 768
      callbackRef.current(width, height, isMobile)
    }, throttleMs)
  }, [throttleMs])

  useEffect(() => {
    // Initial call
    const width = window.innerWidth
    const height = window.innerHeight
    const isMobile = width < 768
    callbackRef.current(width, height, isMobile)

    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [handleResize])
}