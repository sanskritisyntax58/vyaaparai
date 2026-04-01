"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Check, Loader2, Download, ExternalLink, Zap, Globe } from "lucide-react";
import { useState } from "react";

interface DeploymentHubProps {
  startupName: string;
}

export default function DeploymentHub({ startupName }: DeploymentHubProps) {
  const [status, setStatus] = useState<"idle" | "deploying" | "success">("idle");
  const [steps, setSteps] = useState([
    { label: "Initializing Vercel Build", done: false },
    { label: "Optimizing Static Assets", done: false },
    { label: "Configuring Edge Network", done: false },
    { label: "Generating Production URL", done: false },
  ]);

  const handleDeploy = () => {
    setStatus("deploying");
    setSteps(prev => prev.map(s => ({ ...s, done: false })));
    let currentStep = 0;
    
    const interval = setInterval(() => {
      setSteps(prev => {
        const newSteps = [...prev];
        if (currentStep < newSteps.length) {
          newSteps[currentStep].done = true;
          currentStep++;
        }
        return newSteps;
      });

      if (currentStep === steps.length) {
        clearInterval(interval);
        setTimeout(() => setStatus("success"), 1000);
      }
    }, 1200);
  };

  return (
    <div className="py-20 flex flex-col items-center justify-center min-h-[600px] max-w-4xl mx-auto w-full">
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center"
          >
            <div className="w-28 h-28 bg-blue-500/10 border border-blue-500/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl relative">
               <div className="absolute inset-0 bg-blue-500/20 blur-3xl animate-pulse -z-10" />
               <Rocket className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-5xl font-black text-white mb-6 leading-tight tracking-tight">Ready for Launch?</h3>
            <p className="text-white/40 text-xl mb-12 max-w-2xl mx-auto leading-relaxed italic">
              Go from concept to live MVP in under 60 seconds. Our automated pipeline handles the cloud infrastructure and global edge network setup for {startupName}.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
              <button
                onClick={handleDeploy}
                className="bg-white text-black px-12 py-6 rounded-[2rem] font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_25px_60px_rgba(255,255,255,0.25)] flex items-center gap-4 group"
              >
                <Zap className="w-6 h-6 fill-black group-hover:scale-110 transition-transform" />
                Launch Live Server
              </button>
              <button className="bg-white/5 border border-white/10 hover:border-white/20 text-white/40 hover:text-white/80 px-12 py-6 rounded-[2rem] font-bold text-lg transition-all flex items-center gap-4 group">
                 <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                 Source Bundle
              </button>
            </div>
          </motion.div>
        )}

        {status === "deploying" && (
          <motion.div
            key="deploying"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-black/40 border border-white/10 backdrop-blur-3xl rounded-[3rem] p-16 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/5">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: "100%" }}
                 transition={{ duration: 5, ease: "linear" }}
                 className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 shadow-[0_0_20px_rgba(59,130,246,0.6)]"
               />
            </div>
            
            <div className="flex flex-col gap-10">
               <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-2xl font-black text-white mb-1">Magic In-Flight</h4>
                    <p className="text-xs font-black text-blue-500 uppercase tracking-[0.3em]">Processing Pipeline</p>
                  </div>
                  <div className="relative">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <div className="absolute inset-0 bg-blue-500/20 blur-lg animate-pulse" />
                  </div>
               </div>
               
               <div className="space-y-8">
                 {steps.map((step, i) => (
                   <div key={i} className={`flex items-center gap-6 transition-all duration-700 ${step.done ? 'opacity-100' : 'opacity-20'}`}>
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center border-2 transition-all duration-500 ${step.done ? 'bg-blue-500/20 border-blue-500 text-blue-400 scale-110' : 'bg-white/5 border-white/10'}`}>
                         {step.done ? <Check className="w-4 h-4 stroke-[3px]" /> : <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                      </div>
                      <span className={`text-lg font-bold transition-all ${step.done ? 'text-white' : 'text-white/40'}`}>
                        {step.label}
                      </span>
                   </div>
                 ))}
               </div>
            </div>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div 
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-600 border-4 border-white/20 rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-[0_30px_70px_rgba(34,197,94,0.4)]"
            >
               <Check className="w-12 h-12 text-white stroke-[3px]" />
            </motion.div>
            <h3 className="text-5xl font-black text-white mb-6 tracking-tight">Orbital Reached!</h3>
            <p className="text-white/40 text-xl mb-12 max-w-xl mx-auto leading-relaxed italic">
              Startup live. Your high-performance MVP is now globally accessible via our Edge Network. Investor demo mode active.
            </p>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between mb-10 gap-6 group cursor-pointer hover:bg-white/[0.08] transition-all max-w-lg mx-auto"
            >
               <div className="flex items-center gap-6 px-2">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Production URL</span>
                    <span className="text-lg font-black text-white/90">{startupName.toLowerCase().replace(/\s/g, "")}.vyapaar.ai</span>
                  </div>
               </div>
               <div className="bg-white/10 p-3 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-all text-white/20">
                  <ExternalLink className="w-6 h-6" />
               </div>
            </motion.div>
            
            <button
               onClick={() => setStatus("idle")}
               className="text-white/20 text-sm font-black uppercase tracking-[0.2em] hover:text-blue-400 transition-colors"
            >
               Initialize New Instance
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
