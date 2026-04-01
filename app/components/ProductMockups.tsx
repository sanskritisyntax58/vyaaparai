"use client";

import { motion } from "framer-motion";
import { Maximize2, ExternalLink, Sparkles, Image as ImageIcon } from "lucide-react";

interface Mockup {
  title: string;
  description: string;
  imagePrompt: string;
  url: string;
}

interface ProductMockupsProps {
  mockups: Mockup[];
}

export default function ProductMockups({ mockups }: ProductMockupsProps) {
  if (!mockups || !Array.isArray(mockups)) return null;

  return (
    <div className="py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {mockups.map((mockup, i) => (
        <motion.div
           key={i}
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: i * 0.1 }}
           className="group relative bg-white/[0.03] border border-white/10 rounded-[2.5rem] overflow-hidden hover:bg-white/[0.05] transition-all hover:border-white/20 shadow-2xl"
        >
           {/* IMAGE AREA */}
           <div className="aspect-[4/3] bg-black/40 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
              
              {/* SHIMMER LOAD EFFECT */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-out" />
              
              <div className="flex flex-col items-center gap-4 text-white/5 group-hover:text-white/10 transition-all duration-700">
                 <ImageIcon className="w-20 h-20 group-hover:scale-110 transition-transform" />
                 <span className="text-[10px] font-black uppercase tracking-[0.4em]">{mockup.title.split(" ").join("  ")}</span>
              </div>
              
              <div className="absolute bottom-6 left-8 right-8 z-20 flex justify-between items-end">
                 <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">
                    High-Fidelity Preview
                 </div>
                 <button className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 duration-500">
                    <Maximize2 className="w-5 h-5" />
                 </button>
              </div>
           </div>
           
           {/* TEXT AREA */}
           <div className="p-10">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-500">
                    <Sparkles className="w-4 h-4" />
                 </div>
                 <h4 className="text-2xl font-black text-white tracking-tight leading-none group-hover:text-blue-400 transition-colors">{mockup.title}</h4>
              </div>
              <p className="text-sm text-white/40 leading-relaxed italic mb-8 min-h-[4rem]">
                 "{mockup.description}"
              </p>
              
              <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Asset Generation</span>
                    <span className="text-[10px] font-bold text-white/60">Professional UI/UX</span>
                 </div>
                 <button className="flex items-center gap-3 text-[11px] font-black text-white/40 hover:text-white transition-all uppercase tracking-[0.2em] group/btn">
                    Details <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                 </button>
              </div>
           </div>
        </motion.div>
      ))}
    </div>
  );
}
