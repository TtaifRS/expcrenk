'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface UseImageLoaderReturn {
  isLoaded: boolean;
  progress: number;
  totalAssets: number;
  loadedAssets: number;
}

export function useImageLoader(): UseImageLoaderReturn {
  const [state, setState] = useState({
    progress: 0,
    totalAssets: 0,
    loadedAssets: 0,
  });
  
  const [isLoaded, setIsLoaded] = useState(false);
  const assetsRef = useRef<Set<string>>(new Set());
  const hasStarted = useRef(false);

  const updateProgress = useCallback((loadedCount: number, totalCount: number) => {
    const progress = Math.round((loadedCount / totalCount) * 100);
    setState({ progress, totalAssets: totalCount, loadedAssets: loadedCount });
    
    if (loadedCount === totalCount && totalCount > 0) {
      setTimeout(() => setIsLoaded(true), 300);
    }
  }, []);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const checkAndTrackAssets = () => {
      // Track regular images
      const images = Array.from(document.querySelectorAll('img'));
      
      // Track 3D assets that will be loaded
      const modelAssets = [
        '/models/blanket.glb',
        '/images/nakshi-1.png'
      ];
      
      const allAssets = [...images.map(img => img.src), ...modelAssets];
      const totalAssets = allAssets.length;
      
      if (totalAssets === 0) {
        updateProgress(1, 1);
        return;
      }

      setState(prev => ({ ...prev, totalAssets }));

      let loadedCount = 0;
      assetsRef.current.clear();

      // Track regular images
      images.forEach(img => {
        const src = img.src;
        if (assetsRef.current.has(src)) return;
        
        assetsRef.current.add(src);
        
        if (img.complete) {
          loadedCount++;
          updateProgress(loadedCount, totalAssets);
        } else {
          const onLoad = () => {
            loadedCount++;
            updateProgress(loadedCount, totalAssets);
            img.removeEventListener('load', onLoad);
            img.removeEventListener('error', onLoad);
          };
          
          img.addEventListener('load', onLoad);
          img.addEventListener('error', onLoad);
        }
      });

      // Track 3D model
      const trackModelLoad = () => {
        const modelUrl = '/models/blanket.glb';
        if (assetsRef.current.has(modelUrl)) return;
        
        assetsRef.current.add(modelUrl);
        
        // Use fetch to check if model exists
        fetch(modelUrl, { method: 'HEAD' })
          .then(() => {
            loadedCount++;
            updateProgress(loadedCount, totalAssets);
          })
          .catch(() => {
            // Even if it fails, count it as loaded to prevent infinite loading
            loadedCount++;
            updateProgress(loadedCount, totalAssets);
          });
      };

      // Track texture
      const trackTextureLoad = () => {
        const textureUrl = '/images/nakshi-1.png';
        if (assetsRef.current.has(textureUrl)) return;
        
        assetsRef.current.add(textureUrl);
        
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          updateProgress(loadedCount, totalAssets);
        };
        img.onerror = () => {
          loadedCount++;
          updateProgress(loadedCount, totalAssets);
        };
        img.src = textureUrl;
      };

      // Start tracking 3D assets
      trackModelLoad();
      trackTextureLoad();
    };

    // Wait a bit for DOM and Three.js to start loading
    const timer = setTimeout(checkAndTrackAssets, 500);
    
    // Fallback in case something goes wrong
    const fallback = setTimeout(() => {
      setIsLoaded(true);
    }, 8000); // 8 second timeout max

    return () => {
      clearTimeout(timer);
      clearTimeout(fallback);
    };
  }, [updateProgress]);

  return {
    isLoaded,
    progress: state.progress,
    totalAssets: state.totalAssets,
    loadedAssets: state.loadedAssets,
  };
}