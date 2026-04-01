"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2, Play, Sparkles, Code, Orbit, Copy, Download, RefreshCw, LayoutDashboard,
  Presentation, FileText, X, Trash2, ImageDown, Search, Share2, Star, Edit2, Check
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import PitchDeckViewer from "./components/PitchDeckViewer";
import StartupSuite from "./components/StartupSuite";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [startup, setStartup] = useState<any>(null);

  // UI Display states
  const [website, setWebsite] = useState("");
  const [logo, setLogo] = useState("");
  const [marketingPlan, setMarketingPlan] = useState("");
  const [pitchDeck, setPitchDeck] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingModal, setViewingModal] = useState<"marketing" | "pitch" | null>(null);

  const [editingField, setEditingField] = useState<"name" | "tagline" | null>(null);
  const [editValue, setEditValue] = useState("");

  const [loading, setLoading] = useState<Record<string, boolean>>({
    startup: false,
    website: false,
    logo: false,
    marketing: false,
    pitch: false,
    team: false,
    financials: false,
    roadmap: false,
    market: false,
    mockups: false
  });

  const [theme, setTheme] = useState("blue");

  // --- NEW FEATURES STATES ---
  const [onboardingStep, setOnboardingStep] = useState<"industry" | "idea" | "magic">("industry");
  const [industry, setIndustry] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("Analyzing market gaps... 🔍");
  const [socialKit, setSocialKit] = useState<{ linkedin: string, twitter: string, instagram: string } | null>(null);
  const [websiteInstruction, setWebsiteInstruction] = useState("");
  const [showSocialKit, setShowSocialKit] = useState(false);

  const loadingMessages = [
    "Analyzing market gaps... 🔍",
    "Building your brand identity... 🎨",
    "Drafting your business model... 📊",
    "Designing your digital presence... 💻",
    "Optimizing unit economics... 📈",
    "Finalizing your pitch deck... 🚀"
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading.startup) {
      let i = 0;
      interval = setInterval(() => {
        i = (i + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[i]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading.startup]);

  const industries = [
    { name: "SaaS", icon: "☁️" },
    { name: "Fintech", icon: "💳" },
    { name: "HealthTech", icon: "🏥" },
    { name: "E-commerce", icon: "🛍️" },
    { name: "AI / ML", icon: "🧠" },
    { name: "EdTech", icon: "🎓" },
    { name: "Sustainability", icon: "🌱" }
  ];
  // --- END NEW FEATURES STATES ---

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      // Handle array, {data: [...]}, {startups: [...]}, or any other shape
      let list: any[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.startups)) {
        list = data.startups;
      } else if (Array.isArray(data?.history)) {
        list = data.history;
      }
      setHistory(list);
    } catch (e) {
      setHistory([]); // always fall back to empty array on error
    }
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
    
    // Attempt to parse pitch deck if it's a JSON string
    try {
      const pd = past.businessPlan?.pitchDeck;
      if (pd && pd.startsWith("[")) {
        setPitchDeck(JSON.parse(pd));
      } else {
        setPitchDeck(pd || null);
      }
    } catch (e) {
      setPitchDeck(null);
    }
  }

  async function handleSuiteGeneration(feature: string) {
    if (!startup?.id) return;
    
    if (feature === "all") {
       const suiteFeatures = ["team", "financials", "roadmap", "market", "mockups", "logo", "website", "social", "pitch"];
       for (const f of suiteFeatures) {
          await handleSuiteGeneration(f);
       }
       return;
    }

    if (feature === "logo") {
       return generateFeature("logo", "logo", setLogo);
    }
    if (feature === "website") {
       return generateFeature("website", "website", setWebsite);
    }
    if (feature === "social") {
       return generateSocialKit();
    }
    if (feature === "pitch") {
       setLoad("pitch", true);
       try {
         const res = await fetch("/api/pitch", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ startupId: startup.id })
         });
         const data = await res.json();
         setStartup((prev: any) => ({ ...prev, elevatorPitch: data.transcript }));
         fetchHistory();
       } catch (e) { console.error(e); }
       finally { setLoad("pitch", false); }
       return;
    }

    setLoad(feature, true);
    try {
      const res = await fetch(`/api/${feature}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId: startup.id })
      });
      const data = await res.json();
      
      setStartup((prev: any) => ({
        ...prev,
        businessPlan: {
          ...prev.businessPlan,
          [feature === 'market' ? 'competitors' : feature]: JSON.stringify(data[feature])
        }
      }));
      
      fetchHistory();
    } catch (e) {
      console.error(`Error generating ${feature}:`, e);
    } finally {
      setLoad(feature, false);
    }
  }

  async function generateStartup() {
    if (!idea) return;
    setOnboardingStep("magic");
    setLoad("startup", true);
    setStartup(null);
    setWebsite("");
    setLogo("");
    setMarketingPlan("");
    setPitchDeck("");
    setSocialKit(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: `[Industry: ${industry}] ${idea}`, theme })
      });
      const data = await res.json();
      setStartup(data);
      fetchHistory();
    } catch (e) {
      console.error(e);
    }
    setLoad("startup", false);
  }

  async function generateSocialKit() {
    if (!startup?.id) return;
    setLoad("social", true);
    try {
      const res = await fetch("/api/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId: startup.id })
      });
      const data = await res.json();
      setSocialKit(data);
      setShowSocialKit(true);
    } catch (e) { console.error(e); }
    setLoad("social", false);
  }

  async function editWebsite() {
    if (!startup?.id || !websiteInstruction) return;
    setLoad("website", true);
    try {
      const res = await fetch("/api/website/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId: startup.id, instruction: websiteInstruction })
      });
      const data = await res.json();
      if (data.html) {
        setWebsite(data.html);
        setWebsiteInstruction("");
      }
    } catch (e) { console.error(e); }
    setLoad("website", false);
  }

  async function generateFeature(endpoint: string, stateKey: string, setter: any, modalToOpen?: "marketing" | "pitch") {
    if (!startup?.id) return;
    setLoad(stateKey, true);
    try {
      const res = await fetch(`/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId: startup.id })
      });
      const data = await res.json();

      if (stateKey === "website") {
        setter(data.html);
        setTimeout(() => {
          document.getElementById("preview")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      } else if (stateKey === "logo") {
        setter(data.svg);
      } else if (stateKey === "pitch") {
        setPitchDeck(data.slides);
        if (modalToOpen) setViewingModal(modalToOpen);
      } else {
        setter(data.markdown);
        if (modalToOpen) setViewingModal(modalToOpen);
      }

    } catch (e) { console.error(e); }
    setLoad(stateKey, false);
  }

  function resetApp() {
    setIdea("");
    setIndustry("");
    setOnboardingStep("industry");
    setStartup(null);
    setWebsite("");
    setLogo("");
    setMarketingPlan("");
    setPitchDeck("");
    setSocialKit(null);
  }

  async function deleteHistory(id: string) {
    if (!confirm("Delete this startup from history?")) return;
    try {
      await fetch("/api/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (startup?.id === id) resetApp();
      fetchHistory();
    } catch (e) { console.error(e); }
  }

  async function clearAllHistory() {
    if (!confirm("Are you sure you want to clear ALL your history? This cannot be undone.")) return;
    try {
      await fetch("/api/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearAll: true })
      });
      setHistory([]);
      resetApp();
    } catch (e) { }
  }

  async function updateStartup(payload: any) {
    if (!startup?.id) return;
    try {
      const res = await fetch("/api/startup", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: startup.id, ...payload })
      });
      const data = await res.json();
      if (data.success) {
        setStartup((prev: any) => ({ ...prev, ...payload }));
        fetchHistory();
      }
    } catch (e) { }
  }

  async function toggleFavorite(h: any) {
    try {
      await fetch("/api/startup", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: h.id, isFavorite: !h.isFavorite })
      });
      fetchHistory();
      if (startup?.id === h.id) {
        setStartup((prev: any) => ({ ...prev, isFavorite: !h.isFavorite }));
      }
    } catch (e) { }
  }

  function exportStartupJson() {
    if (!startup) return;
    const blob = new Blob([JSON.stringify(startup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${startup.businessName.toLowerCase().replace(/\s+/g, '-')}-data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadLogo() {
    if (!logo || !startup?.businessName) return;
    const blob = new Blob([logo], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${startup.businessName.toLowerCase().replace(/\s+/g, '-')}-logo.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadMarkdown(content: string, type: string) {
    if (!startup?.businessName) return;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${startup.businessName.toLowerCase().replace(/\s+/g, '-')}-${type}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function copyText(val: string) {
    navigator.clipboard.writeText(val);
    alert("Copied to clipboard!");
  }

  // Safely filter history — guards against non-array state
  const safeHistory = Array.isArray(history) ? history : [];
  const filteredHistory = safeHistory.filter(h =>
    h?.businessName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const themeGradients: Record<string, string> = {
    blue: "from-blue-900 via-slate-900 to-slate-950",
    purple: "from-purple-900 via-slate-900 to-slate-950",
    dark: "from-slate-900 via-black to-slate-950",
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeGradients[theme] || themeGradients.blue} text-white selection:bg-white/30 font-sans transition-colors duration-1000`}>
      <div className="flex h-screen overflow-hidden relative">

        {/* FLOATING LOGO FOR ARCHITECT MODE */}
        {startup && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-8 left-8 z-[100] flex items-center gap-3 cursor-pointer group"
            onClick={resetApp}
          >
            <div className="bg-gradient-to-br from-blue-400 to-purple-500 p-2 rounded-xl group-hover:scale-110 transition-transform">
              <Orbit className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              VyapaarAI
            </h2>
          </motion.div>
        )}

        {/* SIDEBAR */}
        <motion.aside
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: startup ? -400 : 0, opacity: startup ? 0 : 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`${startup ? 'w-0' : 'w-72'} bg-white/5 backdrop-blur-xl border-r border-white/10 hidden lg:flex flex-col p-6 shadow-2xl relative z-20 shrink-0 transition-all duration-700`}
        >
          <div className="flex items-center gap-3 mb-12 cursor-pointer" onClick={resetApp}>
            <div className="bg-gradient-to-br from-blue-400 to-purple-500 p-2 rounded-xl">
              <Orbit className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              VyapaarAI
            </h2>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            <button onClick={resetApp} className="flex items-center justify-between px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all font-medium text-left shadow-lg shadow-blue-500/20">
              <span className="flex items-center gap-3">
                <Wand2 className="w-5 h-5 text-white" />
                New Startup
              </span>
            </button>
          </div>

          {!startup && (
            <>
              <div className="px-2 mb-4 relative">
                <Search className="w-4 h-4 text-white/40 absolute left-5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all placeholder:text-white/30"
                />
              </div>

              <div className="flex items-center justify-between px-2 mb-3">
                <div className="text-sm font-semibold text-white/50 uppercase tracking-widest">History</div>
                {filteredHistory.length > 0 && (
                  <button onClick={clearAllHistory} className="text-xs text-red-400 hover:text-red-300 transition-colors uppercase font-bold tracking-wider">
                    Clear All
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-2">
                {filteredHistory.length === 0 && (
                  <div className="text-white/30 text-sm px-2">No past generations found.</div>
                )}
                {filteredHistory.map((h, i) => (
                  <div
                    key={h.id ?? i}
                    onClick={() => loadPastStartup(h)}
                    className={`group cursor-pointer px-4 py-3 rounded-xl hover:bg-white/10 transition-all border flex flex-col gap-1 relative overflow-hidden shrink-0 ${h.isFavorite ? 'bg-amber-600/20 border-amber-500/40' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-white group-hover:text-amber-400 transition-colors truncate text-sm">
                        {h.isFavorite && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0 inline mr-1 -mt-1" />}
                        {h.businessName}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(h); }}
                          className="p-1 hover:bg-white/20 text-white/40 hover:text-amber-400 rounded-md transition-colors"
                          title={h.isFavorite ? "Unfavorite" : "Favorite"}
                        >
                          <Star className={`w-3.5 h-3.5 ${h.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteHistory(h.id); }}
                          className="p-1 hover:bg-red-500/30 text-red-500/60 hover:text-red-400 rounded-md transition-colors"
                          title="Delete Startup"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-[10px] uppercase font-bold tracking-widest text-white/40 group-hover:text-white/70 transition-colors">
                      {h.createdAt ? new Date(h.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ""}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

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
                Turn any idea into a <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500">
                  Fundable Startup
                </span>
              </h1>
            </motion.div>

            {/* ONBOARDING FLOW */}
            {!startup && !loading.startup && (
              <div className="mt-12">
                <AnimatePresence mode="wait">
                  {onboardingStep === "industry" && (
                    <motion.div
                      key="step1"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      className="flex flex-col items-center"
                    >
                      <h3 className="text-2xl font-bold mb-8 text-white/80">Step 1: Pick your industry</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                        {industries.map((ind) => (
                          <button
                            key={ind.name}
                            onClick={() => { setIndustry(ind.name); setOnboardingStep("idea"); }}
                            className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-3 backdrop-blur-xl ${industry === ind.name ? 'bg-blue-600/30 border-blue-400 shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                          >
                            <span className="text-3xl">{ind.icon}</span>
                            <span className="font-semibold text-lg">{ind.name}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {onboardingStep === "idea" && (
                    <motion.div
                      key="step2"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      className="w-full max-w-2xl mx-auto"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <button onClick={() => setOnboardingStep("industry")} className="text-white/40 hover:text-white flex items-center gap-2">
                           ← Back
                        </button>
                        <h3 className="text-2xl font-bold text-white/80">Step 2: Describe your idea</h3>
                      </div>
                      <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-4 flex flex-col md:flex-row gap-3 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                        <input
                          type="text"
                          value={idea}
                          onChange={e => setIdea(e.target.value)}
                          placeholder={`Describe your ${industry} startup...`}
                          className="flex-1 bg-transparent border-none text-lg text-white placeholder-white/40 focus:ring-0 focus:outline-none px-4 py-3 min-w-0"
                          onKeyDown={(e) => { if (e.key === "Enter") generateStartup(); }}
                          autoFocus
                        />
                        <button
                          onClick={generateStartup}
                          disabled={!idea}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shrink-0"
                        >
                          <Sparkles className="w-5 h-5" />
                          Launch Magic
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* PERSONALITY LOADING STATE */}
            {loading.startup && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-20 flex flex-col items-center gap-8 text-center"
              >
                <div className="relative w-32 h-32">
                   <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-ping" />
                   <div className="absolute inset-2 border-4 border-purple-500/30 rounded-full animate-pulse" />
                   <div className="absolute inset-4 border-4 border-cyan-500/40 rounded-full animate-spin [animation-duration:3s]" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Orbit className="w-12 h-12 text-white animate-bounce" />
                   </div>
                </div>
                <div>
                   <h3 className="text-3xl font-bold text-white mb-2">{loadingMessage}</h3>
                   <p className="text-white/40 italic">Great things take a few moments of compute...</p>
                </div>
              </motion.div>
            )}

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
                          {editingField === 'name' ? (
                            <div className="flex items-center gap-2">
                              <input
                                autoFocus
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                className="text-3xl md:text-4xl font-bold text-white bg-black/40 border border-white/20 rounded-lg px-3 py-1 outline-none focus:border-blue-400"
                                onKeyDown={(e) => { if (e.key === 'Enter') { updateStartup({ businessName: editValue }); setEditingField(null); } }}
                              />
                              <button onClick={() => { updateStartup({ businessName: editValue }); setEditingField(null); }} className="p-2 bg-blue-600 rounded-xl hover:bg-blue-500"><Check className="w-5 h-5 text-white" /></button>
                              <button onClick={() => setEditingField(null)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20"><X className="w-5 h-5 text-white" /></button>
                            </div>
                          ) : (
                            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight group/name cursor-pointer flex items-center gap-3" onClick={() => { setEditValue(startup.businessName); setEditingField('name'); }}>
                              {startup.businessName}
                              <Edit2 className="w-5 h-5 opacity-0 group-hover/name:opacity-100 text-white/40 transition-opacity" />
                            </h2>
                          )}
                          <div className="bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide">
                            Ready
                          </div>

                          <div className="ml-auto flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => toggleFavorite(startup)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors border border-white/10 text-white/80 hover:text-white"
                            >
                              <Star className={`w-4 h-4 ${startup.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-white/60'}`} />
                            </button>
                            <button
                              onClick={exportStartupJson}
                              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors border border-white/10 text-white/80 hover:text-white"
                            >
                              <Download className="w-4 h-4 text-green-400" /> Export
                            </button>
                            <button
                              onClick={() => {
                                const text = `I just architected an AI Startup: ${startup.businessName} - ${startup.tagline} 🚀\n\nBuilt with VyapaarAI!`;
                                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors border border-white/10 text-white/80 hover:text-white"
                            >
                              <Share2 className="w-4 h-4 text-blue-400" /> Share
                            </button>
                          </div>
                        </div>

                        {editingField === 'tagline' ? (
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              autoFocus
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              className="flex-1 text-xl text-blue-300 font-medium bg-black/40 border border-white/20 rounded-lg px-3 py-1 outline-none focus:border-blue-400 w-full md:w-auto min-w-[300px]"
                              onKeyDown={(e) => { if (e.key === 'Enter') { updateStartup({ tagline: editValue }); setEditingField(null); } }}
                            />
                            <button onClick={() => { updateStartup({ tagline: editValue }); setEditingField(null); }} className="p-1.5 bg-blue-600 rounded-lg hover:bg-blue-500"><Check className="w-4 h-4 text-white" /></button>
                            <button onClick={() => setEditingField(null)} className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20"><X className="w-4 h-4 text-white" /></button>
                          </div>
                        ) : (
                          <h4 className="text-xl text-blue-300 font-medium group/tag cursor-pointer flex items-center gap-2" onClick={() => { setEditValue(startup.tagline); setEditingField('tagline'); }}>
                            {startup.tagline}
                            <Edit2 className="w-4 h-4 opacity-0 group-hover/tag:opacity-100 text-white/40 transition-opacity" />
                          </h4>
                        )}
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

                    {/* STARTUP SUITE DASHBOARD */}
                    <StartupSuite 
                      startup={startup} 
                      businessPlan={startup.businessPlan} 
                      onGenerate={handleSuiteGeneration} 
                      loading={loading}
                    />
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
                      <button onClick={() => copyText(website)} className="bg-white/10 hover:bg-white/20 px-4 h-10 rounded-xl text-sm font-medium transition-all flex items-center gap-2">
                        <Copy className="w-4 h-4" /> Copy
                      </button>
                      <a href={`data:text/html;charset=utf-8,${encodeURIComponent(website)}`} download="index.html" className="bg-blue-600 hover:bg-blue-500 px-4 h-10 rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20">
                        <Download className="w-4 h-4" /> Download
                      </a>
                    </div>
                  </div>

                  <div className="bg-black border border-white/20 rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.5)] h-[800px] flex flex-col items-center relative">
                    {/* AI DESIGNER FLOATING INPUT */}
                    <div className="absolute bottom-10 left-10 right-10 z-20">
                       <div className="max-w-2xl mx-auto bg-black/60 backdrop-blur-2xl border border-white/20 rounded-2xl p-2 flex gap-2 shadow-2xl">
                          <input 
                            type="text"
                            value={websiteInstruction}
                            onChange={e => setWebsiteInstruction(e.target.value)}
                            placeholder="Tell AI Designer: 'Add a dark mode toggle' or 'Make hero section emerald'..."
                            className="flex-1 bg-transparent border-none text-white placeholder-white/30 focus:ring-0 px-4 py-2"
                            onKeyDown={(e) => { if (e.key === "Enter") editWebsite(); }}
                          />
                          <button 
                            onClick={editWebsite}
                            disabled={loading.website || !websiteInstruction}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-semibold transition-all flex items-center gap-2"
                          >
                             {loading.website ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                             Edit Live
                          </button>
                       </div>
                    </div>

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

            {/* SOCIAL KIT MODAL */}
            <AnimatePresence>
              {showSocialKit && socialKit && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-12 bg-black/80 backdrop-blur-md"
                >
                  <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/20">
                      <h3 className="text-2xl font-bold flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                        <Share2 className="text-purple-400" />
                        Social Media Launch Kit
                      </h3>
                      <button onClick={() => setShowSocialKit(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <div className="text-sm font-bold text-white/40 uppercase tracking-widest">LinkedIn Post</div>
                             <button onClick={() => copyText(socialKit.linkedin)} className="text-xs text-blue-400 hover:underline">Copy Post</button>
                          </div>
                          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-white/80 whitespace-pre-wrap text-sm leading-relaxed">
                             {socialKit.linkedin}
                          </div>
                       </div>
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <div className="text-sm font-bold text-white/40 uppercase tracking-widest">Twitter Thread</div>
                             <button onClick={() => copyText(socialKit.twitter)} className="text-xs text-blue-400 hover:underline">Copy Thread</button>
                          </div>
                          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-white/80 whitespace-pre-wrap text-sm leading-relaxed">
                             {socialKit.twitter}
                          </div>
                          <div className="flex items-center justify-between pt-4">
                             <div className="text-sm font-bold text-white/40 uppercase tracking-widest">Instagram Caption</div>
                             <button onClick={() => copyText(socialKit.instagram)} className="text-xs text-blue-400 hover:underline">Copy Caption</button>
                          </div>
                          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white/80 text-sm italic">
                             {socialKit.instagram}
                          </div>
                       </div>
                    </div>

                    <div className="p-6 border-t border-white/10 bg-black/20 flex justify-center">
                       <p className="text-white/40 text-sm">Pro-tip: Share these on your channels during peak hours to maximize reach! 🚀</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </main>

        {/* MODAL VIEWER FOR MARKDOWN */}
        <AnimatePresence>
          {viewingModal === 'marketing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-black/60 backdrop-blur-sm"
            >
              <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-3xl max-h-full flex flex-col shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/20">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <FileText className="text-green-400" />
                    Marketing Plan
                  </h3>
                  <button onClick={() => setViewingModal(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-[#0f172a] markdown-body">
                  <ReactMarkdown>
                    {marketingPlan}
                  </ReactMarkdown>
                </div>

                <div className="p-4 border-t border-white/10 bg-black/20 flex justify-end gap-3">
                  <button onClick={() => downloadMarkdown(marketingPlan, 'marketing-plan')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20">
                    <Download className="w-4 h-4" /> Download .md
                  </button>
                  <button onClick={() => copyText(marketingPlan)} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium flex items-center gap-2 transition-colors">
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {viewingModal === 'pitch' && Array.isArray(pitchDeck) && (
            <PitchDeckViewer 
              slides={pitchDeck} 
              onClose={() => setViewingModal(null)} 
              onUpdate={(newSlides) => {
                setPitchDeck(newSlides);
                // Optionally persist to DB
                fetch("/api/pitch", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ startupId: startup.id, slides: newSlides })
                }).catch(console.error);
              }}
            />
          )}

          {viewingModal === 'pitch' && typeof pitchDeck === 'string' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-12 bg-black/90">
               <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Legacy Pitch Deck Found</h2>
                  <p className="text-white/60 mb-8">This pitch deck was created with an older version. Regenerate to see the visual version!</p>
                  <div className="flex gap-4 justify-center">
                    <button onClick={() => setViewingModal(null)} className="px-6 py-2 bg-white/10 rounded-xl">Close</button>
                    <button onClick={() => { setViewingModal(null); generateFeature("pitch", "pitch", setPitchDeck, "pitch"); }} className="px-6 py-2 bg-pink-600 rounded-xl">Regenerate Now</button>
                  </div>
               </div>
            </div>
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
