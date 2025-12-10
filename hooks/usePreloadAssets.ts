// hooks/usePreloadAssets.ts
'use client';

import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function usePreloadAssets() {
  const [state, setState] = useState({
    model: null as THREE.Group | null,
    texture: null as THREE.Texture | null,
    isLoaded: false,
    progress: 0,
  });

  useEffect(() => {
    const images = [
      '/images/product-gallery/nakshi-1.png',
      '/images/product-gallery/nakshi-2.png',
      '/images/product-gallery/nakshi-3.png',
      '/images/product-gallery/nakshi-4.png',
      '/images/product-gallery/nakshi-5.png',
      '/images/nakshi-1.png',
      '/images/nakshi-2.png',
      '/images/nakshi-3.png',
      '/images/nakshi-4.png',
    ];

    const totalAssets = 2 + images.length; // model + texture + images
    let loadedAssets = 0;

    const markLoaded = () => {
      loadedAssets++;
      setState(s => ({ ...s, progress: Math.round((loadedAssets / totalAssets) * 100) }));
      if (loadedAssets === totalAssets) {
        setTimeout(() => setState(s => ({ ...s, isLoaded: true })), 500);
      }
    };

    // OLD WORKING METHOD — THIS IS THE WINNER
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/images/nakshi-1.png',
      (tex) => {
        console.log('TEXTURE LOADED — OLD WORKING METHOD');

        tex.flipY = false;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        tex.anisotropy = 16;
        tex.needsUpdate = true;

        setState(s => ({ ...s, texture: tex }));
        markLoaded();
      },
      undefined,
      () => {
        console.error('FAILED TO LOAD TEXTURE');
        markLoaded();
      }
    );

    // Load model
    new GLTFLoader().load(
      '/models/blanket.glb',
      (gltf) => {
        console.log('MODEL LOADED');
        setState(s => ({ ...s, model: gltf.scene }));
        markLoaded();
      },
      undefined,
      () => markLoaded()
    );

    // Load other images (for progress bar only)
    images.forEach(src => {
      const img = new Image();
      img.onload = img.onerror = () => markLoaded();
      img.src = src;
    });
  }, []);

  return state;
}