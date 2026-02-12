'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTransactionStore, useBudgetStore } from '@/stores';
import { BottomNav } from '@/components/layout/BottomNav';
import { motion } from 'framer-motion';

export default function StatsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { transactions, getTotalExpenseThisMonth, getTotalIncomeThisMonth } = useTransactionStore();
  const { monthlyBudget } = useBudgetStore();
  const totalExpense = getTotalExpenseThisMonth();
  const totalIncome = getTotalIncomeThisMonth();
  const netBalance = totalIncome - totalExpense;

  useEffect(() => {
    setMounted(true);
  }, []);

  // === NEW: Calculate insights data ===
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);

  // 1. Daily Spending Pattern
  const dailyPattern = useMemo(() => {
    const dailyExpenses: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
      .forEach(t => {
        const day = new Date(t.date).getDate();
        dailyExpenses[day] = (dailyExpenses[day] || 0) + t.amount;
      });
    
    const maxExpense = Math.max(...Object.values(dailyExpenses), 1);
    const busiestDay = Object.entries(dailyExpenses).sort(([,a], [,b]) => b - a)[0];
    
    return { dailyExpenses, maxExpense, busiestDay };
  }, [transactions, currentMonth]);

  // 2. Transaction Frequency
  const frequency = useMemo(() => {
    const thisMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    const lastMonthTransactions = transactions.filter(t => t.date.startsWith(lastMonth));
    
    return {
      thisMonth: thisMonthTransactions.length,
      lastMonth: lastMonthTransactions.length,
      expenseCount: thisMonthTransactions.filter(t => t.type === 'expense').length,
      incomeCount: thisMonthTransactions.filter(t => t.type === 'income').length,
    };
  }, [transactions, currentMonth, lastMonth]);

  // 3. Month-over-Month Comparison
  const momComparison = useMemo(() => {
    const lastMonthExpense = transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(lastMonth))
      .reduce((sum, t) => sum + t.amount, 0);
    
    if (lastMonthExpense === 0) return { change: 0, isIncrease: false, insight: "Data bulan lalu belum ada" };
    
    const change = ((totalExpense - lastMonthExpense) / lastMonthExpense) * 100;
    const isIncrease = change > 0;
    
    let insight = "";
    if (Math.abs(change) < 5) {
      insight = "Pengeluaran stabil seperti bulan lalu";
    } else if (isIncrease) {
      insight = `Pengeluaran naik ${Math.abs(change).toFixed(0)}% dari bulan lalu ⚠️`;
    } else {
      insight = `Kamu hemat ${Math.abs(change).toFixed(0)}% dibanding bulan lalu! 🎉`;
    }
    
    return { change, isIncrease, insight };
  }, [transactions, totalExpense, lastMonth]);

  // Category Breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    transactions.forEach((t) => {
      if (t.type === 'expense' && t.date.startsWith(currentMonth)) {
        breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
      }
    });
    return Object.entries(breakdown)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      }));
  }, [transactions, totalExpense, currentMonth]);

  const getCategoryIcon = (category: string) => {
    const map: Record<string, string> = {
      food: 'restaurant',
      transport: 'directions_car',
      shopping: 'shopping_bag',
      entertainment: 'sports_esports',
      education: 'school',
      health: 'medical_services',
      utilities: 'bolt',
      salary: 'payments',
      gift: 'redeem',
      other: 'inventory_2',
    };
    return map[category] || 'category';
  };

  const getCategoryColor = (index: number) => {
    const colors = ['bg-pink-500', 'bg-blue-500', 'bg-orange-500', 'bg-green-500', 'bg-purple-500'];
    return colors[index % colors.length];
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('id-ID').format(value);

  // Hydration check - prevent SSR/CSR mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full"></div>
          <span className="text-sm text-gray-500">Memuat statistik...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light font-display pb-32 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/80 to-transparent"></div>
        <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-[50px] right-[-50px] w-[200px] h-[200px] bg-blue-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 pt-12 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistik</h1>
          <p className="text-gray-500 text-sm">Analisis pengeluaranmu</p>
        </div>
        <button 
          onClick={() => router.push('/transactions')}
          className="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-primary shadow-soft hover:bg-white hover:scale-105 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined">receipt_long</span>
        </button>
      </header>

      <main className="px-6 relative z-10 flex flex-col gap-6">
        
        {/* Summary Card - Financial Overview */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card p-6 rounded-super shadow-soft relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full pointer-events-none"></div>
          
          <div className="flex flex-col gap-4 relative z-10">
            <span className="text-gray-500 text-sm font-bold uppercase tracking-wider">Ringkasan Bulan Ini</span>
            
            {/* Income, Expense, Net Balance */}
            <div className="grid grid-cols-3 gap-3">
              {/* Income */}
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Pemasukan</span>
                <div className="flex flex-col mt-1">
                  <span className="text-xs font-bold text-success">+Rp {formatCurrency(totalIncome)}</span>
                </div>
              </div>
              
              {/* Expense */}
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Pengeluaran</span>
                <div className="flex flex-col mt-1">
                  <span className="text-xs font-bold text-danger">-Rp {formatCurrency(totalExpense)}</span>
                </div>
              </div>
              
              {/* Net Balance */}
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Saldo Bersih</span>
                <div className="flex flex-col mt-1">
                  <span className={`text-xs font-bold ${netBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                    {netBalance >= 0 ? '+' : ''}Rp {formatCurrency(Math.abs(netBalance))}
                  </span>
                </div>
              </div>
            </div>

            {/* Budget Progress Bar */}
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <div className="flex justify-between text-xs font-bold text-gray-500">
                <span>Penggunaan Budget</span>
                <span>{monthlyBudget > 0 ? Math.round((totalExpense / monthlyBudget) * 100) : 0}%</span>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg transition-all duration-1000"
                  style={{ width: `${monthlyBudget > 0 ? Math.min((totalExpense / monthlyBudget) * 100, 100) : 0}%` }}
                ></div>
              </div>
              <div className="text-right text-[10px] text-gray-400">
                dari Rp {formatCurrency(monthlyBudget)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* NEW: Insights Grid (Frequency + MoM) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Transaction Frequency */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-indigo-500 text-[20px]">receipt</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Frekuensi</span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-black text-gray-800">{frequency.thisMonth}</span>
              <span className="text-xs font-bold text-gray-400">transaksi</span>
            </div>
            <div className="text-[10px] text-gray-500">
              {frequency.thisMonth - frequency.lastMonth >= 0 ? '+' : ''}{frequency.thisMonth - frequency.lastMonth} dari bulan lalu
            </div>
          </motion.div>

          {/* Month-over-Month */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`glass-card rounded-2xl p-4 shadow-sm border ${
              momComparison.isIncrease ? 'border-red-200 bg-red-50/30' : 'border-green-200 bg-green-50/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined text-[20px] ${
                momComparison.isIncrease ? 'text-danger' : 'text-success'
              }`}>
                {momComparison.isIncrease ? 'trending_up' : 'trending_down'}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">vs Bulan Lalu</span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className={`text-2xl font-black ${
                momComparison.isIncrease ? 'text-danger' : 'text-success'
              }`}>
                {momComparison.isIncrease ? '+' : ''}{Math.abs(momComparison.change).toFixed(0)}%
              </span>
            </div>
            <div className="text-[10px] text-gray-600 font-medium">
              {momComparison.insight}
            </div>
          </motion.div>
        </div>

        {/* NEW: Daily Spending Pattern */}
        {Object.keys(dailyPattern.dailyExpenses).length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-500 text-[20px]">show_chart</span>
                <h2 className="text-sm font-bold text-gray-800">Pola Harian</h2>
              </div>
              {dailyPattern.busiestDay && (
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                  Puncak: Tanggal {dailyPattern.busiestDay[0]}
                </span>
              )}
            </div>

            {/* Mini Bar Chart */}
            <div className="flex items-end justify-between gap-1 h-24">
              {Array.from({ length: 7 }, (_, i) => {
                const today = new Date();
                const targetDate = new Date(today.setDate(today.getDate() - (6 - i)));
                const day = targetDate.getDate();
                const expense = dailyPattern.dailyExpenses[day] || 0;
                const height = dailyPattern.maxExpense > 0 ? (expense / dailyPattern.maxExpense) * 100 : 0;
                
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-gray-100 rounded-t-lg relative overflow-hidden" style={{ height: '80px' }}>
                      <div 
                        className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-500 to-purple-400 rounded-t-lg transition-all duration-500"
                        style={{ height: `${height}%` }}
                      ></div>
                    </div>
                    <span className="text-[8px] font-bold text-gray-400">{day}</span>
                  </div>
                );
              })}
            </div>
            
            <p className="text-[10px] text-gray-500 text-center mt-3">
              7 hari terakhir
            </p>
          </motion.div>
        )}

        {/* Categories Chart */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Kategori</h2>
            <button className="text-primary text-xs font-bold bg-primary/5 px-2 py-1 rounded-lg">
              Bulan Ini
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {categoryBreakdown.length > 0 ? (
              categoryBreakdown.map((item, index) => (
                <motion.div
                  key={item.category}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="glass-card p-4 rounded-2xl flex items-center gap-4 active:scale-[0.99] transition-transform"
                >
                  {/* Icon Box */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${getCategoryColor(index)}`}>
                    <span className="material-symbols-outlined">{getCategoryIcon(item.category)}</span>
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-800 capitalize">{item.category}</span>
                      <span className="font-bold text-gray-900">Rp {formatCurrency(item.amount)}</span>
                    </div>
                    
                    {/* Bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${getCategoryColor(index).replace('bg-', 'bg-')}`}
                          style={{ width: `${item.percentage}%`, opacity: 0.7 }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-gray-400 w-8 text-right">
                        {Math.round(item.percentage)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 glass-card rounded-2xl border-dashed">
                <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">data_loss_prevention</span>
                <p>Belum ada data pengeluaran.</p>
              </div>
            )}
          </div>
        </section>

      </main>
      
      <div className="fixed bottom-[90px] left-0 w-full flex justify-center pointer-events-none z-40">
        <button 
          onClick={() => router.push('/add')}
          className="pointer-events-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-dark text-white rounded-full shadow-glow flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-primary/30 border-4 border-white/30 backdrop-blur-sm"
        >
          <span className="material-symbols-outlined text-[32px] group-hover:rotate-90 transition-transform duration-300 drop-shadow-md">add</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
