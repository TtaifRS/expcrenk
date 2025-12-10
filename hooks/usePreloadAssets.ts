'use client';

import { useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface UsePreloadAssetsReturn {
  model: THREE.Group | null;
  texture: THREE.Texture | null;
  isLoaded: boolean;
  progress: number;
  error?: string;
}

export function usePreloadAssets(): UsePreloadAssetsReturn {
  const [state, setState] = useState<UsePreloadAssetsReturn>({
    model: null,
    texture: null,
    isLoaded: false,
    progress: 0,
  });

  const loadAssets = useCallback(async () => {
    const modelUrl = '/models/blanket.glb';
    const textureUrl = '/images/nakshi-1.png';
    
    let model: THREE.Group | null = null;
    let texture: THREE.Texture | null = null;
    let loadedCount = 0;
    const totalAssets = 2;

    const updateProgress = (assetType: string, success: boolean = true) => {
      loadedCount++;
      const progress = Math.round((loadedCount / totalAssets) * 100);
      
      setState(prev => ({ 
        ...prev, 
        progress,
      }));
      
      if (loadedCount === totalAssets) {
        // Give extra time for texture to fully process
        setTimeout(() => {
          setState(prev => ({ 
            ...prev, 
            model,
            texture,
            isLoaded: true 
          }));
        }, 500);
      }
    };

    try {
      // Load texture with proper configuration
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        textureUrl,
        (loadedTexture) => {
          console.log('Texture loaded successfully');
          
          // CRITICAL: Configure texture for Three.js
          loadedTexture.flipY = false;
          loadedTexture.colorSpace = THREE.SRGBColorSpace;
          loadedTexture.wrapS = THREE.RepeatWrapping;
          loadedTexture.wrapT = THREE.RepeatWrapping;
          loadedTexture.repeat.set(1, 1);
          loadedTexture.minFilter = THREE.LinearMipmapLinearFilter;
          loadedTexture.magFilter = THREE.LinearFilter;
          loadedTexture.generateMipmaps = true;
          loadedTexture.needsUpdate = true;
          
          texture = loadedTexture;
          updateProgress('texture', true);
        },
        undefined,
        (error) => {
          console.error('Failed to load texture:', error);
          // Create a simple colored texture as fallback
          const canvas = document.createElement('canvas');
          canvas.width = 1024;
          canvas.height = 1024;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#f0e8d8';
            ctx.fillRect(0, 0, 1024, 1024);
            texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
          }
          updateProgress('texture', false);
        }
      );

      // Load model
      const loader = new GLTFLoader();
      loader.load(
        modelUrl,
        (gltf) => {
          console.log('Model loaded successfully');
          model = gltf.scene;
          
          // Apply a default material immediately to prevent black model
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              // Create a basic material to avoid black model
              child.material = new THREE.MeshStandardMaterial({
                color: 0xf0e8d8,
                metalness: 0,
                roughness: 0.8,
                side: THREE.DoubleSide,
              });
            }
          });
          
          updateProgress('model', true);
        },
        undefined,
        (error) => {
          console.error('Failed to load model:', error);
          updateProgress('model', false);
        }
      );
    } catch (error) {
      console.error('Failed to preload 3D assets:', error);
      setState(prev => ({ 
        ...prev, 
        isLoaded: true,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  return state;
}