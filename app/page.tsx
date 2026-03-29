"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wand2, Play, Sparkles, Code, Orbit, Copy, Download, RefreshCw, LayoutDashboard,
  Presentation, FileText, X
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [startup, setStartup] = useState<any>(null);
  
  // UI Display states
  const [website, setWebsite] = useState("");
  const [logo, setLogo] = useState("");
  const [marketingPlan, setMarketingPlan] = useState("");
  const [pitchDeck, setPitchDeck] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [viewingModal, setViewingModal] = useState<"marketing" | "pitch" | null>(null);

  const [loading, setLoading] = useState<Record<string, boolean>>({
    startup: false,
    website: false,
    logo: false,
    marketing: false,
    pitch: false
  });
  
  const [theme, setTheme] = useState("blue");

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      setHistory(data || []);
    } catch(e) {}
  }

  function setLoad(key: string, val: boolean) {
    setLoading(prev => ({ ...prev, [key]: val }));
  }

  function loadPastStartup(past: any) {
    setStartup(past);
    setIdea(past.ideaPrompt || "");
    setTheme(past.theme || "blue");
    setLogo(past.logoUrl || "");
    setWebsite(past.website?.html || "");
    setMarketingPlan(past.businessPlan?.marketingPlan || "");
    setPitchDeck(past.businessPlan?.pitchDeck || "");
  }

  async function generateStartup() {
    if (!idea) return;
    setLoad("startup", true);
    setStartup(null);
    setWebsite("");
    setLogo("");
    setMarketingPlan("");
    setPitchDeck("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, theme })
      });
      const data = await res.json();
      setStartup(data);
      fetchHistory();
    } catch (e) {
      console.error(e);
    }
    setLoad("startup", false);
  }

  async function generateFeature(endpoint: string, stateKey: string, setter: any, modalToOpen?: "marketing"|"pitch") {
    if(!startup?.id) return;
    setLoad(stateKey, true);
    try {
      const res = await fetch(`/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId: startup.id })
      });
      const data = await res.json();
      
      if(stateKey === "website") {
         setter(data.html);
         setTimeout(() => {
            document.getElementById("preview")?.scrollIntoView({ behavior: "smooth" });
         }, 300);
      } else if(stateKey === "logo") {
         setter(data.svg);
      } else {
         setter(data.markdown);
         if(modalToOpen) setViewingModal(modalToOpen);
      }
      
    } catch(e) { console.error(e); }
    setLoad(stateKey, false);
  }

  function resetApp() {
    setIdea("");
    setStartup(null);
    setWebsite("");
    setLogo("");
    setMarketingPlan("");
    setPitchDeck("");
  }

  function copyText(val: string) {
    navigator.clipboard.writeText(val);
    alert("Copied to clipboard!");
  }

  const themeGradients: Record<string, string> = {
    blue: "from-blue-900 via-slate-900 to-slate-950",
    purple: "from-purple-900 via-slate-900 to-slate-950",
    dark: "from-slate-900 via-black to-slate-950",
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeGradients[theme] || themeGradients.blue} text-white selection:bg-white/30 font-sans transition-colors duration-1000`}>
      <div className="flex h-screen overflow-hidden relative">
        
        {/* SIDEBAR */}
        <motion.aside 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-72 bg-white/5 backdrop-blur-xl border-r border-white/10 hidden lg:flex flex-col p-6 shadow-2xl relative z-20 shrink-0"
        >
          <div className="flex items-center gap-3 mb-12 cursor-pointer" onClick={resetApp}>
            <div className="bg-gradient-to-br from-blue-400 to-purple-500 p-2 rounded-xl">
              <Orbit className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              VyapaarAI
            </h2>
          </div>

          <div className="flex flex-col gap-3 mb-8">
            <button onClick={resetApp} className="flex items-center justify-between px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all font-medium text-left shadow-lg shadow-blue-500/20">
              <span className="flex items-center gap-3">
                <Wand2 className="w-5 h-5 text-white" />
                New Startup
              </span>
            </button>
          </div>
          
          <div className="text-sm font-semibold text-white/50 mb-3 uppercase tracking-widest px-2">History</div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-2">
            {history.length === 0 && <div className="text-white/30 text-sm px-2">No past generations.</div>}
            {history.map((h, i) => (
               <div 
                 key={i} 
                 onClick={() => loadPastStartup(h)}
                 className="cursor-pointer px-4 py-3 rounded-xl bg-black/20 hover:bg-white/10 transition-colors border border-white/5 flex flex-col gap-1"
               >
                 <div className="font-medium text-white/90 truncate">{h.businessName}</div>
                 <div className="text-xs text-white/40 truncate">{h.createdAt ? new Date(h.createdAt).toLocaleDateString() : ""}</div>
               </div>
            ))}
          </div>

          <div className="mt-8 text-xs text-white/30 flex items-center justify-center pt-4 border-t border-white/5">
            Powered by Prisma & Groq Llama 3
          </div>
        </motion.aside>

        {/* MAIN AREA */}
        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
          
          <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
          <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

          <div className="max-w-4xl mx-auto p-4 md:p-12 relative z-10 pb-32">
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-4 md:mt-12 mb-12 text-center"
            >
              <div className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/50 mb-6 backdrop-blur-sm">
                AI Business Architect
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                Turn any idea into a <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500">
                  Fundable Startup
                </span>
              </h1>
            </motion.div>

            {/* INPUT CARD */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
              className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-4 flex flex-col md:flex-row gap-3 shadow-[0_0_40px_rgba(0,0,0,0.3)] sticky top-4 z-30"
            >
              <input
                type="text"
                value={idea}
                onChange={e => setIdea(e.target.value)}
                placeholder="Describe an idea (e.g. Uber for space debris)..."
                className="flex-1 bg-transparent border-none text-lg text-white placeholder-white/40 focus:ring-0 focus:outline-none px-4 py-3 min-w-0"
                onKeyDown={(e) => { if (e.key === "Enter") generateStartup(); }}
              />
              <button 
                onClick={generateStartup}
                disabled={loading.startup || !idea}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shrink-0"
              >
                {loading.startup ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                {loading.startup ? "Architecting..." : "Architect"}
              </button>
            </motion.div>

            {/* RESULTS */}
            <AnimatePresence mode="wait">
              {startup && (
                <motion.div 
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -40, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 80, delay: 0.1 }}
                  className="mt-12 bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl relative"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
                      {/* Logo Container */}
                      <div className="w-24 h-24 shrink-0 bg-black/50 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden">
                        {loading.logo ? (
                           <RefreshCw className="w-6 h-6 text-white/50 animate-spin" />
                        ) : logo ? (
                           <div className="w-full h-full p-2 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: logo }} />
                        ) : (
                           <Sparkles className="w-8 h-8 text-white/20" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                           <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">{startup.businessName}</h2>
                           <div className="bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide">
                             Ready
                           </div>
                        </div>
                        <h4 className="text-xl text-blue-300 font-medium">{startup.tagline}</h4>
                      </div>
                    </div>

                    <p className="text-lg text-white/70 leading-relaxed mb-8 bg-black/20 p-6 rounded-2xl border border-white/5">
                      {startup.description}
                    </p>

                    <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Initial Product Line</h3>
                    <div className="flex flex-wrap gap-3 mb-12">
                      {startup.products && typeof startup.products === 'string' 
                          ? JSON.parse(startup.products).map((p: string, i: number) => (
                              <div key={i} className="bg-white/10 border border-white/5 px-4 py-2 rounded-lg text-white/90 text-sm font-medium">
                                {p}
                              </div>
                            ))
                          : startup.products?.map?.((p: string, i: number) => (
                              <div key={i} className="bg-white/10 border border-white/5 px-4 py-2 rounded-lg text-white/90 text-sm font-medium">
                                {p}
                              </div>
                            ))
                      }
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/10 pt-8">
                       <button 
                         onClick={() => generateFeature("logo", "logo", setLogo)}
                         disabled={loading.logo}
                         className="bg-black/40 hover:bg-white/10 text-white px-4 py-4 rounded-xl font-medium transition-all flex items-center gap-3 border border-white/5"
                       >
                         {loading.logo ? <RefreshCw className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5 text-amber-400"/>}
                         <div className="text-left">
                            <div className="text-sm font-bold">Generate Logo SVG</div>
                            <div className="text-xs text-white/50">Abstract minimal graphic</div>
                         </div>
                       </button>

                       <button 
                         onClick={() => marketingPlan ? setViewingModal("marketing") : generateFeature("marketing", "marketing", setMarketingPlan, "marketing")}
                         disabled={loading.marketing}
                         className="bg-black/40 hover:bg-white/10 text-white px-4 py-4 rounded-xl font-medium transition-all flex items-center gap-3 border border-white/5"
                       >
                         {loading.marketing ? <RefreshCw className="w-5 h-5 animate-spin"/> : <FileText className="w-5 h-5 text-green-400"/>}
                         <div className="text-left">
                            <div className="text-sm font-bold">{marketingPlan ? "View Marketing Plan" : "Generate Marketing Plan"}</div>
                            <div className="text-xs text-white/50">Complete GTM Strategy</div>
                         </div>
                       </button>

                       <button 
                         onClick={() => pitchDeck ? setViewingModal("pitch") : generateFeature("pitch", "pitch", setPitchDeck, "pitch")}
                         disabled={loading.pitch}
                         className="bg-black/40 hover:bg-white/10 text-white px-4 py-4 rounded-xl font-medium transition-all flex items-center gap-3 border border-white/5"
                       >
                         {loading.pitch ? <RefreshCw className="w-5 h-5 animate-spin"/> : <Presentation className="w-5 h-5 text-pink-400"/>}
                         <div className="text-left">
                            <div className="text-sm font-bold">{pitchDeck ? "View Pitch Deck" : "Generate Pitch Deck"}</div>
                            <div className="text-xs text-white/50">Slide-by-slide script for VC</div>
                         </div>
                       </button>

                       <button 
                         onClick={() => generateFeature("website", "website", setWebsite)}
                         disabled={loading.website}
                         className="bg-white hover:bg-gray-200 text-black px-4 py-4 rounded-xl font-medium transition-all flex items-center gap-3 shadow-lg shadow-white/10"
                       >
                         {loading.website ? <RefreshCw className="w-5 h-5 animate-spin"/> : <LayoutDashboard className="w-5 h-5"/>}
                         <div className="text-left">
                            <div className="text-sm font-bold">Generate MVP Site</div>
                            <div className="text-xs text-black/60">Fully coded HTML landing page</div>
                         </div>
                       </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* WEBSITE PREVIEW */}
            <AnimatePresence>
              {website && (
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  id="preview" 
                  className="mt-16 text-center"
                >
                  <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
                    <h2 className="text-3xl font-bold text-white text-left">Live Website Preview</h2>
                    
                    <div className="flex flex-wrap gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
                      <select value={theme} onChange={(e) => setTheme(e.target.value)} className="bg-black/40 text-white text-sm rounded-xl px-4 border border-white/10 outline-none h-10">
                        <option value="blue">Deep Blue Theme</option>
                        <option value="purple">Cosmic Purple</option>
                        <option value="dark">Midnight Obsidian</option>
                      </select>
                      <button onClick={()=>copyText(website)} className="bg-white/10 hover:bg-white/20 px-4 h-10 rounded-xl text-sm font-medium transition-all flex items-center gap-2">
                        <Copy className="w-4 h-4" /> Copy
                      </button>
                      <a href={`data:text/html;charset=utf-8,${encodeURIComponent(website)}`} download="index.html" className="bg-blue-600 hover:bg-blue-500 px-4 h-10 rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20">
                        <Download className="w-4 h-4" /> Download
                      </a>
                    </div>
                  </div>

                  <div className="bg-black border border-white/20 rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.5)] h-[800px] flex flex-col items-center">
                    <div className="w-full bg-zinc-900 border-b border-white/10 px-4 py-3 flex items-center">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                      </div>
                      <div className="mx-auto bg-black/50 text-white/40 text-xs px-24 py-1.5 rounded-md truncate max-w-sm">
                        localhost:3000/{startup?.businessName?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                      </div>
                    </div>
                    <iframe srcDoc={website} className="w-full flex-1 bg-white" title="Website Preview" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </main>

        {/* MODAL VIEWER FOR MARKDOWN */}
        <AnimatePresence>
          {viewingModal && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-black/60 backdrop-blur-sm"
             >
                <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-3xl max-h-full flex flex-col shadow-2xl relative overflow-hidden">
                   <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/20">
                     <h3 className="text-2xl font-bold flex items-center gap-3">
                       {viewingModal === 'marketing' ? <FileText className="text-green-400"/> : <Presentation className="text-pink-400"/>}
                       {viewingModal === 'marketing' ? 'Marketing Plan' : 'Pitch Deck'}
                     </h3>
                     <button onClick={() => setViewingModal(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                       <X className="w-6 h-6" />
                     </button>
                   </div>
                   
                   <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-[#0f172a] markdown-body">
                      <ReactMarkdown>
                         {viewingModal === 'marketing' ? marketingPlan : pitchDeck}
                      </ReactMarkdown>
                   </div>

                   <div className="p-4 border-t border-white/10 bg-black/20 flex justify-end gap-3">
                     <button onClick={() => copyText(viewingModal === 'marketing' ? marketingPlan : pitchDeck)} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium flex items-center gap-2 transition-colors">
                        <Copy className="w-4 h-4"/> Copy Markdown
                     </button>
                   </div>
                </div>
             </motion.div>
          )}
        </AnimatePresence>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
        
        .markdown-body h1, .markdown-body h2, .markdown-body h3 { 
           margin-top: 2rem; margin-bottom: 1rem; color: #fff; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;
        }
        .markdown-body p { margin-bottom: 1rem; color: rgba(255,255,255,0.8); line-height: 1.6; }
        .markdown-body ul, .markdown-body ol { margin-bottom: 1rem; padding-left: 1.5rem; color: rgba(255,255,255,0.8); }
        .markdown-body li { margin-bottom: 0.5rem; }
        .markdown-body strong { color: #fff; }
      `}</style>
    </div>
  );
}