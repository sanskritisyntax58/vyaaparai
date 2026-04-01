import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Orbit, Sparkles, Share2, Rocket } from "lucide-react";
import Link from "next/link";

export default async function IdeaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const startup = await prisma.startup.findUnique({
    where: { id },
    include: {
      website: true,
    }
  });

  if (!startup) {
    notFound();
  }

  const products = JSON.parse(startup.products || "[]");

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30">
      {/* Background decoration */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Nav */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-blue-400 to-purple-500 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
              <Orbit className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              VyapaarAI
            </span>
          </Link>
          <Link href="/" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/20">
             Build your own →
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start mb-16">
          {/* Logo */}
          <div className="w-32 h-32 shrink-0 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl">
            {startup.logoUrl ? (
              <div className="w-full h-full p-4 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: startup.logoUrl }} />
            ) : (
              <Sparkles className="w-12 h-12 text-white/20" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
               <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                  {startup.businessName}
               </h1>
               <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest h-fit mt-2">
                  Featured Idea
               </div>
            </div>
            <p className="text-2xl text-blue-300 font-medium mb-6">
              {startup.tagline}
            </p>
            <p className="text-xl text-white/60 leading-relaxed max-w-3xl">
              {startup.description}
            </p>
          </div>
        </div>

        {/* Product Grid */}
        <section className="mb-20">
           <h2 className="text-sm font-bold text-white/40 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <Rocket className="w-4 h-4" /> Core Offerings
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((p: string, i: number) => (
                <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/[0.07] transition-colors group">
                   <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/40 transition-colors">
                      <span className="text-lg font-bold text-blue-400">{i + 1}</span>
                   </div>
                   <p className="text-lg font-medium text-white/90">{p}</p>
                </div>
              ))}
           </div>
        </section>

        {/* Website Preview Section */}
        {startup.website && (
          <section>
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-sm font-bold text-white/40 uppercase tracking-[0.2em] flex items-center gap-3">
                  <Share2 className="w-4 h-4" /> Live Preview
               </h2>
            </div>
            <div className="bg-black border border-white/10 rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)] h-[700px] flex flex-col">
              <div className="w-full bg-zinc-900 border-b border-white/10 px-4 py-3 flex items-center">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/40"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/40"></div>
                </div>
                <div className="mx-auto bg-black/50 text-white/30 text-[10px] px-12 py-1 rounded-md">
                  {startup.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.vyapaarai.com
                </div>
              </div>
              <iframe 
                srcDoc={startup.website.html} 
                className="w-full flex-1 bg-white" 
                title={`${startup.businessName} Website`}
              />
            </div>
          </section>
        )}

        <footer className="mt-32 pb-12 border-t border-white/5 pt-12 text-center">
           <p className="text-white/30 text-sm mb-6">Generated with VyapaarAI — Build the future today.</p>
           <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Start your own project <Sparkles className="w-4 h-4" />
           </Link>
        </footer>
      </main>
    </div>
  );
}
