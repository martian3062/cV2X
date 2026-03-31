"use client";

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { ChartNoAxesCombined as Activity, Target, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * AI Training Analytics Suite
 * Optimized for real-time visualization of model convergence.
 */
export const AnalyticsPanel = () => {
    const [metrics, setMetrics] = useState<any[]>([]);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await fetch('http://localhost:8002/api/metrics');
                if (!res.ok) throw new Error("API not ok");
                const data = await res.json();
                setMetrics(data || []);
            } catch (err) {
                console.warn("Metrics uplink paused/waiting on Python backend.");
            }
        };

        const interval = setInterval(fetchMetrics, 2000);
        return () => clearInterval(interval);
    }, []);

    // Current Class Performance (Radar Data) - with robust fallbacks
    const latest = metrics.length > 0 ? metrics[metrics.length - 1] : { class_stats: { vehicles: 0, pedestrians: 0, road: 0 }, loss: 0, miou: 0 };
    
    // Safety check for empty objects
    const statsData = Object.keys(latest.class_stats || {}).length > 0 
        ? latest.class_stats 
        : { vehicles: 0, pedestrians: 0, road: 0 };

    const radarData = Object.entries(statsData).map(([key, val]) => ({
        subject: key.toUpperCase(),
        A: (val as number) * 100,
        fullMark: 100,
    }));

    return (
        <div className="flex flex-col gap-6 h-full p-6">
            
            {/* PANEL HEADER */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white italic">Neural_Diagnostics</h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Telemetry</span>
                </div>
            </div>

            {/* TRAINING LOSS (LINE CHART) */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Convergence_Loss</span>
                    <span className="text-rose-400 font-mono text-[12px] font-bold drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">
                        -{Number(latest.loss || 0).toFixed(4)}
                    </span>
                </div>
                <div className="h-32 w-full bg-gradient-to-br from-black/80 to-indigo-950/20 rounded-2xl border border-white/5 p-2 overflow-hidden shadow-inner">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={metrics.length > 0 ? metrics : [{ loss: 0 }]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#333', fontSize: '10px', backdropFilter: 'blur(10px)', borderRadius: '8px' }} />
                            <Line type="monotone" dataKey="loss" stroke="#f43f5e" strokeWidth={3} dot={false} isAnimationActive={true} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* mIoU ACCURACY (AREA CHART) */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mean_IoU_Score</span>
                    <span className="text-emerald-400 font-mono text-[12px] font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                        {(Number(latest.miou || 0) * 100).toFixed(1)}%
                    </span>
                </div>
                <div className="h-32 w-full bg-gradient-to-tr from-black/80 to-emerald-950/20 rounded-2xl border border-white/5 p-2 overflow-hidden shadow-inner">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={metrics.length > 0 ? metrics : [{ miou: 0 }]}>
                            <defs>
                                <linearGradient id="colorIoU" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#333', fontSize: '10px', backdropFilter: 'blur(10px)', borderRadius: '8px' }} />
                            <Area type="monotone" dataKey="miou" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIoU)" isAnimationActive={true} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* RADAR CHART (CLASS PERFORMANCE) */}
            <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Perception_Radar</span>
                <div className="h-[220px] w-full bg-gradient-to-b from-indigo-950/20 to-black/80 rounded-3xl border border-white/5 p-4 flex items-center justify-center relative shadow-2xl overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                            <PolarGrid stroke="#444" strokeDasharray="3 3" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#818cf8', fontSize: 9, fontWeight: 900 }} />
                            <Radar name="Accuracy" dataKey="A" stroke="#818cf8" strokeWidth={2} fill="#818cf8" fillOpacity={0.4} />
                        </RadarChart>
                    </ResponsiveContainer>
                    {/* ACCURACY BADGE */}
                    <div className="absolute top-4 right-4 bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/30 backdrop-blur-md">
                        <Target className="w-3 h-3 text-indigo-400" />
                    </div>
                </div>
            </div>

            {/* PERFORMANCE LOG */}
            <div className="flex flex-col gap-2 mt-auto pt-4">
                <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-3 h-3 text-slate-600" />
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Hardware_State</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/5">
                        <div className="text-[8px] text-slate-500 font-bold uppercase mb-1 tracking-widest">Compute Node</div>
                        <div className="text-xs font-mono font-bold text-indigo-300 drop-shadow-md">NVIDIA_L4_VRAM</div>
                    </div>
                    <div className="p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                        <div className="text-[8px] text-slate-500 font-bold uppercase mb-1 tracking-widest pl-2">System Status</div>
                        <div className="text-xs font-mono font-bold text-white tracking-tighter pl-2 animate-pulse">OPTIMIZED</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
