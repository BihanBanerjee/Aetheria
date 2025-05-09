"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create particles container
    const particlesContainer = document.createElement("div");
    particlesContainer.id = "particles-container";
    particlesContainer.style.position = "absolute";
    particlesContainer.style.top = "0";
    particlesContainer.style.left = "0";
    particlesContainer.style.width = "100%";
    particlesContainer.style.height = "100%";
    particlesContainer.style.overflow = "hidden";
    particlesContainer.style.zIndex = "-1";
    document.body.appendChild(particlesContainer);

    // Create particles
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.classList.add("particle");
      
      // Random size
      const size = Math.random() * 6 + 2;
      particle.style.position = "absolute";
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.borderRadius = "50%";
      particle.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
      particle.style.pointerEvents = "none";
      
      // Random position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      
      // Animation
      particle.style.animation = `float 15s linear infinite`;
      particle.style.animationDelay = `${Math.random() * 15}s`;
      
      particlesContainer.appendChild(particle);
    }

    // Create THREE.js background if canvasRef is available
    if (canvasRef.current) {
      // Initialize THREE.js
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      
      const renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      canvasRef.current.appendChild(renderer.domElement);
      
      // Create particles
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 1000;
      
      const posArray = new Float32Array(particlesCount * 3);
      
      for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.01,
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
      });
      
      const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particlesMesh);
      
      camera.position.z = 3;
      
      // Animation loop
      function animate() {
        requestAnimationFrame(animate);
        particlesMesh.rotation.x += 0.0002;
        particlesMesh.rotation.y += 0.0002;
        renderer.render(scene, camera);
      }
      
      animate();
      
      // Handle window resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      
      window.addEventListener('resize', handleResize);
      
      // Cleanup on unmount
      return () => {
        window.removeEventListener('resize', handleResize);
        if (canvasRef.current) {
          canvasRef.current.removeChild(renderer.domElement);
        }
        document.body.removeChild(particlesContainer);
      };
    }
    
    return () => {
      document.body.removeChild(particlesContainer);
    };
  }, []);

  return (
    <>
      <div 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full -z-10 opacity-40"
      />
      <div className="absolute top-0 left-0 w-full h-full -z-20 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900" />
    </>
  );
}

// Add to globals.css
// @keyframes float {
//   0% { transform: translateY(0) translateX(0); opacity: 0; }
//   10% { opacity: 0.5; }
//   90% { opacity: 0.5; }
//   100% { transform: translateY(-700px) translateX(100px); opacity: 0; }
// }