"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Edit3, Check } from "lucide-react";

interface Slide {
  title: string;
  subtitle: string;
  content: string[];
}

interface PitchDeckViewerProps {
  slides: Slide[];
  onClose: () => void;
  onUpdate?: (slides: Slide[]) => void;
}

export default function PitchDeckViewer({ slides: initialSlides, onClose, onUpdate }: PitchDeckViewerProps) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const slideImages = [
    "/slides/slide1.png",
    "/slides/slide2.png",
    "/slides/slide3.png",
    "/slides/slide4.png",
    "/slides/slide5.png",
  ];

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide, slides.length]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  // KEYBOARD NAVIGATION
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing) return; // Don't navigate while typing
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, isEditing, onClose]);

  const updateSlideContent = (index: number, field: keyof Slide, value: any) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
    if (onUpdate) onUpdate(newSlides);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col font-sans text-white overflow-hidden select-none">
      
      {/* BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slideImages[currentSlide] || slideImages[0]})` }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
      </div>

      {/* PERSISTENT HEADER */}
      <header className="relative z-50 flex items-center justify-between p-6 md:p-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
             <div className="w-5 h-5 flex items-center justify-center font-black text-sm">P</div>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight hidden sm:block">Pitch Deck Viewer</h1>
             <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em]">Slide {currentSlide + 1} / {slides.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all font-bold text-sm ${isEditing ? 'bg-green-600 border-green-500 shadow-lg shadow-green-500/20' : 'bg-white/5 border-white/10 hover:bg-white/15'}`}
          >
            {isEditing ? <><Check className="w-4 h-4" /> Save</> : <><Edit3 className="w-4 h-4" /> Edit</>}
          </button>
          
          <button
            onClick={onClose}
            className="p-2.5 bg-white/5 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 rounded-xl transition-all border border-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* SLIDE CONTENT AREA */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 md:p-12 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="w-full max-w-5xl bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-16 shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative flex flex-col justify-center min-h-[400px]"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[120px] -mr-40 -mt-40 pointer-events-none" />
            
            <div className="relative z-10">
              {isEditing ? (
                <input
                  value={slides[currentSlide].title}
                  onChange={(e) => updateSlideContent(currentSlide, "title", e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-2xl px-6 py-3 text-4xl md:text-6xl font-black mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  autoFocus
                />
              ) : (
                <h2 className="text-4xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/40 drop-shadow-2xl">
                  {slides[currentSlide].title}
                </h2>
              )}

              {isEditing ? (
                <input
                  value={slides[currentSlide].subtitle}
                  onChange={(e) => updateSlideContent(currentSlide, "subtitle", e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2 text-xl md:text-2xl font-bold text-blue-400 mb-8 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              ) : (
                <p className="text-xl md:text-3xl font-bold text-blue-400 mb-12 tracking-tight">
                  {slides[currentSlide].subtitle}
                </p>
              )}

              <div className="space-y-6">
                {slides[currentSlide].content.map((point, i) => (
                  <div key={i} className="flex items-start gap-5 group">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 mt-3.5 shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                    {isEditing ? (
                      <input
                        value={point}
                        onChange={(e) => {
                          const newPoints = [...slides[currentSlide].content];
                          newPoints[i] = e.target.value;
                          updateSlideContent(currentSlide, "content", newPoints);
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-lg md:text-xl text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    ) : (
                      <p className="text-lg md:text-2xl text-white/70 leading-relaxed font-medium">
                        {point}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER NAVIGATION */}
      <footer className="relative z-50 p-8 md:pb-12 flex flex-col items-center gap-8 shrink-0">
        {/* PROGRESS INDICATOR */}
        <div className="w-full max-w-2xl flex gap-1.5 h-1 px-4">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 rounded-full transition-all duration-700 ${i <= currentSlide ? 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-white/10'}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-12 sm:gap-24">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="p-5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all disabled:opacity-10 flex items-center justify-center group active:scale-95 shadow-xl"
            title="Previous Slide (←)"
          >
            <ChevronLeft className="w-10 h-10 group-hover:-translate-x-1 transition-transform" />
          </button>

          <div className="flex gap-3">
             {slides.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentSlide(i)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-blue-500 scale-125 shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'bg-white/20 hover:bg-white/40'}`}
                />
             ))}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="p-5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all disabled:opacity-10 flex items-center justify-center group active:scale-95 shadow-xl"
            title="Next Slide (→)"
          >
            <ChevronRight className="w-10 h-10 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </footer>
    </div>
  );
}
