"use client";

import { motion } from "framer-motion";
import { Check, X, ShieldAlert, Zap, Globe, Target } from "lucide-react";

interface Competitor {
  name: string;
  strength: string;
  weakness: string;
}

interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface MarketInsightsProps {
  market: {
    competitors: Competitor[];
    swot: SWOT;
  };
}

export default function MarketInsights({ market }: MarketInsightsProps) {
  if (!market || !market.competitors || !market.swot) return null;

  return (
    <div className="py-8 flex flex-col gap-12 max-w-6xl mx-auto">
      {/* COMPETITOR CARDS */}
      <div>
        <div className="flex items-center gap-4 mb-8">
           <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Target className="w-6 h-6 text-amber-500" />
           </div>
           <div>
              <h3 className="text-2xl font-bold text-white leading-tight">Competitor Benchmarking</h3>
              <p className="text-white/40 text-sm">Strategic landscape and competitive advantages</p>
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {market.competitors.map((comp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group hover:bg-white/[0.08] transition-all"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-3xl -mr-12 -mt-12 group-hover:bg-amber-500/10 transition-all" />
              
              <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-sm font-black border border-white/5 text-amber-400">
                    0{i+1}
                 </div>
                 {comp.name}
              </h4>
              
              <div className="space-y-4">
                 <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-4 group-hover:border-green-500/20 transition-all">
                    <div className="flex items-center gap-2 mb-1">
                       <Check className="w-3 h-3 text-green-500" />
                       <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Strength</span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed font-medium">{comp.strength}</p>
                 </div>
                 
                 <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 group-hover:border-red-500/20 transition-all">
                    <div className="flex items-center gap-2 mb-1">
                       <X className="w-3 h-3 text-red-500" />
                       <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Weakness</span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed font-medium">{comp.weakness}</p>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* SWOT ANALYSIS */}
      <div className="mt-4">
         <div className="flex items-center gap-4 mb-8">
            <div className="bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
               <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <div>
               <h3 className="text-2xl font-bold text-white leading-tight">SWOT Matrix</h3>
               <p className="text-white/40 text-sm">Internal factors and external market forces</p>
            </div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {[
             { id: "S", label: "Strengths", items: market.swot.strengths, color: "text-blue-400", bgColor: "bg-blue-500", icon: Zap },
             { id: "W", label: "Weaknesses", items: market.swot.weaknesses, color: "text-red-400", bgColor: "bg-red-500", icon: ShieldAlert },
             { id: "O", label: "Opportunities", items: market.swot.opportunities, color: "text-green-400", bgColor: "bg-green-500", icon: Globe },
             { id: "T", label: "Threats", items: market.swot.threats, color: "text-amber-400", bgColor: "bg-amber-500", icon: ShieldAlert },
           ].map((section, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 + i * 0.1 }}
               className="bg-white/5 border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group hover:bg-white/[0.08] transition-all"
             >
                <div className={`absolute top-0 right-0 w-32 h-32 ${section.bgColor}/5 blur-3xl -mr-16 -mt-16 group-hover:${section.bgColor}/10 transition-all`} />
                <div className="flex items-center justify-between mb-8">
                   <div className={`w-12 h-12 rounded-2xl ${section.bgColor}/10 flex items-center justify-center border border-white/5`}>
                      <section.icon className={`w-6 h-6 ${section.color}`} />
                   </div>
                   <span className="text-4xl font-black text-white/5 group-hover:text-white/10 transition-all font-sans">{section.id}</span>
                </div>
                
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-3">{section.label}</h4>
                
                <div className="space-y-4">
                   {section.items.map((item, ii) => (
                     <div key={ii} className="flex items-start gap-3 text-sm text-white/50 group-hover:text-white/80 transition-colors">
                        <div className={`w-1.5 h-1.5 rounded-full ${section.bgColor} mt-1.5 shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
                        <span className="font-medium leading-relaxed">{item}</span>
                     </div>
                   ))}
                </div>
             </motion.div>
           ))}
         </div>
      </div>
    </div>
  );
}
