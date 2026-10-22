import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Three.js particle galaxy hook for the landing page background.
 * Creates 2000 floating particles, a rotating energy grid, and two
 * floating orbs that follow mouse movement.
 */
export default function useHeroThreeJS(canvasRef, isDark) {
  const cleanupRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100);
    camera.position.z = 3.5;

    // ─── Particle System ───────────────────────────────────────────
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const primaryColor = isDark
      ? new THREE.Color('#c4c0ff')
      : new THREE.Color('#7000ff');
    const secondaryColor = isDark
      ? new THREE.Color('#41eec2')
      : new THREE.Color('#00b4d8');
    const accentColor = isDark
      ? new THREE.Color('#ffba45')
      : new THREE.Color('#d49e1e');

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;

      const rand = Math.random();
      const col = rand < 0.5 ? primaryColor : rand < 0.8 ? secondaryColor : accentColor;
      colors[i * 3]     = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i] = Math.random() * 3 + 0.5;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    pGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const pMat = new THREE.PointsMaterial({
      size: 0.022,
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.72 : 0.45,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ─── Energy grid (torus wireframe) ───────────────────────────
    const torusGeo = new THREE.TorusGeometry(2.2, 0.003, 16, 100);
    const torusMat = new THREE.MeshBasicMaterial({
      color: isDark ? '#464555' : '#e2e6ef',
      transparent: true,
      opacity: 0.3,
    });
    const torus1 = new THREE.Mesh(torusGeo, torusMat);
    const torus2 = new THREE.Mesh(torusGeo, torusMat.clone());
    torus2.rotation.x = Math.PI / 2;
    const torus3 = new THREE.Mesh(torusGeo, torusMat.clone());
    torus3.rotation.y = Math.PI / 3;
    scene.add(torus1, torus2, torus3);

    // ─── Two floating orbs ───────────────────────────────────────
    const orbGeo = new THREE.SphereGeometry(0.12, 32, 32);
    const orb1 = new THREE.Mesh(orbGeo, new THREE.MeshBasicMaterial({
      color: isDark ? '#8781ff' : '#7000ff',
      transparent: true,
      opacity: isDark ? 0.7 : 0.5,
    }));
    const orb2 = new THREE.Mesh(orbGeo.clone(), new THREE.MeshBasicMaterial({
      color: isDark ? '#41eec2' : '#00b4d8',
      transparent: true,
      opacity: isDark ? 0.7 : 0.5,
    }));
    orb1.position.set(-1.5, 0.5, 0.5);
    orb2.position.set(1.5, -0.5, 0.5);
    scene.add(orb1, orb2);

    // ─── Mouse parallax ──────────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const handleMouse = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });

    // ─── Resize ──────────────────────────────────────────────────
    const handleResize = () => {
      if (!canvas.offsetWidth) return;
      camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    };
    window.addEventListener('resize', handleResize);

    // ─── Animation Loop ──────────────────────────────────────────
    let frameId;
    const clock = new THREE.Clock();
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      particles.rotation.y = t * 0.015;
      particles.rotation.x = t * 0.008;

      torus1.rotation.x = t * 0.1;
      torus1.rotation.y = t * 0.14;
      torus2.rotation.z = t * 0.12;
      torus3.rotation.x = t * 0.09;
      torus3.rotation.z = t * 0.11;

      // Orb floating
      orb1.position.y = 0.5 + Math.sin(t * 0.9) * 0.25;
      orb1.position.x = -1.5 + Math.cos(t * 0.5) * 0.2;
      orb2.position.y = -0.5 + Math.sin(t * 0.7 + 1.5) * 0.25;
      orb2.position.x = 1.5 + Math.cos(t * 0.4 + 1) * 0.2;

      // Parallax camera
      camera.position.x += (mouse.x * 0.4 - camera.position.x) * 0.04;
      camera.position.y += (mouse.y * 0.3 - camera.position.y) * 0.04;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    cleanupRef.current = () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      pGeo.dispose();
      pMat.dispose();
    };

    return () => cleanupRef.current?.();
  }, [isDark]);

  return null;
}
