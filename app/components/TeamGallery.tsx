"use client";

import { motion } from "framer-motion";
import { Code, Users, Share2, Mail } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  skills: string[];
  image: string;
}

interface TeamGalleryProps {
  team: TeamMember[];
}

export default function TeamGallery({ team }: TeamGalleryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
      {team.map((member, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/10 transition-all overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-colors" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-2xl overflow-hidden mb-6 border-2 border-white/10 p-1 bg-black/40">
               <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-transparent">
                  <span className="text-3xl font-black text-white/20">{member.name.charAt(0)}</span>
               </div>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-1 leading-tight">{member.name}</h3>
            <p className="text-blue-400 font-bold text-sm uppercase tracking-widest mb-4">{member.role}</p>
            
            <p className="text-white/60 text-sm leading-relaxed mb-6 italic">
              "{member.bio}"
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {member.skills.map((skill, si) => (
                <span key={si} className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold text-white/50 uppercase tracking-tight">
                  {skill}
                </span>
              ))}
            </div>
            
            <div className="flex items-center gap-4 border-t border-white/5 pt-6 w-full justify-center">
               <button className="text-white/30 hover:text-white transition-colors"><Users className="w-5 h-5" /></button>
               <button className="text-white/30 hover:text-white transition-colors"><Share2 className="w-5 h-5" /></button>
               <button className="text-white/30 hover:text-white transition-colors"><Code className="w-5 h-5" /></button>
               <button className="text-white/30 hover:text-white transition-colors"><Mail className="w-5 h-5" /></button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
