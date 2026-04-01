"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, TrendingUp, Map, BarChart3, Image as ImageIcon, 
  Rocket, Mic2, Sparkles, RefreshCw, Zap, LayoutDashboard
} from "lucide-react";
import TeamGallery from "./TeamGallery";
import FinancialCanvas from "./FinancialCanvas";
import RoadmapVisualizer from "./RoadmapVisualizer";
import MarketInsights from "./MarketInsights";
import ProductMockups from "./ProductMockups";
import DeploymentHub from "./DeploymentHub";
import VoicePitch from "./VoicePitch";

interface StartupSuiteProps {
  startup: any;
  businessPlan: any;
  onGenerate: (feature: string) => Promise<void>;
  loading: Record<string, boolean>;
}

export default function StartupSuite({ startup, businessPlan, onGenerate, loading }: StartupSuiteProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Suite Hub", icon: LayoutDashboard },
    { id: "team", label: "The Team", icon: Users },
    { id: "financials", label: "Financials", icon: TrendingUp },
    { id: "roadmap", label: "Roadmap", icon: Map },
    { id: "market", label: "Market", icon: BarChart3 },
    { id: "mockups", label: "Product", icon: ImageIcon },
    { id: "logo", label: "Brand Logo", icon: Zap },
    { id: "website", label: "Live Site", icon: LayoutDashboard },
    { id: "social", label: "Social Kit", icon: Rocket },
    { id: "pitch", label: "Voice Pitch", icon: Mic2 },
    { id: "launch", label: "Deployment", icon: Rocket },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="flex flex-col gap-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div>
                  <h3 className="text-4xl font-black text-white tracking-tighter">The Startup Suite</h3>
                  <p className="text-white/40 text-lg italic">Complete toolkit for {startup.businessName}</p>
               </div>
               <button 
                 onClick={() => onGenerate("all")}
                 disabled={Object.values(loading).some(v => v)}
                 className="bg-white text-black px-8 py-4 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-3"
               >
                 <Zap className="w-5 h-5 fill-black" />
                 Magic Launch (Batch Generate)
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {tabs.filter(t => t.id !== 'overview').map((tab) => {
                 const hasData = businessPlan?.[tab.id === 'market' ? 'competitors' : tab.id] || (tab.id === 'launch' || tab.id === 'pitch'); 
                 return (
                   <motion.button
                     key={tab.id}
                     whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
                     whileTap={{ scale: 0.98 }}
                     onClick={() => setActiveTab(tab.id)}
                     className={`bg-white/5 border border-white/10 rounded-[2rem] p-8 flex flex-col items-center gap-6 group transition-all ${hasData ? 'border-blue-500/30' : 'opacity-40'}`}
                   >
                     <div className={`p-5 rounded-2xl transition-all ${hasData ? 'bg-blue-500/20 text-blue-400 group-hover:scale-110' : 'bg-white/5 text-white/20'}`}>
                       <tab.icon className="w-10 h-10" />
                     </div>
                     <div className="text-center">
                       <div className="text-xl font-bold text-white mb-1 leading-none">{tab.label}</div>
                       <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                         {hasData ? "READY TO VIEW" : "PENDING"}
                       </div>
                     </div>
                   </motion.button>
                 );
               })}
            </div>
          </div>
        );
      case "team":
        return businessPlan?.team ? <TeamGallery team={JSON.parse(businessPlan.team)} /> : <EmptyState feature="team" onGenerate={() => onGenerate("team")} loading={loading.team} />;
      case "financials":
        return businessPlan?.financials ? <FinancialCanvas data={JSON.parse(businessPlan.financials)} /> : <EmptyState feature="financials" onGenerate={() => onGenerate("financials")} loading={loading.financials} />;
      case "roadmap":
        return businessPlan?.roadmap ? <RoadmapVisualizer milestones={JSON.parse(businessPlan.roadmap)} /> : <EmptyState feature="roadmap" onGenerate={() => onGenerate("roadmap")} loading={loading.roadmap} />;
      case "market":
        return businessPlan?.competitors ? <MarketInsights market={JSON.parse(businessPlan.competitors)} /> : <EmptyState feature="market" onGenerate={() => onGenerate("market")} loading={loading.market} />;
      case "mockups":
        return businessPlan?.mockups ? <ProductMockups mockups={JSON.parse(businessPlan.mockups)} /> : <EmptyState feature="mockups" onGenerate={() => onGenerate("mockups")} loading={loading.mockups} />;
      case "logo":
        return startup?.logoUrl ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="w-64 h-64 bg-black/40 border border-white/10 rounded-[3rem] p-12 mb-10 flex items-center justify-center shadow-2xl" dangerouslySetInnerHTML={{ __html: startup.logoUrl }} />
             <div className="flex gap-4">
                <button onClick={() => onGenerate("logo")} className="bg-white/5 border border-white/10 text-white px-8 py-3 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                   <RefreshCw className={`w-4 h-4 ${loading.logo ? 'animate-spin' : ''}`} />
                   Regenerate
                </button>
             </div>
          </div>
        ) : <EmptyState feature="logo" onGenerate={() => onGenerate("logo")} loading={loading.logo} />;
      case "website":
        return (
          <div className="flex flex-col items-center justify-center py-32 text-center">
             <div className="w-24 h-24 bg-blue-500/10 rounded-[2.5rem] border border-blue-500/20 flex items-center justify-center mb-10 relative">
                <LayoutDashboard className="w-12 h-12 text-blue-500" />
             </div>
             <h3 className="text-4xl font-black text-white mb-6 uppercase">Multi-Page MVP Site</h3>
             <p className="text-white/30 max-w-lg mb-12 italic text-lg leading-relaxed">
                Generate a fully functional, AI-editable website for your startup. Hosted live on our edge network.
             </p>
             <button onClick={() => onGenerate("website")} disabled={loading.website} className="bg-white text-black px-12 py-5 rounded-[2rem] font-black text-xl transition-all flex items-center gap-4 hover:scale-105 active:scale-95">
                {loading.website ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 fill-black" />}
                {loading.website ? "Architecting Site..." : "Generate MVP Website"}
             </button>
          </div>
        );
      case "social":
        return (
          <div className="flex flex-col items-center justify-center py-32 text-center">
             <div className="w-24 h-24 bg-purple-500/10 rounded-[2.5rem] border border-purple-500/20 flex items-center justify-center mb-10 relative">
                <Rocket className="w-12 h-12 text-purple-500" />
             </div>
             <h3 className="text-4xl font-black text-white mb-6 uppercase">Viral Launch Kit</h3>
             <p className="text-white/30 max-w-lg mb-12 italic text-lg leading-relaxed">
                Generate LinkedIn, Twitter, and Instagram posts to kickstart your startup's online presence.
             </p>
             <button onClick={() => onGenerate("social")} disabled={loading.social} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black text-xl transition-all flex items-center gap-4 hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(147,51,234,0.3)]">
                {loading.social ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-white" />}
                {loading.social ? "Crafting Posts..." : "Generate Launch Kit"}
             </button>
          </div>
        );
      case "pitch":
        return startup?.elevatorPitch ? (
          <VoicePitch 
            startupName={startup.businessName} 
            tagline={startup.tagline} 
            transcript={startup.elevatorPitch} 
          />
        ) : (
          <EmptyState 
            feature="pitch" 
            onGenerate={() => onGenerate("pitch")} 
            loading={loading.pitch} 
          />
        );
      case "launch":
        return <DeploymentHub startupName={startup.businessName} />;
      default:
        return null;
    }
  };

  return (
    <div className="mt-16 max-w-[1400px] mx-auto pb-32">
      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide no-scrollbar -mx-4 px-4 justify-start lg:justify-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl whitespace-nowrap transition-all font-black text-xs uppercase tracking-widest border ${activeTab === tab.id ? 'bg-white text-black border-white shadow-[0_20px_40px_rgba(255,255,255,0.1)]' : 'text-white/40 border-white/5 hover:border-white/20 hover:bg-white/5'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="bg-black/20 border border-white/10 rounded-[3.5rem] p-8 md:p-16 mt-6 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden min-h-[700px] flex flex-col backdrop-blur-3xl">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] -mr-80 -mt-80 pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 blur-[150px] -ml-80 -mb-80 pointer-events-none" />
         
         <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -20 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="relative z-10 flex-1"
            >
               {renderContent()}
            </motion.div>
         </AnimatePresence>
      </div>
    </div>
  );
}

function EmptyState({ feature, onGenerate, loading }: { feature: string, onGenerate: () => void, loading: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-40 text-center">
       <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center justify-center mb-10 relative">
          <div className="absolute inset-0 bg-blue-500/10 blur-2xl animate-pulse" />
          <Sparkles className="w-12 h-12 text-blue-500/40" />
       </div>
       <h3 className="text-4xl font-black text-white mb-6 uppercase tracking-tight">System Ready for Compute</h3>
       <p className="text-white/30 max-w-lg mx-auto mb-12 italic text-lg leading-relaxed">
          The neural networks require activation to architect your {feature} suite. Initiate the build sequence to generate high-fidelity startup assets.
       </p>
       <button
         onClick={onGenerate}
         disabled={loading}
         className="bg-white text-black px-12 py-5 rounded-[2rem] font-black text-xl transition-all flex items-center gap-4 shadow-[0_20px_50px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95"
       >
         {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-black" />}
         {loading ? "Computing Strategy..." : "Ignite AI Strategy"}
       </button>
    </div>
  );
}
