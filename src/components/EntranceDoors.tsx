// @ts-nocheck
import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import './shaders/RevealMaterial'; // Registers alpha-discard reveal shader
import { ServerRack3D } from './entrance3d/ServerRack3D';
import { Printer3D } from './entrance3d/Printer3D';
import { WorkstationPC3D } from './entrance3d/WorkstationPC3D';
import { RoboticMachine3D } from './entrance3d/RoboticMachine3D';
import { ENTRANCE_STATIONS } from './entrance3d/InteractiveStationProps';

if (typeof window !== 'undefined') {
    (window as any).__MKRD_STATIONS = ENTRANCE_STATIONS;
}

// Use same font as App.jsx preload (Inter) - works reliably
const FONT_URL = 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff';

/**
 * EntranceDoors Component - 3D Entrance to the Corridor with Next-Gen Engineering Stations
 * 
 * Doors that open and camera flies through.
 * EmptyCorridor provides the surrounding corridor context.
 */
const EntranceDoors = ({
    position = [0, 0, 22],
    onComplete,
    corridorHeight = 8, // Taller wall
    corridorWidth = 15, // Wider wall
    onInspectStation,
    forceOpen = false,
    showLabels = false
}) => {
    const leftDoorRef = useRef();
    const rightDoorRef = useRef();
    const leftHandleRef = useRef();
    const rightHandleRef = useRef();
    const rightDoorMaterialRef = useRef(); // GSAP shader control
    const leftDoorMaterialRef = useRef(); // Left door reveal control
    const leftHandleMaterialRef = useRef(); // Left handle reveal control
    const rightHandleMaterialRef = useRef(); // Right handle reveal control
    const leftHandlePaintedRef = useRef(); // Painted handle mesh visibility
    const rightHandlePaintedRef = useRef(); // Painted handle mesh visibility
    const groupRef = useRef();
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isWindowHovered, setIsWindowHovered] = useState(false);
    const windowAvatarRef = useRef();
    const { camera } = useThree();

    

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(false || window.innerWidth < 1000);
    }, []);

    // Dla hooków tekstur musimy obliczyć to raz na starcie
    const isMobileDevice = typeof window !== 'undefined' && (false || window.innerWidth < 1000);
    const dummyTex = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

    const frameTexture = useTexture('/textures/doors/frame_sketch.webp');
    const doorLeftTexture = useTexture('/textures/doors/door_left_sketch.webp');
    const doorRightTexture = useTexture('/textures/doors/door_right_sketch.webp');

    // Mobile optimization: Don't load painted textures or handles on phones
    const doorRightPaintedTexture = useTexture(isMobileDevice ? dummyTex : '/textures/doors/door_right_painted.webp');
    const doorLeftPaintedTexture = useTexture(isMobileDevice ? dummyTex : '/textures/doors/door_left_painted.webp');
    const handleLeftTexture = useTexture('/textures/doors/handle_left_sketch.webp');
    const handleLeftPaintedTexture = useTexture(isMobileDevice ? dummyTex : '/textures/doors/handle_left_painted.webp');
    const handleRightTexture = useTexture('/textures/doors/handle_right_sketch.webp');
    const handleRightPaintedTexture = useTexture(isMobileDevice ? dummyTex : '/textures/doors/handle_right_painted.webp');

    // Dynamic textures for mobile
    const doorBackTexture = useTexture(isMobileDevice ? '/textures/doors/door_back.webp' : '/textures/doors/door_back_left_sketch.webp');
    const edgeTexture = useTexture(isMobileDevice ? '/textures/doors/pien_sketch.webp' : '/textures/doors/pien.webp');

    const bricksTexture = useTexture('/textures/entrance/wall_bricks_2.webp');
    const stonePathTexture = useTexture('/textures/entrance/stone-path.webp');
    const logoTexture = useTexture('/images/mkrd-logo.png');
    const windowSketchTexture = useTexture('/textures/entrance/window_sketch.webp');
    // const catTexture = useTexture('/textures/entrance/cat_sketch.webp'); // Old side cat

    // Cat Ref
    const leftPupilRef = useRef();
    const rightPupilRef = useRef();
    const catGroupRef = useRef(); // To get world position for tracking
    const bugRef = useRef();

    // Bug Click Animation State
    const [isBugClicked, setIsBugClicked] = useState(false);
    const [textVisible, setTextVisible] = useState(false);
    const [clipProgress, setClipProgress] = useState(0); // 0-1 for pencil drawing reveal
    const inkSplashRef = useRef();
    const handleHideDelayRef = useRef(); // Track pending gsap.delayedCall for handle visibility
    const bugFixedTextRef = useRef();
    const bugClickPos = useRef({ x: 0, y: 0 }); // Store click position

    // Duck Speech Bubble State (Rubber Duck Debugging)
    const [isDuckSpeaking, setIsDuckSpeaking] = useState(false);
    const [duckQuote, setDuckQuote] = useState('');
    const speechBubbleRef = useRef();

    // Rubber Duck Debugging Quotes
    const duckQuotes = [
        "Have you tried console.log()?",
        "Did you clear the cache?",
        "It works on my machine! 🤷",
        "Have you turned it off and on again?",
        "Maybe it's a CSS issue?",
        "Check for missing semicolons!",
        "Did you read the error message?",
        "Have you tried Stack Overflow?",
        "Is it plugged in?",
        "Works in production! 🚀",
    ];

    // Bug Click Handler
    const handleBugClick = (e) => {
        e.stopPropagation();
        if (isBugClicked) return; // Already clicked

        // Store bug position at click time
        if (bugRef.current) {
            bugClickPos.current = {
                x: bugRef.current.position.x,
                y: bugRef.current.position.y
            };
        }

        setIsBugClicked(true);
        document.body.style.cursor = "auto";

        // Animate ink splash scale up
        if (inkSplashRef.current) {
            // Position ink splash at bug's last position
            inkSplashRef.current.position.x = bugClickPos.current.x;
            inkSplashRef.current.position.y = bugClickPos.current.y;
            inkSplashRef.current.scale.set(0, 0, 0);
            inkSplashRef.current.material.opacity = 1;

            gsap.to(inkSplashRef.current.scale, {
                x: 0.8,
                y: 0.8,
                z: 1,
                duration: 0.4,
                ease: 'back.out(1.7)'
            });
        }

        // Pencil drawing effect - smooth reveal from left to right
        setTextVisible(true);
        setClipProgress(0);

        if (bugFixedTextRef.current) {
            bugFixedTextRef.current.position.x = bugClickPos.current.x;
            bugFixedTextRef.current.position.y = bugClickPos.current.y;
        }

        // Animate clip progress from 0 to 1 (reveals text like pencil drawing)
        gsap.to({ progress: 0 }, {
            progress: 1,
            duration: 0.8,
            ease: 'power1.inOut',
            onUpdate: function () {
                setClipProgress(this.targets()[0].progress);
            },
            onComplete: () => {
                // Fade out after a delay
                setTimeout(() => {
                    if (inkSplashRef.current) {
                        gsap.to(inkSplashRef.current.material, {
                            opacity: 0,
                            duration: 1,
                            ease: 'power2.out'
                        });
                    }
                }, 1500);
            }
        });
    };

    // Duck Click Handler (Rubber Duck Debugging)
    const handleDuckClick = (e) => {
        e.stopPropagation();
        if (isDuckSpeaking) return; // Already speaking

        // Pick random quote
        const randomQuote = duckQuotes[Math.floor(Math.random() * duckQuotes.length)];
        setDuckQuote(randomQuote);
        setIsDuckSpeaking(true);

        // Scale in animation for speech bubble
        if (speechBubbleRef.current) {
            speechBubbleRef.current.scale.set(0, 0, 0);
            gsap.to(speechBubbleRef.current.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.3,
                ease: 'back.out(1.7)'
            });
        }

        // Hide after 3 seconds
        setTimeout(() => {
            if (speechBubbleRef.current) {
                gsap.to(speechBubbleRef.current.scale, {
                    x: 0,
                    y: 0,
                    z: 0,
                    duration: 0.2,
                    ease: 'power2.in',
                    onComplete: () => setIsDuckSpeaking(false)
                });
            } else {
                setIsDuckSpeaking(false);
            }
        }, 3000);
    };

    // ... (lines omitted)



    // Door dimensions - calculated from texture proportions (332x848 = 1:2.55)
    // Door dimensions - calculated from texture proportions (332x848 = 1:2.55)
    const doorWidth = 0.94;
    const doorHeight = 2.4;
    const doorOpeningWidth = doorWidth * 2; // Both doors together
    const wallThickness = 0.07;

    // Frame dimensions from texture (718x877 = 1:1.22)
    const frameWidth = doorOpeningWidth + 0.16; // Extra for frame borders
    const frameHeight = frameWidth * (877 / 718); // Maintain texture aspect ratio

    // Floor Y must remain at standard level (-1.75) regardless of wall height
    const floorY = -1.75;
    const doorBottomY = floorY;
    const doorCenterY = doorBottomY + doorHeight / 2;
    const wallCenterY = floorY + corridorHeight / 2;
    const topWallHeight = corridorHeight - doorHeight;
    const topWallCenterY = doorBottomY + doorHeight + topWallHeight / 2;
    const sideWallWidth = (corridorWidth - doorOpeningWidth) / 2;



    // Cat Interaction State


    // Handle external forceOpen trigger
    useEffect(() => {
        if (forceOpen && !isOpen && !isAnimating) {
            handleClick({ stopPropagation: () => {} });
        }
    }, [forceOpen]);

    // Handle click
    const handleClick = (e) => {
        e.stopPropagation();
        if (isOpen || isAnimating) return;

        // Reset cursor immediately on transition start
        document.body.style.cursor = "auto";

        setIsOpen(true);
        setIsAnimating(true);
        
        

        const tl = gsap.timeline({
            onComplete: () => {
                onComplete?.();
            }
        });

        // Press handles down fully (like really opening)
        if (leftHandleRef.current) {
            tl.to(leftHandleRef.current.rotation, {
                z: 0.4,
                duration: 0.15,
                ease: 'power2.out'
            }, 0);
        }
        if (rightHandleRef.current) {
            tl.to(rightHandleRef.current.rotation, {
                z: -0.4,
                duration: 0.15,
                ease: 'power2.out'
            }, 0);
        }

        // Open doors - smoother angle (matches SegmentDoors)
        tl.to(leftDoorRef.current.rotation, {
            y: -Math.PI * 0.55,
            duration: 0.9,
            ease: 'power2.out'
        }, 0.1);

        tl.to(rightDoorRef.current.rotation, {
            y: Math.PI * 0.55,
            duration: 0.9,
            ease: 'power2.out'
        }, 0.1);

        // Camera flies through - STOP CLOSER to avatar/ITOM
        tl.to(camera.position, {
            z: 11,  // Closer stop point (was 11)
            y: 0.2, // Match hook's base Y position
            duration: 1.8,
            ease: 'power2.inOut'
        }, 0.3);
    };

    // Handle hover - doors slightly open to indicate interactivity
    const handlePointerEnter = () => {
        if (isOpen || isAnimating || isMobile) return;
        setIsHovered(true);
        document.body.style.cursor = "pointer";

        // Slightly open doors on hover
        gsap.to(leftDoorRef.current.rotation, {
            y: -0.08,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: true
        });
        gsap.to(rightDoorRef.current.rotation, {
            y: 0.08,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: true
        });

        // Rotate handles down slightly (hint effect)
        if (leftHandleRef.current) {
            gsap.to(leftHandleRef.current.rotation, {
                z: 0.1,
                duration: 0.2,
                ease: 'power2.out',
                overwrite: true
            });
        }
        if (rightHandleRef.current) {
            gsap.to(rightHandleRef.current.rotation, {
                z: -0.1,
                duration: 0.2,
                ease: 'power2.out',
                overwrite: true
            });
        }

        // Brush-stroke reveal: discard sketch pixels to show painted door beneath
        if (rightDoorMaterialRef.current) {
            gsap.to(rightDoorMaterialRef.current, {
                uProgress: 1.0,
                duration: 0.8,
                ease: 'power2.out',
                overwrite: true
            });
        }
        if (leftDoorMaterialRef.current) {
            gsap.to(leftDoorMaterialRef.current, {
                uProgress: 1.0,
                duration: 0.8,
                ease: 'power2.out',
                overwrite: true
            });
        }
        if (leftHandleMaterialRef.current) {
            gsap.to(leftHandleMaterialRef.current, {
                uProgress: 1.0,
                duration: 0.8,
                ease: 'power2.out',
                overwrite: true
            });
        }
        if (rightHandleMaterialRef.current) {
            gsap.to(rightHandleMaterialRef.current, {
                uProgress: 1.0,
                duration: 0.8,
                ease: 'power2.out',
                overwrite: true
            });
        }
        // Show painted handles (kill any pending hide from previous leave)
        if (handleHideDelayRef.current) handleHideDelayRef.current.kill();
        if (leftHandlePaintedRef.current) leftHandlePaintedRef.current.visible = true;
        if (rightHandlePaintedRef.current) rightHandlePaintedRef.current.visible = true;
    };

    const handlePointerLeave = () => {
        if (isOpen || isAnimating || isMobile) return;
        setIsHovered(false);
        document.body.style.cursor = "auto";

        // Close doors back
        gsap.to(leftDoorRef.current.rotation, {
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: true
        });
        gsap.to(rightDoorRef.current.rotation, {
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: true
        });

        // Reset handles
        if (leftHandleRef.current) {
            gsap.to(leftHandleRef.current.rotation, {
                z: 0,
                duration: 0.2,
                ease: 'power2.out',
                overwrite: true
            });
        }
        if (rightHandleRef.current) {
            gsap.to(rightHandleRef.current.rotation, {
                z: 0,
                duration: 0.2,
                ease: 'power2.out',
                overwrite: true
            });
        }

        // Reverse brush-stroke reveal
        if (rightDoorMaterialRef.current) {
            gsap.to(rightDoorMaterialRef.current, {
                uProgress: 0.0,
                duration: 0.5,
                ease: 'power2.out',
                overwrite: true
            });
        }
        if (leftDoorMaterialRef.current) {
            gsap.to(leftDoorMaterialRef.current, {
                uProgress: 0.0,
                duration: 0.5,
                ease: 'power2.out',
                overwrite: true
            });
        }
        if (leftHandleMaterialRef.current) {
            gsap.to(leftHandleMaterialRef.current, {
                uProgress: 0.0,
                duration: 0.5,
                ease: 'power2.out',
                overwrite: true
            });
        }
        if (rightHandleMaterialRef.current) {
            gsap.to(rightHandleMaterialRef.current, {
                uProgress: 0.0,
                duration: 0.5,
                ease: 'power2.out',
                overwrite: true
            });
        }

        // Hide painted handles after reverse animation completes
        handleHideDelayRef.current = gsap.delayedCall(0.55, () => {
            if (leftHandlePaintedRef.current) leftHandlePaintedRef.current.visible = false;
            if (rightHandlePaintedRef.current) rightHandlePaintedRef.current.visible = false;
        });
    };



    // --- Parallax Camera & Cat Eye Tracking Logic ---
    useFrame((state) => {
        // Camera smooth parallax when doors not animating
        if (!isOpen && !isAnimating) {
            const { x, y } = state.pointer;
            camera.position.x = THREE.MathUtils.lerp(camera.position.x, x * 1.5, 0.05);
            camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.2 + y * 0.6, 0.05);
            camera.lookAt(0, 0.4, 22);
        }

        if (!leftPupilRef.current || !rightPupilRef.current) return;

        // Mouse position in normalized device reference (-1 to +1)
        const { x, y } = state.pointer;

        // Configuration
        const MAX_EYE_MOVEMENT = 0.015; // How far pupils can move from center

        // Simple mapping
        const targetX = x * MAX_EYE_MOVEMENT * 2;
        const targetY = y * MAX_EYE_MOVEMENT * 2;

        // Smoothly interpolate current pupil position to target
        // Left Eye Original: [-0.063, 0.27]
        leftPupilRef.current.position.x = THREE.MathUtils.lerp(leftPupilRef.current.position.x, -0.075 + targetX, 0.1);
        leftPupilRef.current.position.y = THREE.MathUtils.lerp(leftPupilRef.current.position.y, 0.28 + targetY, 0.1);

        // Right Eye Original: [0.0615, 0.27]
        rightPupilRef.current.position.x = THREE.MathUtils.lerp(rightPupilRef.current.position.x, 0.043 + targetX, 0.1);
        rightPupilRef.current.position.y = THREE.MathUtils.lerp(rightPupilRef.current.position.y, 0.28 + targetY, 0.1);
    });

    // --- Mouse Swinging Animation ---
    const mousePivotRef = useRef();
    useFrame(({ clock }) => {
        if (mousePivotRef.current) {
            // Gentle swing: sin wave
            // Amplitude: 0.05 radians (approx 3 degrees)
            // Speed: 1.5
            mousePivotRef.current.rotation.x = Math.sin(clock.elapsedTime * 1.5) * 0.05;
        }

        // --- Bug Animation ---
        if (bugRef.current) {
            const time = clock.elapsedTime;
            // Wandering logic: slightly complex sine waves for "random" walking felt
            // Initial Pos: [2.5, floorY + 3.0, 0.16] (Above window)
            // Range: +/- 0.3 in X, +/- 0.3 in Y

            const xOffset = Math.sin(time * 0.8) * 0.3 + Math.sin(time * 1.5) * 0.1;
            const yOffset = Math.cos(time * 0.6) * 0.2 + Math.cos(time * 1.1) * 0.1;

            bugRef.current.position.x = 3 + xOffset;
            bugRef.current.position.y = (floorY + 3.8) + yOffset;

            // Random rotation jitter
            bugRef.current.rotation.z = Math.sin(time * 5) * 0.1 + Math.atan2(yOffset, xOffset) * 0.2;
        }
    });



    // Helper for window hover
    const handleWindowEnter = (e) => {
        e.stopPropagation();
        setIsWindowHovered(true);
        document.body.style.cursor = "pointer";

        if (windowAvatarRef.current) {
            gsap.to(windowAvatarRef.current.position, {
                x: 2.5,
                duration: 0.5,
                ease: 'back.out(1.7)',
                overwrite: true
            });
            gsap.to(windowAvatarRef.current.rotation, {
                z: 0.1,
                duration: 0.5,
                ease: 'power2.out',
                overwrite: true
            });
        }
    };

    const handleWindowLeave = (e) => {
        e.stopPropagation();
        setIsWindowHovered(false);
        document.body.style.cursor = "auto";

        if (windowAvatarRef.current) {
            gsap.to(windowAvatarRef.current.position, {
                x: 3.5,
                duration: 0.4,
                ease: 'power2.in',
                overwrite: true
            });
            gsap.to(windowAvatarRef.current.rotation, {
                z: 0,
                duration: 0.4,
                ease: 'power2.in',
                overwrite: true
            });
        }
    };

    // Frame center Y - aligned with doors
    const frameCenterY = doorBottomY + frameHeight / 2;

    const facadeYOffset = -1.65;


    const pathWidth = frameWidth + 0.4;
    // New texture is 1005x2317 (approx 1:2.3 ratio). 
    // Width 2.44 * 2.3 = ~5.6 height.
    const pathLength = 5.62;

    return (
        <group ref={groupRef} position={[position[0], 0, position[2]]}>

            {/* === STONE PATH FLOOR (On Top - in front of entrance) === */}
            {/* WYSOKOŚĆ STONE PATH: zmień 'floorY + 0.02' - większa liczba = wyżej */}
            <mesh
                position={[0, floorY + 0.02, pathLength / 2]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <planeGeometry args={[pathWidth, pathLength]} />
                <meshBasicMaterial color="#06b6d4"
                    map={stonePathTexture}
                    transparent={true}
                />
            </mesh>


            {/* LEFT WALL PANEL */}
            <mesh position={[-(doorOpeningWidth / 2 + sideWallWidth / 2), wallCenterY, 0]}>
                <boxGeometry args={[sideWallWidth, corridorHeight, wallThickness]} />
                <meshBasicMaterial color="#06b6d4" roughness={0.95} />
            </mesh>

            {/* RIGHT WALL PANEL */}
            <mesh position={[(doorOpeningWidth / 2 + sideWallWidth / 2), wallCenterY, 0]}>
                <boxGeometry args={[sideWallWidth, corridorHeight, wallThickness]} />
                <meshBasicMaterial color="#06b6d4" roughness={0.95} />
            </mesh>

            {/* TOP WALL PANEL */}
            <mesh position={[0, topWallCenterY, 0]}>
                <boxGeometry args={[doorOpeningWidth, topWallHeight, wallThickness]} />
                <meshBasicMaterial color="#06b6d4" roughness={0.95} />
            </mesh>

            {/* === BRICK FACADE === */}
            {/* 
                DOSTOSOWANIE OBRAZKA (TEXTURE ADJUSTMENT):
                1. args={[Szerokość, Wysokość]} - Rozmiar obrazka
                2. facadeYOffset - Przesunięcie góra/dół (np. -1 obniży, 1 podwyższy)
            */}
            <mesh position={[0, wallCenterY + facadeYOffset + 1.65, 0.15]}>
                {/* args={[Szerokość, Wysokość]} - Zmieniaj te liczby (np. 7, 8) */}
                <planeGeometry args={[16., 8]} />
                <meshBasicMaterial color="#06b6d4"
                    map={bricksTexture}
                    transparent={true}
                    alphaTest={0.01}
                    roughness={0.9}
                />
            </mesh>

            {/* === TEXTURED FRAME === */}
            <mesh position={[0, frameCenterY, 0.12]}>
                <planeGeometry args={[frameWidth, frameHeight]} />
                <meshBasicMaterial color="#06b6d4"
                    map={frameTexture}
                    transparent={true}
                    alphaTest={0.1}
                    roughness={0.9}
                    depthWrite={false}
                />
            </mesh>

            {/* LEFT DOOR */}
            <group ref={leftDoorRef} position={[-doorWidth, doorCenterY, 0]}>
                {/* Solid 3D Door Body with edge texture */}
                <mesh
                    position={[doorWidth / 2, 0, 0.06]}
                    onClick={handleClick}
                    onPointerEnter={handlePointerEnter}
                    onPointerLeave={handlePointerLeave}
                >
                    <boxGeometry args={[doorWidth, doorHeight, 0.04]} />
                    <meshBasicMaterial color="#06b6d4" map={edgeTexture} roughness={0.9} />
                </mesh>

                {/* Painted layer (behind sketch) - left door */}
                {!isMobile && (
                    <mesh position={[doorWidth / 2, 0, 0.088]}>
                        <planeGeometry args={[doorWidth, doorHeight]} />
                        <meshBasicMaterial color="#06b6d4"
                            map={doorLeftPaintedTexture}
                            transparent={true}
                            alphaTest={0.5}
                            roughness={0.8}
                        />
                    </mesh>
                )}

                {/* Sketch overlay (front) - left door brush-stroke reveal */}
                <mesh position={[doorWidth / 2, 0, 0.09]}>
                    <planeGeometry args={[doorWidth, doorHeight]} />
                    <revealMaterial color="#06b6d4"
                        ref={leftDoorMaterialRef}
                        map={doorLeftTexture}
                        transparent={true}
                        alphaTest={0.5}
                        roughness={0.8}
                        depthWrite={false}
                        uProgress={0.0}
                    />
                </mesh>

                {/* Back Texture Face (mirrored) */}
                <mesh position={[doorWidth / 2, 0, 0.03]} rotation={[0, Math.PI, 0]} scale={[-1, 1, 1]}>
                    <planeGeometry args={[doorWidth, doorHeight]} />
                    <meshBasicMaterial color="#06b6d4"
                        map={doorBackTexture}
                        transparent={true}
                        alphaTest={0.5}
                        roughness={0.8}
                        side={2}
                    />
                </mesh>

                {/* Handle Layer (animated) - pivot at screw center (292,459 on 332x848 texture) */}
                <group ref={leftHandleRef} position={[doorWidth / 2 + 0.357, -0.099, 0.10]}>
                    {/* Painted handle (behind) - hidden until hover */}
                    {!isMobile && (
                        <mesh ref={leftHandlePaintedRef} position={[-0.357, 0.09, -0.001]} visible={false}>
                            <planeGeometry args={[doorWidth, doorHeight]} />
                            <meshBasicMaterial color="#06b6d4"
                                map={handleLeftPaintedTexture}
                                transparent={true}
                                alphaTest={0.5}
                                depthWrite={false}
                            />
                        </mesh>
                    )}
                    {/* Sketch handle overlay (front) */}
                    <mesh position={[-0.357, 0.099, 0]}>
                        <planeGeometry args={[doorWidth, doorHeight]} />
                        <revealMaterial color="#06b6d4"
                            ref={leftHandleMaterialRef}
                            map={handleLeftTexture}
                            transparent={true}
                            alphaTest={0.5}
                            depthWrite={false}
                            uProgress={0.0}
                        />
                    </mesh>
                </group>
            </group>

            {/* RIGHT DOOR */}
            <group ref={rightDoorRef} position={[doorWidth, doorCenterY, 0]}>
                {/* Solid 3D Door Body with edge texture */}
                <mesh
                    position={[-doorWidth / 2, 0, 0.06]}
                    onClick={handleClick}
                    onPointerEnter={handlePointerEnter}
                    onPointerLeave={handlePointerLeave}
                >
                    <boxGeometry args={[doorWidth, doorHeight, 0.04]} />
                    <meshBasicMaterial color="#06b6d4" map={edgeTexture} roughness={0.9} />
                </mesh>

                {/* Painted layer (behind sketch) - revealed when sketch fades out on hover */}
                {!isMobile && (
                    <mesh position={[-doorWidth / 2, 0, 0.088]}>
                        <planeGeometry args={[doorWidth, doorHeight]} />
                        <meshBasicMaterial color="#06b6d4"
                            map={doorRightPaintedTexture}
                            transparent={true}
                            alphaTest={0.5}
                            roughness={0.8}
                        />
                    </mesh>
                )}

                {/* Sketch overlay (front) - brush-stroke discard reveals painted beneath */}
                <mesh position={[-doorWidth / 2, 0, 0.09]}>
                    <planeGeometry args={[doorWidth, doorHeight]} />
                    <revealMaterial color="#06b6d4"
                        ref={rightDoorMaterialRef}
                        map={doorRightTexture}
                        transparent={true}
                        alphaTest={0.5}
                        roughness={0.8}
                        depthWrite={false}
                        uProgress={0.0}
                    />
                </mesh>

                {/* Back Texture Face */}
                <mesh position={[-doorWidth / 2, 0, 0.03]} rotation={[0, Math.PI, 0]}>
                    <planeGeometry args={[doorWidth, doorHeight]} />
                    <meshBasicMaterial color="#06b6d4"
                        map={doorBackTexture}
                        transparent={true}
                        alphaTest={0.5}
                        roughness={0.8}
                    />
                </mesh>

                {/* Handle Layer (animated) - pivot at screw center (40,459 on 332x848 texture) */}
                <group ref={rightHandleRef} position={[-doorWidth / 2 - 0.357, -0.099, 0.10]}>
                    {/* Painted handle (behind) - hidden until hover */}
                    {!isMobile && (
                        <mesh ref={rightHandlePaintedRef} position={[0.357, 0.09, -0.001]} visible={false}>
                            <planeGeometry args={[doorWidth, doorHeight]} />
                            <meshBasicMaterial color="#06b6d4"
                                map={handleRightPaintedTexture}
                                transparent={true}
                                alphaTest={0.5}
                                depthWrite={false}
                            />
                        </mesh>
                    )}
                    {/* Sketch handle overlay (front) */}
                    <mesh position={[0.357, 0.099, 0]}>
                        <planeGeometry args={[doorWidth, doorHeight]} />
                        <revealMaterial color="#06b6d4"
                            ref={rightHandleMaterialRef}
                            map={handleRightTexture}
                            transparent={true}
                            alphaTest={0.5}
                            depthWrite={false}
                            uProgress={0.0}
                        />
                    </mesh>
                </group>
            </group>

            {/* Window Avatar Event Catcher (invisible plane) */}
            <mesh
                position={[2.5, 0, 0.25]}
                onPointerEnter={handleWindowEnter}
                onPointerLeave={handleWindowLeave}
                onClick={(e) => e.stopPropagation()}
            >
                <planeGeometry args={[1.5, 1.5]} />
                <meshBasicMaterial visible={false} />
            </mesh>

            {/* AVATAR - MKRD Logo sliding out from behind the wall */}
            <mesh
                ref={windowAvatarRef}
                position={[3.5, 0, 0.04]}
                rotation={[0, 0, 0]}
            >
                <planeGeometry args={[1.2, 0.6]} />
                <meshBasicMaterial
                    map={logoTexture}
                    transparent={true}
                    depthWrite={false}
                />
            </mesh>

            {/* WINDOW GROUP - Frame in front of bricks */}
            <group position={[2.5, 0, 0.05]} >
                <mesh position={[0, 0, 0.2]}>
                    <planeGeometry args={[1.5, 1.5]} />
                    <meshBasicMaterial color="#06b6d4"
                        map={windowSketchTexture}
                        transparent={true}
                        depthWrite={false}
                    />
                </mesh>
            </group>
            {/* Realistic Painted Wall Decal & Text */}
            <group position={[3.5, doorBottomY + 2.5, 0.05]} rotation={[0, 0, 0]}>
                <Text
                    position={[0, 0.9, 0]}
                    fontSize={0.6}
                    color="#020617" // Very dark slate/black for maximum contrast
                    anchorX="center"
                    anchorY="middle"
                    font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                    letterSpacing={0.05}
                    opacity={0.8}
                    depthWrite={false}
                >
                    MKRD
                </Text>

                <Text
                    position={[0, 0.3, 0]}
                    fontSize={0.4}
                    color="#020617" 
                    anchorX="center"
                    anchorY="middle"
                    font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                    letterSpacing={0.05}
                    opacity={0.8}
                    depthWrite={false}
                >
                    ENGINEERS
                </Text>
                
                <Text
                    position={[0, -0.3, 0]}
                    fontSize={0.5}
                    color="#020617" 
                    anchorX="center"
                    anchorY="middle"
                    font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                    opacity={0.8}
                    depthWrite={false}
                >
                    &lt;---
                </Text>
            </group>

            {/* === 3D ENGINEERING STATIONS (FLANKING THE ENTRANCE) === */}
            {/* Left Side: Server Compute Node & CAD Workstation */}
            <ServerRack3D
                position={[-4.8, floorY, 2.2]}
                rotation={[0, Math.PI * 0.15, 0]}
                scale={0.95}
                onInspect={onInspectStation}
                showLabel={showLabels}
            />

            <WorkstationPC3D
                position={[-3.8, floorY, 4.4]}
                rotation={[0, Math.PI * 0.28, 0]}
                scale={0.92}
                onInspect={onInspectStation}
                showLabel={showLabels}
            />

            {/* Right Side: Industrial 3D Printer & 6-Axis Robot Actuator */}
            <Printer3D
                position={[4.8, floorY, 2.2]}
                rotation={[0, -Math.PI * 0.15, 0]}
                scale={0.95}
                onInspect={onInspectStation}
                showLabel={showLabels}
            />

            <RoboticMachine3D
                position={[3.8, floorY, 4.4]}
                rotation={[0, -Math.PI * 0.28, 0]}
                scale={0.92}
                onInspect={onInspectStation}
                showLabel={showLabels}
            />

            {/* Cyber Floor Grid & Conduits in Front of Entrance */}
            <mesh position={[-4.2, floorY + 0.005, 3.2]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[3.2, 4.8]} />
                <meshStandardMaterial
                    color="#0284c7"
                    emissive="#0369a1"
                    emissiveIntensity={0.2}
                    wireframe
                    transparent
                    opacity={0.35}
                />
            </mesh>

            <mesh position={[4.2, floorY + 0.005, 3.2]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[3.2, 4.8]} />
                <meshStandardMaterial
                    color="#06b6d4"
                    emissive="#0891b2"
                    emissiveIntensity={0.2}
                    wireframe
                    transparent
                    opacity={0.35}
                />
            </mesh>

            {/* Fiber Optic Conduit Lines */}
            {[-3.6, -2.4, 2.4, 3.6].map((x, i) => (
                <mesh key={`conduit-${i}`} position={[x, floorY + 0.015, 2.8]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.04, 5.0]} />
                    <meshBasicMaterial
                        color={i < 2 ? '#38bdf8' : '#06b6d4'}
                        transparent
                        opacity={0.6}
                    />
                </mesh>
            ))}

            {/* Environmental Scene Lights */}
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 8, 10]} intensity={1.2} color="#bae6fd" />
            <directionalLight position={[-5, 8, 10]} intensity={1.0} color="#a5b4fc" />

            <pointLight
                position={[0, doorBottomY + doorHeight + 1, 1]}
                intensity={1.8}
                color="#06b6d4"
                distance={18}
            />

            <pointLight
                position={[-4.5, floorY + 2.5, 3]}
                intensity={1.4}
                color="#38bdf8"
                distance={10}
            />

            <pointLight
                position={[4.5, floorY + 2.5, 3]}
                intensity={1.4}
                color="#06b6d4"
                distance={10}
            />
        </group>
    );
};

export default EntranceDoors;
