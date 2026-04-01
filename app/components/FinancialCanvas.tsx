"use client";

import { motion } from "framer-motion";
import { TrendingUp, DollarSign, PieChart, Activity } from "lucide-react";
import { useState } from "react";

interface FinancialData {
  currency: string;
  monthlyData: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[];
  summary: {
    totalRevenueYear1: number;
    totalExpensesYear1: number;
    netProfitYear1: number;
    breakEvenMonth: number;
  };
}

interface FinancialCanvasProps {
  data: FinancialData;
}

export default function FinancialCanvas({ data }: FinancialCanvasProps) {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  // Safety check for empty or invalid data
  if (!data?.monthlyData || !Array.isArray(data.monthlyData)) return null;

  const maxVal = Math.max(...data.monthlyData.map(d => Math.max(d.revenue, d.expenses))) || 1;

  return (
    <div className="py-8 flex flex-col gap-8">
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Est. Year 1 Revenue", value: data.summary?.totalRevenueYear1, icon: TrendingUp, color: "text-green-400" },
          { label: "Est. Year 1 Burn", value: data.summary?.totalExpensesYear1, icon: Activity, color: "text-red-400" },
          { label: "Est. Net Profit", value: data.summary?.netProfitYear1, icon: DollarSign, color: "text-blue-400" },
          { label: "Break-Even Month", value: `Month ${data.summary?.breakEvenMonth}`, icon: PieChart, color: "text-purple-400" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{item.label}</span>
               <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <div className="text-2xl font-black text-white">
               {typeof item.value === 'number' ? `${data.currency} ${item.value.toLocaleString()}` : item.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* CHART AREA */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group">
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none" />
        
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div>
            <h3 className="text-2xl font-bold text-white">Projected Growth</h3>
            <p className="text-white/40 text-sm">Monthly Revenue vs Expenses (Year 1)</p>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <span className="text-[10px] font-bold text-white/60 uppercase">Revenue</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <span className="text-[10px] font-bold text-white/60 uppercase">Expenses</span>
             </div>
          </div>
        </div>

        <div className="flex items-end justify-between gap-2 h-64 relative z-10 px-4">
          {data.monthlyData.map((month, i) => (
            <div 
              key={i} 
              className="flex-1 flex flex-col items-center gap-2 group/bar cursor-pointer"
              onMouseEnter={() => setHoveredMonth(i)}
              onMouseLeave={() => setHoveredMonth(null)}
            >
              <div className="w-full flex items-end gap-1 h-full px-0.5">
                 <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(month.revenue / maxVal) * 100}%` }}
                    className="flex-1 bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-sm group-hover/bar:from-blue-400 group-hover/bar:to-indigo-300 transition-all"
                 />
                 <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(month.expenses / maxVal) * 100}%` }}
                    className="flex-1 bg-white/10 rounded-t-sm group-hover/bar:bg-white/20 transition-all"
                 />
              </div>
              <span className="text-[8px] font-bold text-white/20 uppercase group-hover/bar:text-white/60 transition-colors">{month.month.split(" ")[1]}</span>
              
              {hoveredMonth === i && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-0 left-1/2 -track-x-1/2 bg-white text-black px-4 py-2 rounded-xl text-[10px] font-bold shadow-2xl z-50 whitespace-nowrap"
                  style={{ left: `${(i / data.monthlyData.length) * 100}%`, transform: 'translateX(-50%)' }}
                >
                   {month.month}: Rev {data.currency} {month.revenue.toLocaleString()} / Exp {month.expenses.toLocaleString()}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
