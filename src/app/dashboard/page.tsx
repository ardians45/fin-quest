'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBudgetStore, useTransactionStore, useGameStore } from '@/stores';
import { BottomNav } from '@/components/layout/BottomNav';
import { Fortress3D } from '@/components/visuals/Fortress3D';

export default function DashboardPage() {
  const router = useRouter();
  const { isOnboarded, monthlyBudget, getHP, getHPStatus, getRemainingBudget, _hasHydrated } = useBudgetStore();
  const { transactions, getTransactionsByDate } = useTransactionStore();
  const { streak, level, xp, getLevelName } = useGameStore();
  
  const nextLevelXp = level * 100;
  
  // Mounted state to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);

  // QC / Debug State
  const [debugLevel, setDebugLevel] = useState(1);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync debug level with actual level on mount
  useEffect(() => {
     if(level) setDebugLevel(level);
  }, [level]);

  useEffect(() => {
    // Only redirect AFTER hydration is complete
    if (_hasHydrated && !isOnboarded) {
      router.replace('/onboarding');
    }
  }, [_hasHydrated, isOnboarded, router]);

  // --- DATA CALCULATION FOR CARDS ---
  
  // 1. Global Stats
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const totalExpenseThisMonth = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  const hp = getHP(totalExpenseThisMonth);
  const remaining = getRemainingBudget(totalExpenseThisMonth);
  const xpPercentage = Math.min((xp / nextLevelXp) * 100, 100);

  // 2. Battle Today Data
  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.date === today);
  const todayExpense = todayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const todayXP = todayTransactions.length * 10; // Estimation: 10 XP per transaction

  // 3. Spending Trend Data
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const yesterdayTransactions = transactions.filter(t => t.date === yesterday);
  const yesterdayExpense = yesterdayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  let trendText = "Mulai petualangan finansialmu hari ini!";
  let trendIcon = "trending_flat";
  let trendColor = "text-gray-500";

  if (todayExpense > 0 && yesterdayExpense > 0) {
    const diff = todayExpense - yesterdayExpense;
    const percent = Math.round((Math.abs(diff) / yesterdayExpense) * 100);
    
    if (diff > 0) {
      trendText = `Pengeluaran naik ${percent}% dari kemarin`;
      trendIcon = "trending_up";
      trendColor = "text-danger";
    } else {
      trendText = `Lebih hemat ${percent}% dari kemarin`;
      trendIcon = "trending_down";
      trendColor = "text-success";
    }
  } else if (todayExpense > 0 && yesterdayExpense === 0) {
      trendText = "Hari ini kamu mulai mengeluarkan harta.";
      trendIcon = "trending_up";
      trendColor = "text-warning";
  }

  // 4. Next Action Logic
  let actionMessage = "Pertahanan stabil, lanjutkan!";
  let actionColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let actionIcon = "check_circle";

  if (hp < 40) {
    actionMessage = "Zona merah! Hindari pengeluaran besar";
    actionColor = "bg-red-50 text-red-700 border-red-200";
    actionIcon = "warning";
  } else if (hp < 70) {
    actionMessage = "Kurangi jajan hari ini ⚠️";
    actionColor = "bg-amber-50 text-amber-700 border-amber-200";
    actionIcon = "priority_high";
  }

  
  const formatIDR = (value: number) => 
    new Intl.NumberFormat('id-ID').format(value);

  // Wait for both mount and hydration before rendering
  if (!mounted || !_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isOnboarded) return null;

  return (
    <>
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 w-full h-full bg-gradient-to-b from-purple-50/50 to-blue-50/30"></div>
        <div className="absolute top-[20%] left-[-20%] w-[140%] h-[40%] bg-purple-200/20 rounded-[100%] blur-3xl transform -rotate-12"></div>
        <div className="absolute top-[30%] right-[-10%] w-[80%] h-[50%] bg-indigo-200/20 rounded-[100%] blur-3xl"></div>
        
        {/* Floating Coins Animation */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[10%] text-gold animate-float opacity-60">
            <span className="material-symbols-outlined text-xl animate-coin-spin">monetization_on</span>
          </div>
          <div className="absolute top-[25%] right-[15%] text-gold animate-float-delayed opacity-50">
            <span className="material-symbols-outlined text-lg animate-coin-spin">monetization_on</span>
          </div>
          <div className="absolute bottom-[40%] left-[20%] text-gold animate-float opacity-40">
            <span className="material-symbols-outlined text-sm animate-coin-spin">monetization_on</span>
          </div>
        </div>
      </div>

      <div className="min-h-screen flex flex-col md:max-w-5xl md:mx-auto md:px-6">
        {/* Header */}
        <header className="relative z-20 px-6 pt-12 pb-2 flex items-center justify-between w-full backdrop-blur-[2px] md:pt-8 md:pb-6">
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-lg border border-white/20">
                LVL {level}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                {getLevelName()}
              </span>
            </div>
            <div className="flex items-center gap-3 w-full max-w-[200px]">
              <div className="flex-1 h-3 bg-white/60 rounded-full overflow-hidden border border-white/40 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-purple-400 relative overflow-hidden transition-all duration-1000"
                  style={{ width: `${xpPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_2s_ease-in-out_infinite]"></div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-primary whitespace-nowrap drop-shadow-sm">
                {xp} XP
              </span>
            </div>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 glass-card hover:bg-white rounded-full transition-all active:scale-95 shadow-sm group">
            <span className="material-symbols-outlined text-[18px] text-gray-600 group-hover:rotate-180 transition-transform duration-500">sync</span>
          </button>
        </header>

        {/* Main Content Grid */}
        <main className="flex-1 relative z-10 pb-32 no-scrollbar w-full flex flex-col md:grid md:grid-cols-12 md:gap-8 md:items-start">
          
          {/* LEFT COLUMN: Fortress Visual */}
          <section className="relative w-full flex flex-col items-center pt-4 px-4 pb-2 md:col-span-7 md:h-full md:justify-center">
            
            {/* Top Right Floating Card */}
            <div className="absolute top-0 right-4 z-30 flex flex-col items-end md:right-10 md:top-10">
              <div className="animate-float-delayed relative">
                <div className="glass-card text-gray-800 text-[10px] font-bold py-1.5 px-3 rounded-xl rounded-br-none shadow-lg mb-1 mr-8 whitespace-nowrap animate-bounce">
                  Pertahanan stabil!
                </div>
                <div className="w-14 h-14 rounded-xl border-2 border-white shadow-xl overflow-hidden bg-purple-50 relative group cursor-pointer transform rotate-3 hover:rotate-0 transition-all">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Fortress Visual (USING DEBUG LEVEL) */}
            <div className="relative w-full aspect-square max-w-[320px] mx-auto md:max-w-full md:aspect-[4/5] flex items-center justify-center -mt-4 md:mt-0">
               <Fortress3D hp={hp} level={debugLevel} className="transform scale-110 md:scale-125 transition-transform duration-700" />
            </div>

            {/* Floating Action Buttons Overlay (Keep existing) */}
            <div className="absolute inset-0 pointer-events-none">
               {/* Left Floating Goal Button */}
               <div className="absolute top-[20%] left-[15%] z-10 animate-float-delayed pointer-events-auto">
                 <button 
                   onClick={() => router.push('/add?type=income')}
                   className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center hover:border-primary hover:text-primary transition-colors group relative"
                 >
                   <span className="material-symbols-outlined text-gray-400 group-hover:text-primary">add</span>
                   <span className="absolute -bottom-4 bg-gray-800 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                     Income
                   </span>
                 </button>
               </div>
 
               {/* Right Floating Savings Icon */}
               <div className="absolute top-[20%] right-[15%] z-10 animate-float pointer-events-auto">
                 <div className="w-12 h-14 bg-blue-500 rounded-lg shadow-[0_8px_0_#1e3a8a] border-2 border-blue-400 flex items-center justify-center relative">
                   <span className="material-symbols-outlined text-white text-lg">savings</span>
                   <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[8px] font-bold px-1 rounded-full border border-white shadow-sm">
                     Lvl {debugLevel}
                   </div>
                 </div>
               </div>
 
               {/* Bottom Left Lock Icon */}
               <div className="absolute bottom-[25%] left-[15%] z-20 pointer-events-auto">
                 <button className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center hover:border-primary hover:text-primary transition-colors group relative">
                   <span className="material-symbols-outlined text-gray-400 group-hover:text-primary">lock</span>
                 </button>
               </div>
            </div>

          </section>

          {/* RIGHT COLUMN: 4-Card Dashboard Layout */}
          <section className="flex flex-col gap-3 px-6 md:col-span-5 md:px-0 md:pt-10">
            
            {/* 1. 🛡️ FORTRESS STATUS CARD (HERO) */}
            <div className="w-full glass-card rounded-super p-5 shadow-soft relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3">
                 <div className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                   hp > 70 ? 'bg-green-100 text-green-700 border-green-200' :
                   hp > 40 ? 'bg-amber-100 text-amber-700 border-amber-200' :
                   'bg-red-100 text-red-700 border-red-200 animate-pulse'
                 }`}>
                   {hp > 70 ? 'AMAN' : hp > 40 ? 'WASPADA' : 'KRITIS'}
                 </div>
              </div>
              
              <div className="flex flex-col gap-3 relative z-10">
                <div>
                   <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Integritas Benteng</span>
                   <div className="flex items-end gap-2 mt-1">
                     <span className={`text-4xl font-black ${hp > 50 ? 'text-gray-800' : 'text-red-600'}`}>
                        {hp.toFixed(0)}%
                     </span>
                     <span className="text-sm font-bold text-gray-400 mb-1.5">/ 100%</span>
                   </div>
                </div>

                {/* HP Bar */}
                <div className="h-4 bg-gray-100/80 rounded-full p-1 shadow-inner relative overflow-hidden w-full">
                  <div 
                    className={`h-full rounded-full shadow-lg relative overflow-hidden transition-all duration-1000 ${
                       hp > 70 ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
                       hp > 40 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                       'bg-gradient-to-r from-red-500 to-rose-600'
                    }`}
                    style={{ width: `${hp}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-100">
                  <span className="text-gray-500">Sisa Budget</span>
                  <span className="font-bold text-gray-800">Rp {formatIDR(remaining).replace('Rp', '')}</span>
                </div>
                
                {/* Total Saldo */}
                <div className="flex justify-between items-center text-xs pt-2">
                  <span className="text-gray-400 text-[10px] uppercase tracking-wide">Total Saldo</span>
                  <span className="font-bold text-gray-600">Rp {formatIDR(
                    transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)
                  ).replace('Rp', '')}</span>
                </div>
              </div>
            </div>

            {/* 2. ⚔️ BATTLE TODAY CARD */}
            <div className="w-full glass-card rounded-2xl p-4 shadow-sm flex items-center justify-between group hover:bg-white/60 transition-colors cursor-pointer" onClick={() => router.push('/transactions')}>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined">swords</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Pertarungan Hari Ini</span>
                    <span className="text-xs font-bold text-gray-700">
                       {todayTransactions.length > 0 ? `Bertarung ${todayTransactions.length} kali` : "Belum ada aktivitas"} ⚔️
                    </span>
                  </div>
               </div>
               <div className="text-right">
                  <span className="block text-[10px] font-bold text-success">+{todayXP} XP</span>
                  <span className="text-xs font-bold text-danger">-Rp {formatIDR(todayExpense).replace('Rp', '')}</span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               {/* 3. 📊 SPENDING TREND CARD */}
               <div className="glass-card rounded-2xl p-4 shadow-sm flex flex-col justify-between min-h-[100px] hover:bg-white/60 transition-colors relative overflow-hidden">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Trend</span>
                  
                  <div className="flex flex-col gap-1 mt-2 relative z-10">
                     <span className={`material-symbols-outlined text-2xl ${trendColor}`}>{trendIcon}</span>
                     <p className={`text-[10px] font-bold leading-tight ${trendColor}`}>
                       {trendText}
                     </p>
                  </div>
                  
                  {/* Decor Background */}
                  <div className={`absolute -right-2 -bottom-2 w-12 h-12 rounded-full opacity-10 blur-xl ${
                    trendIcon === 'trending_up' ? 'bg-red-500' : 'bg-green-500'
                  }`}></div>
               </div>

               {/* 4. 🎯 NEXT ACTION CARD */}
               <div className={`glass-card rounded-2xl p-4 shadow-sm flex flex-col justify-between min-h-[100px] border relative overflow-hidden ${actionColor}`}>
                  <span className="text-[10px] font-bold opacity-70 uppercase">Saran Strategis</span>
                  
                  <div className="flex flex-col gap-1 mt-2">
                     <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-lg">{actionIcon}</span>
                     </div>
                     <p className="text-[10px] font-bold leading-tight">
                       "{actionMessage}"
                     </p>
                  </div>
               </div>
            </div>

            {/* Tips Ticker */}
            <div className="w-full h-8 bg-white/30 rounded-lg overflow-hidden relative flex items-center px-3 mt-1">
              <div className="text-[10px] font-medium text-gray-500 flex flex-col w-full h-full justify-center">
                 <span className="truncate">💡 Tips: Leveling up membuka dekorasi baru untuk bentengmu!</span>
              </div>
            </div>

          </section>

        </main>
      </div>

      {/* Floating FAB - Adjusted for Desktop */}
      <div className="fixed bottom-[90px] left-0 w-full flex justify-center pointer-events-none z-40 md:bottom-10 md:left-auto md:right-10 md:w-auto md:justify-end">
        <button 
          onClick={() => router.push('/add')}
          className="pointer-events-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-dark text-white rounded-full shadow-glow flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-primary/30 border-4 border-white/30 backdrop-blur-sm"
        >
          <span className="material-symbols-outlined text-[32px] group-hover:rotate-90 transition-transform duration-300 drop-shadow-md">add</span>
        </button>
      </div>

      {/* QC FLOATING PANEL (Fixed Bottom Left) */}
      <div className="fixed bottom-24 left-4 z-50 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-xl border border-pink-200/50 flex flex-col gap-2 w-40 animate-slide-up hover:opacity-100 opacity-80 transition-opacity">
        <label className="text-[10px] font-bold text-slate-500 uppercase flex justify-between">
          <span>🛠️ Test Level:</span>
          <span className="text-primary font-black bg-primary/10 px-1.5 rounded text-xs">{debugLevel}</span>
        </label>
        <input 
          type="range" 
          min="1" 
          max="10" 
          value={debugLevel} 
          onChange={(e) => setDebugLevel(parseInt(e.target.value))}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[8px] text-gray-400 px-0.5 font-medium">
           <span>Lv1</span>
           <span>Lv10</span>
        </div>
      </div>

      {/* Custom Bottom Navigation */}
      <BottomNav />
    </>
  );
}
