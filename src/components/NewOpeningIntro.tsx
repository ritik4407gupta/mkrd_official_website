import React, { useState, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import Preloader from './Preloader';
import EntranceDoors from './EntranceDoors';
import { EntranceOverlayHUD } from './entrance3d/EntranceOverlayHUD';
import { StationData } from './entrance3d/InteractiveStationProps';
import { motion, AnimatePresence } from 'motion/react';
import { TransitionTextSequence } from './TransitionTextSequence';

interface NewOpeningIntroProps {
  onComplete: () => void;
}

export const NewOpeningIntro: React.FC<NewOpeningIntroProps> = ({ onComplete }) => {
  const [sceneReady, setSceneReady] = useState(false);
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [doorFinished, setDoorFinished] = useState(false);
  const [forceOpenDoors, setForceOpenDoors] = useState(false);
  const [selectedStation, setSelectedStation] = useState<StationData | null>(null);

  // Called when Preloader finishes its tear animation
  const handlePreloaderComplete = () => {
    setPreloaderDone(true);
  };

  // Called when EntranceDoors finishes its fly-through animation
  const handleDoorComplete = () => {
    // Show the black screen with the text injection transition
    setDoorFinished(true);
  };

  const handleTransitionComplete = () => {
    setIsDone(true);
    onComplete();
  };

  const handleOpenDoors = () => {
    setForceOpenDoors(true);
  };

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8 } }}
          className="fixed inset-0 z-50 bg-[#020617] overflow-hidden"
        >
          {/* 3D Canvas for EntranceDoors & Interactive Engineering Units */}
          <div className="absolute inset-0 w-full h-full">
            <Canvas
              className="w-full h-full cursor-default select-none"
              camera={{
                position: [0, 0.2, 28],
                fov: 60,
                near: 0.1,
                far: 150
              }}
              gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
              dpr={[1, 2]}
              onCreated={() => setSceneReady(true)}
            >
              <color attach="background" args={['#020617']} />
              <fog attach="fog" args={['#020617', 18, 55]} />
              
              {!doorFinished && (
                <Suspense fallback={null}>
                  <EntranceDoors
                    onComplete={handleDoorComplete}
                    onInspectStation={(station: StationData) => setSelectedStation(station)}
                    forceOpen={forceOpenDoors}
                    showLabels={preloaderDone}
                  />
                  <Preload all />
                </Suspense>
              )}
            </Canvas>
          </div>

          {/* Interactive HUD Overlay for Engineering Stations & Door Trigger */}
          {preloaderDone && !doorFinished && (
            <EntranceOverlayHUD
              selectedStation={selectedStation}
              onSelectStation={setSelectedStation}
              onOpenDoors={handleOpenDoors}
              isOpening={forceOpenDoors}
            />
          )}

          {/* 2D Preloader overlay */}
          <Preloader ready={sceneReady} onComplete={handlePreloaderComplete} />

          {/* Transition Text Animation - Rendered after door finishes */}
          {doorFinished && (
            <TransitionTextSequence onComplete={handleTransitionComplete} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
