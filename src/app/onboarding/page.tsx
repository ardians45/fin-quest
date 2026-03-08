'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useBudgetStore, useGameStore, useTransactionStore } from '@/stores';
import { Fortress3D } from '@/components/visuals/Fortress3D';

const BUDGET_PRESETS = [
  { label: '1 Juta', value: 1000000 },
  { label: '2 Juta', value: 2000000 },
  { label: '3 Juta', value: 3000000 },
  { label: '5 Juta', value: 5000000 },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [budget, setBudget] = useState(2000000);
  const [previewLevel, setPreviewLevel] = useState(1);
  const { setMonthlyBudget, completeOnboarding } = useBudgetStore();
  const { unlockAchievement } = useGameStore();
  const { addTransaction } = useTransactionStore();

  // Auto-level preview animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPreviewLevel(prev => (prev >= 10 ? 1 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPreviewDecorations = (level: number) => {
    const decos = [];
    if (level >= 2) decos.push('red_flag');
    if (level >= 3) decos.push('wall_torch');
    if (level >= 4) decos.push('royal_banner');
    if (level >= 5) decos.push('gold_flag');
    if (level >= 6) decos.push('garden');
    if (level >= 7) decos.push('fountain');
    return decos;
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setBudget(Number(value) || 0);
  };

  const handleComplete = () => {
    setMonthlyBudget(budget);
    completeOnboarding();
    unlockAchievement('first_setup');
    
    // Add initial balance as first income transaction
    addTransaction({
      amount: budget,
      category: 'salary',
      type: 'income',
      date: new Date().toISOString().split('T')[0],
      note: 'Saldo Awal (Anggaran)',
    });

    router.replace('/dashboard');
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('id-ID').format(value);

  const variants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col md:flex-row p-6 bg-bg-light font-display text-gray-900 md:p-0">
      
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 w-full h-full bg-gradient-to-b from-purple-50/50 to-blue-50/30"></div>
        <div className="absolute top-[20%] left-[-20%] w-[140%] h-[40%] bg-purple-200/20 rounded-[100%] blur-3xl transform -rotate-12"></div>
        <div className="absolute top-[30%] right-[-10%] w-[80%] h-[50%] bg-indigo-200/20 rounded-[100%] blur-3xl"></div>
      </div>

      {/* Desktop Branding (Top Left) */}
      <div className="absolute top-8 left-8 z-30 hidden md:flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg text-white">
          <span className="material-symbols-outlined">fort</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-none">MyDuit Quest</h1>
          <p className="text-xs text-gray-500 font-medium">Financial Fortress</p>
        </div>
      </div>

      {/* Left Col: Visual (Desktop) */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] h-screen items-center justify-center relative z-10 bg-white/30 backdrop-blur-sm border-r border-white/50">
         <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
            <div className="transform scale-150 transition-transform duration-700 hover:scale-[1.6]">
              <Fortress3D level={previewLevel} activeDecorations={getPreviewDecorations(previewLevel)} />
            </div>
            
            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[20%] left-[10%] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined">savings</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Budget</p>
                  <p className="text-sm font-bold text-gray-800">Terkendali</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[25%] right-[10%] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined">shield</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Pertahanan</p>
                  <p className="text-sm font-bold text-gray-800">Aman</p>
                </div>
              </div>
            </motion.div>
         </div>
      </div>

      {/* Right Col: Interaction */}
      <div className="w-full md:w-1/2 lg:w-[45%] h-[100dvh] flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 relative z-20 overflow-hidden">
        <div className="w-full h-full max-w-md flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Welcome */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center md:items-start text-center md:text-left h-full justify-center md:justify-center pt-8 md:pt-0"
              >
                {/* Mobile Visual */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8 md:hidden flex justify-center w-full relative"
                >
                  <div className="w-56 h-56 relative flex items-center justify-center">
                    <Fortress3D level={previewLevel} activeDecorations={getPreviewDecorations(previewLevel)} className="w-full h-full transform scale-[1.3] -mt-4" />
                    
                    {/* Floating Elements (Mobile Adapted) */}
                    <motion.div 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-[-5%] left-[-20%] bg-white/90 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-white/50 z-20 scale-90 origin-top-left"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm">savings</span>
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-0.5">Budget</p>
                          <p className="text-xs font-bold text-gray-800 leading-none">Terkendali</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      animate={{ y: [0, 10, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      className="absolute bottom-[-10%] right-[-30%] bg-white/90 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-white/50 z-20 scale-90 origin-bottom-right"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm">shield</span>
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-0.5">Pertahanan</p>
                          <p className="text-xs font-bold text-gray-800 leading-none">Aman</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] md:text-xs font-bold mb-3 inline-flex items-center gap-2 mt-auto md:mt-0">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Misi 1: Setup Awal
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-5xl font-black mb-2 text-gray-900 leading-[1.1]">
                  Siapkan <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Pertahanan</span> Finansialmu!
                </h1>
                <p className="text-gray-500 mb-8 leading-snug text-xs sm:text-sm md:text-lg md:pr-10 px-4 md:px-0">
                  Bangun benteng yang kuat. Setiap pengeluaran adalah serangan, dan budget adalah HP-mu. Siap bertahan?
                </p>

                <div className="mt-auto w-full md:mt-0">
                  <button
                    onClick={() => setStep(2)}
                    className="w-full max-w-[280px] md:max-w-none mx-auto md:w-auto px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-900 text-white font-bold text-sm md:text-lg shadow-xl hover:scale-[1.02] hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>Mulai Misi</span>
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Set Budget */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="w-full flex flex-col h-full justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2 md:mb-6">
                    <button 
                      onClick={() => setStep(1)}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-gray-600 text-[18px] md:text-2xl">arrow_back</span>
                    </button>
                    <span className="text-xs md:text-sm font-bold text-gray-400">Langkah 2 dari 3</span>
                  </div>

                  <div className="mb-2">
                    <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-0.5 md:mb-2 text-center md:text-left">Suplai Anggaran</h2>
                    <p className="text-gray-500 text-xs md:text-lg text-center md:text-left">
                      Tentukan batas pengeluran bulananmu.
                    </p>
                  </div>
                  
                  {/* Mobile Visual inside Step 2 */}
                  <div className="md:hidden flex flex-col items-center justify-center w-full my-4 relative">
                    <div className="w-36 h-36 sm:w-48 sm:h-48 relative flex items-center justify-center">
                      <Fortress3D level={previewLevel} activeDecorations={getPreviewDecorations(previewLevel)} className="w-full h-full transform scale-125" />
                      
                      {/* Floating Elements (Mobile Adapted) */}
                      <motion.div 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[-15%] left-[-30%] sm:left-[-15%] bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-lg border border-white/50 z-20 scale-75 origin-top-left flex items-center gap-2"
                      >
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm">savings</span>
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-400 font-bold uppercase leading-tight mb-0.5">Budget</p>
                          <p className="text-xs font-bold text-gray-800 leading-tight">Terkendali</p>
                        </div>
                      </motion.div>

                      <motion.div 
                        animate={{ y: [0, 5, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-[-10%] right-[-35%] sm:right-[-20%] bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-lg border border-white/50 z-20 scale-75 origin-bottom-right flex items-center gap-2"
                      >
                        <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm">shield</span>
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-400 font-bold uppercase leading-tight mb-0.5">Pertahanan</p>
                          <p className="text-xs font-bold text-gray-800 leading-tight">Aman</p>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  <div className="py-2 md:py-6 relative z-30">
                    <div className="relative max-w-[240px] md:max-w-none mx-auto md:mx-0">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm md:text-xl">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatCurrency(budget)}
                        onChange={handleBudgetChange}
                        className="w-full bg-white border-2 border-gray-100 rounded-xl md:rounded-2xl py-2 md:py-5 pl-10 md:pl-16 pr-3 md:pr-6 text-xl md:text-4xl font-black text-gray-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm md:text-left text-center"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-8 max-w-[280px] md:max-w-none mx-auto md:mx-0 relative z-30">
                    {BUDGET_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => setBudget(preset.value)}
                        className={`py-1.5 md:py-3 px-2 rounded-lg md:rounded-xl text-[10px] md:text-sm font-bold transition-all border-2 ${
                          budget === preset.value
                            ? 'bg-primary/5 text-primary border-primary'
                            : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-50'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-2 relative z-30">
                  <button
                    onClick={() => setStep(3)}
                    disabled={budget < 100000}
                    className="w-full max-w-[280px] md:max-w-none mx-auto py-2.5 md:py-4 rounded-xl md:rounded-2xl bg-gray-900 text-white font-bold text-sm md:text-lg shadow-xl hover:scale-[1.02] hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>Lanjut</span>
                    <span className="material-symbols-outlined text-[18px] md:text-2xl">arrow_forward</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="w-full flex flex-col h-full justify-center md:items-start pt-4 md:pt-0"
              >
                {/* Mobile Visual inside Step 3 */}
                <div className="md:hidden flex flex-col items-center justify-center w-full mb-4 relative">
                  <div className="w-40 h-40 sm:w-48 sm:h-48 relative flex items-center justify-center">
                    <Fortress3D level={previewLevel} activeDecorations={getPreviewDecorations(previewLevel)} className="w-full h-full transform scale-125" />
                  </div>
                </div>

                <div className="mb-4 text-center md:text-left mt-auto md:mt-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-success/10 text-success rounded-2xl md:rounded-3xl flex items-center justify-center mb-3 mx-auto md:mx-0">
                    <span className="material-symbols-outlined text-3xl md:text-4xl text-success drop-shadow-sm">verified</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">Benteng Siap!</h2>
                  <p className="text-gray-500 text-sm md:text-base leading-tight px-4 md:px-0">
                    Pertahananmu sudah terpasang kokoh.
                  </p>
                </div>

                <div className="w-full max-w-[300px] md:max-w-none mx-auto md:mx-0 bg-gray-50 p-4 md:p-6 rounded-2xl border border-gray-100 mb-6">
                  <div className="flex justify-between items-center mb-3 border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[14px]">shield</span>
                      </div>
                      <span className="text-gray-600 font-bold text-sm">Integritas</span>
                    </div>
                    <span className="text-success font-black text-lg">Aman</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[14px]">account_balance_wallet</span>
                      </div>
                      <span className="text-gray-600 font-bold text-sm">Anggaran</span>
                    </div>
                    <span className="text-gray-900 font-black text-lg text-right">Rp {formatCurrency(budget)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full max-w-[300px] md:max-w-none mx-auto md:mx-0 mt-auto md:mt-0 relative z-30 pb-4 md:pb-0">
                  <button
                    onClick={handleComplete}
                    className="w-full py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-primary text-white font-bold text-base md:text-lg shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>Masuk Arena</span>
                    <span className="material-symbols-outlined text-[18px] md:text-xl group-hover:translate-x-1 transition-transform">swords</span>
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-2.5 text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors"
                  >
                    Ubah Anggaran
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
