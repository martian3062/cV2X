"use client";

import React, { useState, useEffect } from 'react';
import { ThreeScene } from './ThreeScene';
import { AccuracyRadar } from './AccuracyRadar';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Activity, Gauge, Terminal, Wifi, Shield, Radio, Cpu, Smartphone, Navigation, Box, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

/**
 * Premium Glassmorphic Metric Pod
 */
const MetricPod = ({ title, value, unit, icon: Icon, color, detail }: any) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="bg-black/60 backdrop-blur-3xl border border-white/10 p-4 rounded-2xl shadow-2xl group hover:border-blue-500/30 transition-all duration-500 flex flex-col gap-3"
  >
    <div className="flex items-center justify-between">
      <div className={`p-2 rounded-xl ${color} bg-opacity-20 backdrop-blur-md shadow-lg shadow-black/20`}>
         <Icon className={`w-4 h-4 ${color.replace('bg-', 'text-')}`} />
      </div>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-bold font-mono tracking-tighter text-white drop-shadow-lg">{value}</span>
      <span className="text-blue-500/60 text-[11px] font-black uppercase tracking-widest">{unit}</span>
    </div>
    {detail && <div className="text-[8px] font-mono text-slate-500 border-t border-white/10 pt-2 uppercase tracking-tighter">{detail}</div>}
  </motion.div>
);

/**
 * Live Detection Stream Component
 */
const DetectionSidebar = ({ detections }: { detections: any[] }) => (
    <div className="flex flex-col gap-2 w-full mt-4">
        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Live Object Stream</label>
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto no-scrollbar pr-2">
            <AnimatePresence>
                {(detections || []).map((obj, i) => (
                    <motion.div 
                        key={`${obj.label}-${i}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white/5 border-l-2 border-blue-500 p-2 rounded flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <Box className="w-3 h-3 text-blue-400" />
                            <span className="text-[10px] font-bold text-white uppercase">{obj.label}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{obj.distance.toFixed(1)}M</span>
                    </motion.div>
                ))}
            </AnimatePresence>
            {(!detections || detections.length === 0) && (
                <div className="text-[10px] font-mono text-slate-600 italic ml-1">Scanning field...</div>
            )}
        </div>
    </div>
);

import { AnalyticsPanel } from './AnalyticsPanel';

export const Dashboard = () => {
  const { data, isConnected } = useWebSocket('ws://localhost:8002/ws/stream');
  const { hud, setHUD } = useStore();

  return (
    <div className="h-screen w-screen overflow-hidden bg-black text-slate-200 selection:bg-blue-500 overflow-y-auto lg:overflow-hidden">
      
      {/* MAIN RESPONSIVE GRID (70/30 Desk) */}
      <div 
        className="relative h-full w-full" 
        style={{ display: 'flex', flexDirection: 'row', width: '100vw', height: '100vh', overflow: 'hidden' }}
      >
        
        {/* LEFT PORTION (70%): HIGH-FIDELITY SIMULATION */}
        <div style={{ width: '70vw', height: '100vh', position: 'relative', borderRight: '1px solid rgba(255,255,255,0.05)', backgroundColor: '#0a0a0a' }}>
             {/* 3D VIEWPORT (Contained in grid cell) */}
             <div className="w-full h-full">
                <ThreeScene overlayImageUrl={data?.overlay} />
             </div>

             {/* TACTICAL HUD OVERLAY (Locked to Sim area) */}
             <div className="absolute inset-0 z-10 pointer-events-none p-8 flex flex-col justify-between">
                <header className="flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-gradient-to-tr from-blue-700 to-indigo-700 rounded-2xl shadow-xl shadow-blue-900/40">
                            <Navigation className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">MAHE <span className="text-blue-500">NexSim</span> v2</h1>
                            <div className="flex items-center gap-4 text-[9px] font-black uppercase text-slate-400 tracking-widest mt-1">
                                <span className={isConnected ? "text-emerald-400" : "text-rose-400"}>
                                    {isConnected ? '📡 UPLINK_SYNC' : '📡 LINK_LOSS'}
                                </span>
                                <span className="opacity-20">|</span>
                                <span>LATENCY: {data?.metrics?.latency_ms || '0'}ms</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex items-end justify-between pointer-events-auto">
                    <div className="flex flex-col gap-4 w-64">
                         <div className="bg-black/80 backdrop-blur-3xl border border-white/10 p-4 rounded-2xl shadow-2xl">
                             <div className="flex items-center justify-between mb-4">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ego_Pose_4D</span>
                                <Radio className="w-3 h-3 text-blue-500 animate-pulse" />
                             </div>
                             <div className="grid grid-cols-1 gap-2 font-mono text-[10px]">
                                <div className="flex justify-between bg-white/5 p-2 rounded">
                                    <span className="text-slate-500">TRANS_Z</span>
                                    <span className="text-white">{data?.sensor_data?.ego_pose?.translation?.[2]?.toFixed(2) || '0.00'}M</span>
                                </div>
                             </div>
                             <DetectionSidebar detections={data?.sensor_data?.detections || []} />
                         </div>
                    </div>

                    <button 
                       onClick={() => setHUD({ isManualMode: !hud.isManualMode })}
                       className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-500 pointer-events-auto
                         ${hud.isManualMode 
                           ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]' 
                           : 'bg-black/80 border-white/10 text-slate-400 hover:text-white backdrop-blur-2xl'}`}
                    >
                       {hud.isManualMode ? 'Manual Override' : 'AI Autonomous'}
                    </button>
                </div>
             </div>
        </div>

        {/* RIGHT PORTION (30%): TRAINED MODEL ANALYTICS & DIAGNOSTICS */}
        <div style={{ width: '30vw', height: '100vh', backgroundColor: '#000', borderLeft: '1px solid rgba(255,255,255,0.1)', position: 'relative', zIndex: 20, overflowY: 'auto' }}>
             <AnalyticsPanel />
        </div>

      </div>
    </div>
  );
};
