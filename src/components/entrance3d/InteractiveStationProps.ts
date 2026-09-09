import React from 'react';

export interface StationData {
  id: string;
  name: string;
  category: string;
  status: string;
  spec: string;
  accentColor: string;
  description: string;
}

export const ENTRANCE_STATIONS: Record<string, StationData> = {
  server: {
    id: 'server',
    name: 'MKRD Edge Core Alpha',
    category: 'Enterprise Cloud & Compute Node',
    status: 'ONLINE • 99.99% UPTIME',
    spec: '128-Core Neural Array • 100 Gbps Low-Latency Mesh',
    accentColor: '#38bdf8',
    description: 'High-density computational cluster executing real-time FEA structural simulation and enterprise IoT telemetry.'
  },
  printer: {
    id: 'printer',
    name: 'MKRD Additive Fab Pro-X',
    category: 'Industrial 3D Additive Cell',
    status: 'PRINTING • LAYER 384/520',
    spec: 'Dual Extrusion • Carbon-PEEK & Titanium Sintering',
    accentColor: '#06b6d4',
    description: 'Micron-precision additive fabrication chamber with automated heated bed leveling and laser layer inspection.'
  },
  workstation: {
    id: 'workstation',
    name: 'CAD Precision Workstation',
    category: 'High-Performance Engineering Rig',
    status: 'ACTIVE • 3D SIMULATION LIVE',
    spec: 'Dual 4K Curved Displays • RTX Quadro Accelerated',
    accentColor: '#818cf8',
    description: 'Engineers terminal running solid-state mould geometry calculations, aerodynamic flow analysis, and toolpath generation.'
  },
  robot: {
    id: 'robot',
    name: '6-Axis Actuator Arm',
    category: 'Robotic Automation & Milling Unit',
    status: 'CALIBRATED • ±0.002mm ACCURACY',
    spec: 'High-Torque Harmonic Drives • Optical Laser Alignment',
    accentColor: '#f59e0b',
    description: 'Multi-axis articulated robotic end-effector for automated pick-and-place, laser scanning, and micro-precision finishing.'
  }
};
