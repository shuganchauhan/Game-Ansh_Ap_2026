import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Tactical Esports 3D Background Hook for FLUX.
 *
 * Implements a high-octane competitive gaming visual environment:
 * 1. Undulating Holographic Cyber Arena Grid (floor radar mesh with digital energy waves)
 * 2. Rotating Tactical HUD Targeting Reticles & Crosshair Brackets
 * 3. Floating Radianite / Power Core with nested polyhedral crystals & orbital rings
 * 4. Ascending Tactical Energy Sparks (upward stream of digital kill/ultimate particles)
 * 5. Interactive Tactical Mouse Parallax (smooth 3D depth and tilt response)
 */
export default function useHeroThreeJS(canvasRef, isDark) {
  const cleanupRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100);
    camera.position.set(0, 0.4, 4.2);

    // Color tokens
    const cyanHex = isDark ? 0x06B6D4 : 0x0891B2;
    const violetHex = isDark ? 0x8B5CF6 : 0x7C3AED;
    const pinkHex = isDark ? 0xEC4899 : 0xDB2777;
    const amberHex = isDark ? 0xF59E0B : 0xD97706;

    const cyanColor = new THREE.Color(cyanHex);
    const violetColor = new THREE.Color(violetHex);
    const pinkColor = new THREE.Color(pinkHex);
    const amberColor = new THREE.Color(amberHex);

    // ─── 1. CYBER ARENA FLOOR GRID (Tactical Holographic Terrain) ─────────
    const gridSegments = 40;
    const gridPlane = new THREE.PlaneGeometry(38, 38, gridSegments, gridSegments);
    gridPlane.rotateX(-Math.PI / 2.3);
    gridPlane.translate(0, -1.9, -1.5);

    const initialPositions = gridPlane.attributes.position.clone();

    const gridMaterial = new THREE.MeshBasicMaterial({
      color: cyanHex,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.32 : 0.15,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    const cyberGrid = new THREE.Mesh(gridPlane, gridMaterial);
    scene.add(cyberGrid);

    // ─── 2. FLOATING TACTICAL RADIANITE CORE (Competitive Esports Objective) ───
    const coreGroup = new THREE.Group();
    coreGroup.position.set(2.2, 0.6, -0.5);

    // Outer wireframe icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(0.75, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: violetHex,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.65 : 0.35,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    const outerCrystal = new THREE.Mesh(icoGeo, icoMat);
    coreGroup.add(outerCrystal);

    // Inner solid core with high glow
    const coreGeo = new THREE.OctahedronGeometry(0.38, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color: pinkHex,
      wireframe: false,
      transparent: true,
      opacity: isDark ? 0.75 : 0.5,
    });
    const innerCrystal = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(innerCrystal);

    // Tactical orbital rings
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: cyanHex,
      transparent: true,
      opacity: isDark ? 0.5 : 0.25,
      wireframe: true,
    });
    const orbitalRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.008, 8, 48), ringMat1);
    orbitalRing1.rotation.x = Math.PI / 3;
    coreGroup.add(orbitalRing1);

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: amberHex,
      transparent: true,
      opacity: isDark ? 0.45 : 0.2,
      wireframe: true,
    });
    const orbitalRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.008, 8, 48), ringMat2);
    orbitalRing2.rotation.y = Math.PI / 2.5;
    coreGroup.add(orbitalRing2);

    scene.add(coreGroup);

    // ─── 3. TACTICAL HUD TARGETING RETICLE (Sniper / Crosshair Brackets) ───
    function createTacticalReticle(radius, colorHex) {
      const reticleGroup = new THREE.Group();

      // Segmented outer ring
      const ringGeo = new THREE.RingGeometry(radius * 0.95, radius, 32, 1, 0, Math.PI * 1.65);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: isDark ? 0.45 : 0.25,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      reticleGroup.add(ringMesh);

      // Inner tick brackets
      const innerRingGeo = new THREE.RingGeometry(radius * 0.55, radius * 0.58, 24, 1, Math.PI * 0.5, Math.PI * 1.2);
      const innerMesh = new THREE.Mesh(innerRingGeo, ringMat.clone());
      reticleGroup.add(innerMesh);

      // 4 Crosshair tick marks
      const linePositions = [];
      const tick = radius * 0.2;
      const dist = radius * 0.65;
      // Top
      linePositions.push(0, dist, 0, 0, dist + tick, 0);
      // Bottom
      linePositions.push(0, -dist, 0, 0, -dist - tick, 0);
      // Left
      linePositions.push(-dist, 0, 0, -dist - tick, 0, 0);
      // Right
      linePositions.push(dist, 0, 0, dist + tick, 0, 0);

      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      const lineMat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: isDark ? 0.6 : 0.3,
      });
      const crosshairs = new THREE.LineSegments(lineGeo, lineMat);
      reticleGroup.add(crosshairs);

      return { group: reticleGroup, outerRing: ringMesh, innerRing: innerMesh };
    }

    // Reticle 1 (Top Left Tactical Radar)
    const reticle1 = createTacticalReticle(0.9, cyanHex);
    reticle1.group.position.set(-2.4, 0.8, -0.8);
    reticle1.group.rotation.z = Math.PI * 0.15;
    scene.add(reticle1.group);

    // Reticle 2 (Lower Right Depth Crosshair)
    const reticle2 = createTacticalReticle(0.65, violetHex);
    reticle2.group.position.set(1.4, -0.8, -0.4);
    reticle2.group.rotation.z = -Math.PI * 0.25;
    scene.add(reticle2.group);

    // ─── 4. ASCENDING CYBER ENERGY SPARKS (Ultimate Ability Embers) ────────
    const sparkCount = 1200;
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkColors = new Float32Array(sparkCount * 3);
    const sparkVelocities = new Float32Array(sparkCount);

    for (let i = 0; i < sparkCount; i++) {
      sparkPositions[i * 3]     = (Math.random() - 0.5) * 16;
      sparkPositions[i * 3 + 1] = Math.random() * 8 - 2.5;
      sparkPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      // Color selection (tactical cyber palette)
      const r = Math.random();
      const col = r < 0.35 ? cyanColor : r < 0.7 ? violetColor : r < 0.9 ? pinkColor : amberColor;
      sparkColors[i * 3]     = col.r;
      sparkColors[i * 3 + 1] = col.g;
      sparkColors[i * 3 + 2] = col.b;

      sparkVelocities[i] = 0.008 + Math.random() * 0.018; // Upward speed
    }

    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));

    const sparkMat = new THREE.PointsMaterial({
      size: isDark ? 0.026 : 0.016,
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.75 : 0.25,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
    });

    const sparkParticles = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparkParticles);

    // ─── 5. MOUSE PARALLAX & TELEMETRY INTERACTION ────────────────────────
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Resize handling
    const handleResize = () => {
      if (!canvas.offsetWidth || !canvas.offsetHeight) return;
      camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    };
    window.addEventListener('resize', handleResize);

    // ─── 6. 60 FPS GAMING ANIMATION LOOP ─────────────────────────────────
    let frameId;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // ── Animate Cyber Arena Grid Vertices (Traveling Pulse Waves) ──
      const posAttr = gridPlane.attributes.position;
      const orig = initialPositions.array;
      const count = posAttr.count;

      for (let i = 0; i < count; i++) {
        const ox = orig[i * 3];
        const oy = orig[i * 3 + 1];

        // Complex sine wave traveling forward along the holographic floor
        const wave1 = Math.sin(ox * 0.45 + t * 2.2) * 0.22;
        const wave2 = Math.cos(oy * 0.35 + t * 1.8) * 0.18;
        const wave3 = Math.sin((ox + oy) * 0.25 + t * 3.0) * 0.1;

        // Interactive mouse pulse on floor
        const distToMouse = Math.hypot(ox - mouse.x * 6, oy - mouse.y * 6);
        const mouseRipple = Math.exp(-distToMouse * 0.3) * Math.sin(distToMouse * 2.0 - t * 4.0) * 0.25;

        posAttr.setZ(i, wave1 + wave2 + wave3 + mouseRipple);
      }
      posAttr.needsUpdate = true;

      // ── Animate Radianite Core ──
      coreGroup.rotation.y = t * 0.35;
      coreGroup.rotation.x = Math.sin(t * 0.5) * 0.15;
      outerCrystal.rotation.z = -t * 0.2;
      innerCrystal.rotation.y = t * 0.6;
      innerCrystal.rotation.z = t * 0.4;
      orbitalRing1.rotation.z = t * 0.8;
      orbitalRing2.rotation.x = -t * 0.6;

      // Core floating bob
      coreGroup.position.y = 0.6 + Math.sin(t * 1.2) * 0.15;

      // ── Animate Tactical Reticles (Clockwise & Counter-Clockwise) ──
      reticle1.outerRing.rotation.z = t * 0.4;
      reticle1.innerRing.rotation.z = -t * 0.6;
      reticle1.group.position.y = 0.8 + Math.sin(t * 0.8) * 0.08;

      reticle2.outerRing.rotation.z = -t * 0.3;
      reticle2.innerRing.rotation.z = t * 0.5;
      reticle2.group.position.y = -0.8 + Math.cos(t * 0.9) * 0.06;

      // ── Animate Ascending Energy Sparks ──
      const sparkPos = sparkGeo.attributes.position.array;
      for (let i = 0; i < sparkCount; i++) {
        sparkPos[i * 3 + 1] += sparkVelocities[i]; // Rise upward
        sparkPos[i * 3] += Math.sin(t * 1.5 + i) * 0.003; // Gentle horizontal oscillation

        // Wrap around when rising past top threshold
        if (sparkPos[i * 3 + 1] > 5.5) {
          sparkPos[i * 3 + 1] = -2.5;
          sparkPos[i * 3] = (Math.random() - 0.5) * 16;
          sparkPos[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
      }
      sparkGeo.attributes.position.needsUpdate = true;

      // ── Camera Tactical Parallax Response ──
      camera.position.x = mouse.x * 0.5;
      camera.position.y = 0.4 + mouse.y * 0.35;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    cleanupRef.current = () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      gridPlane.dispose();
      gridMaterial.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      ringMat1.dispose();
      ringMat2.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
    };

    return () => cleanupRef.current?.();
  }, [isDark]);

  return null;
}
