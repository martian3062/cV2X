"use client";

import React, { memo } from 'react';
import { useStore } from '../store/useStore';
import { Share2 as SteeringWheel, AlertCircle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

/**
 * Cinematic Overdrive HUD
 * Provides translucent, glassmorphic directional keys and control hints 
 * exactly as shown in the requested simulator screenshot.
 */
export const DrivingControlsUI = memo(() => {
    const isManualMode = useStore(state => state.hud.isManualMode);
    const speed = useStore(state => state.vehicle.speed);
    
    if (!isManualMode) return null;

    // Helper for interactive key caps
    const GlassKey = ({ label, icon: Icon, active = false }: any) => (
        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-1 backdrop-blur-md transition-all duration-200 pointer-events-auto cursor-none
            ${active 
                ? 'bg-white/30 border-white text-white shadow-[0_0_20px_rgba(255,255,255,0.5)] scale-95' 
                : 'bg-black/40 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/50'
            }`}
        >
            {label && <span className="text-sm md:text-lg font-mono font-bold">{label}</span>}
            {Icon && <Icon className="w-4 h-4 md:w-6 md:h-6 opacity-80" />}
        </div>
    );

    const speedKmH = Math.round(speed * 3.6); // Base speed unit conversion

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center overflow-hidden z-[60]">
            
            {/* TOP: GAS */}
            <div className="absolute top-[15%] flex flex-col items-center gap-3">
                <span className="text-[10px] md:text-xs font-black text-white/80 uppercase tracking-[0.3em] font-mono">GAS</span>
                <div className="flex gap-4">
                    <GlassKey label="W" />
                    <GlassKey icon={ArrowUp} />
                </div>
            </div>

            {/* MIDDLE: BRAKE & REVERSE */}
            <div className="absolute top-[35%] flex flex-col items-center gap-3">
                <span className="text-[10px] md:text-xs font-black text-white/50 uppercase tracking-[0.3em] font-mono">BRAKE / REVERSE</span>
                <div className="flex gap-4">
                    <GlassKey label="S" />
                    <GlassKey icon={ArrowDown} />
                </div>
            </div>

            {/* LOWER MIDDLE: STEERING W/ WHEEL SPEEDOMETER */}
            <div className="absolute top-[55%] flex flex-col items-center w-full">
                <span className="text-[10px] md:text-xs font-black text-white/80 uppercase tracking-[0.3em] font-mono mb-4">STEER</span>
                <div className="flex items-center gap-6 md:gap-12 relative w-full justify-center max-w-2xl px-4">
                    <div className="flex items-center gap-4">
                        <span className="text-[9px] md:text-[11px] font-black text-white/50 uppercase tracking-[0.2em] font-mono">LEFT</span>
                        <div className="flex gap-2">
                           <GlassKey label="A" />
                           <GlassKey icon={ArrowLeft} />
                        </div>
                    </div>
                    
                    {/* CENTER SPEED RING (Visual Anchor) */}
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/10 flex items-center justify-center relative backdrop-blur-sm shadow-2xl">
                         <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent rounded-b-full"></div>
                         <div className="flex flex-col items-center z-10">
                             <span className="text-2xl md:text-4xl font-mono font-black text-white drop-shadow-lg">{Math.abs(speedKmH)}</span>
                             <span className="text-[8px] md:text-[10px] font-black text-blue-400 uppercase tracking-widest">km/h</span>
                         </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                           <GlassKey label="D" />
                           <GlassKey icon={ArrowRight} />
                        </div>
                        <span className="text-[9px] md:text-[11px] font-black text-white/50 uppercase tracking-[0.2em] font-mono">RIGHT</span>
                    </div>
                </div>
            </div>

            {/* BOTTOM: INTEGRITY BAR (Like the screenshot) */}
            <div className="absolute bottom-8 flex flex-col items-center gap-2 w-full max-w-md px-4">
                <div className="flex items-center justify-between w-full text-[9px] font-black text-white/70 uppercase tracking-widest font-mono">
                     <span className="flex items-center gap-2">
                         <div className="p-1 bg-blue-500/20 rounded">
                             <AlertCircle className="w-3 h-3 text-blue-400" />
                         </div>
                         INTEGRITY: 100%
                     </span>
                     <span>STATUS: OPTIMAL</span>
                </div>
                <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/10 flex gap-0.5">
                     {/* Segmented health bar */}
                     {[...Array(20)].map((_, i) => (
                         <div key={i} className="flex-1 h-full bg-blue-500/80 skew-x-[-20deg]" />
                     ))}
                </div>
                <div className="mt-2 text-[8px] font-mono font-bold text-white/40 tracking-[0.2em] uppercase">
                     Press [M] anytime to toggle AI Uplink
                </div>
            </div>
            
        </div>
    );
});
