"use client";

import { motion } from "framer-motion";
import { Circle } from "lucide-react";

interface Milestone {
  month: number;
  title: string;
  description: string;
  tasks: string[];
}

interface RoadmapVisualizerProps {
  milestones: Milestone[];
}

export default function RoadmapVisualizer({ milestones }: RoadmapVisualizerProps) {
  if (!milestones || !Array.isArray(milestones)) return null;

  return (
    <div className="py-12 relative max-w-6xl mx-auto">
      {/* VERTICAL LINE */}
      <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-purple-500/30 via-cyan-500/20 to-transparent md:-translate-x-1/2" />
      
      <div className="space-y-12 relative z-10">
        {milestones.map((ms, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
            className={`relative flex flex-col md:flex-row items-start gap-8 md:gap-0 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
          >
            {/* DOT */}
            <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-blue-500 border-4 border-black z-20 -translate-x-1/2 mt-8 shadow-[0_0_20px_rgba(59,130,246,0.8)]" />
            
            {/* CONTENT CARD */}
            <div className="flex-1 w-full pl-16 md:pl-0 md:w-[45%]">
              <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] p-8 hover:bg-white/10 transition-all group overflow-hidden relative shadow-2xl">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 blur-3xl -mr-20 -mt-20 group-hover:bg-blue-500/10 transition-colors" />
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                   <div className="flex flex-col">
                      <span className="text-4xl font-black text-white/5 group-hover:text-white/10 transition-colors">0{ms.month}</span>
                   </div>
                   <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-1 rounded-full">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Month {ms.month}</span>
                   </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3 relative z-10 group-hover:text-blue-400 transition-colors">{ms.title}</h3>
                <p className="text-white/40 text-sm mb-6 leading-relaxed relative z-10 italic">
                  {ms.description}
                </p>
                
                <div className="space-y-4 relative z-10">
                  {ms.tasks.map((task, ti) => (
                    <div key={ti} className="flex items-center gap-3 text-sm text-white/70">
                       <div className="w-1.5 h-1.5 rounded-full bg-blue-400/30 group-hover:bg-blue-400 transition-colors" />
                       <span className="font-medium">{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* SPACER FOR ALTERNATING LAYOUT */}
            <div className="flex-1 hidden md:block w-1/2" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
