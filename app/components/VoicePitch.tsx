"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, FastForward, Rewind, Volume2, Mic2, Sparkles, Activity } from "lucide-react";
import { useState, useEffect } from "react";

interface VoicePitchProps {
  startupName: string;
  tagline: string;
  transcript?: string;
}

export default function VoicePitch({ startupName, tagline, transcript }: VoicePitchProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      // SPEECH SYNTHESIS
      const speech = new SpeechSynthesisUtterance(transcript || defaultTranscript);
      speech.rate = 0.9;
      speech.pitch = 1;
      speech.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(speech);

      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.2;
        });
      }, 100);
    } else {
      window.speechSynthesis.cancel();
    }
    return () => {
      clearInterval(interval);
      window.speechSynthesis.cancel();
    };
  }, [isPlaying]);

  useEffect(() => {
    const totalSeconds = 60;
    const currentSeconds = Math.floor((progress / 100) * totalSeconds);
    const mins = Math.floor(currentSeconds / 60);
    const secs = currentSeconds % 60;
    setCurrentTime(`${mins}:${secs.toString().padStart(2, '0')}`);
  }, [progress]);

  const defaultTranscript = `Hi, I'm the founder of ${startupName}. We're on a mission to ${tagline}. Our platform leverages state-of-the-art AI to solve the most critical challenges in the industry. Imagine a world where ${startupName} is the standard for innovation and efficiency. We're raising our seed round to scale this vision globally. Let's build the future together.`;

  return (
    <div className="w-full max-w-4xl mx-auto py-4 flex flex-col gap-10">
      {/* HEADER SECTION */}
      <div className="text-center space-y-4">
         <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <Activity className="w-3 h-3" />
            AI Audio Interface Active
         </div>
         <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase whitespace-nowrap">The Founder Pitch</h2>
         <p className="text-white/40 italic text-lg">{startupName} &mdash; 60-second summary</p>
      </div>

      {/* PLAYER & VISUALIZER */}
      <div className="relative group/player">
        <div className="absolute inset-0 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-[3.5rem] p-10 md:p-16 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-3xl -mr-32 -mt-32" />
           
           <div className="flex flex-col items-center gap-12">
              {/* WAVEFORM */}
              <div className="flex items-center justify-center gap-1.5 h-24 w-full">
                {[...Array(40)].map((_, i) => (
                   <motion.div
                     key={i}
                     animate={{ 
                       height: isPlaying ? [15, 60, 25, 80, 30] : 12,
                       opacity: isPlaying ? 1 : 0.1,
                       backgroundColor: isPlaying ? "#3b82f6" : "#ffffff"
                     }}
                     transition={{ 
                       duration: 0.8 + Math.random(), 
                       repeat: Infinity, 
                       delay: i * 0.02,
                       ease: "easeInOut"
                     }}
                     className="w-1.5 md:w-2 rounded-full"
                   />
                ))}
              </div>

              {/* PROGRESS & CONTROLS */}
              <div className="w-full flex flex-col md:flex-row items-center gap-10">
                 <div className="flex-1 w-full space-y-4">
                    <div className="flex justify-between items-end">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Elapsed Time</span>
                          <span className="text-2xl font-medium text-white tabular-nums leading-none">{currentTime}</span>
                       </div>
                       <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Duration</span>
                          <span className="text-2xl font-medium text-white tabular-nums leading-none">1:00</span>
                       </div>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                         animate={{ width: `${progress}%` }}
                         className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                       />
                    </div>
                 </div>

                 <div className="flex items-center gap-6">
                    <button className="p-4 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-2xl transition-all"><Rewind className="w-6 h-6" /></button>
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl group/play"
                    >
                       {isPlaying ? <Pause className="w-10 h-10 fill-black" /> : <Play className="w-10 h-10 fill-black ml-1 group-hover/play:scale-110 transition-transform" />}
                    </button>
                    <button className="p-4 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-2xl transition-all"><FastForward className="w-6 h-6" /></button>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* TRANSCRIPT BOX */}
      <div className="space-y-6">
         <div className="flex items-center gap-3 px-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">Neural Transcript</h4>
         </div>
         <div className="bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-10 md:p-12 relative group shadow-inner">
            <div className="absolute top-8 right-8 text-blue-500/20"><Volume2 className="w-8 h-8" /></div>
            <p className="text-xl md:text-2xl text-white/80 leading-[1.7] font-medium selection:bg-blue-500/30">
               <span className="text-blue-400 text-5xl font-serif inline-block -mt-4 mr-2">“</span>
               {transcript || defaultTranscript}
            </p>
            <div className="mt-12 flex items-center gap-4 text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
               <div className="w-8 h-px bg-white/10" />
               Generated from Startup Core Model v4.2
            </div>
         </div>
      </div>
    </div>
  );
}
