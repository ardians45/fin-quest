import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
  xp: number;
  level: number;
  streak: number;
  lastTransactionDate: string | null;
  achievements: string[];
  decorations: string[];
  addXP: (amount: number) => void;
  updateStreak: () => void;
  unlockAchievement: (achievement: string) => void;
  unlockDecoration: (decoration: string) => void;
  getLevelProgress: () => { current: number; max: number; percentage: number };
  getLevelName: () => string;
}

const XP_PER_LEVEL = 100;

const LEVEL_NAMES: Record<number, string> = {
  1: 'Pemula Keuangan',
  2: 'Penjaga Hemat',
  3: 'Satria Tabungan',
  4: 'Ksatria Benteng',
  5: 'Benteng Pejuang',
  6: 'Ahli Finansial',
  7: 'Master Budget',
  8: 'Raja Hemat',
  9: 'Legenda Keuangan',
  10: 'Dewa Finansial',
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      streak: 0,
      lastTransactionDate: null,
      achievements: [],
      decorations: ['flag'], // Default unlocked
      
      addXP: (amount) => {
        set((state) => {
          const newXP = state.xp + amount;
          const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
          return {
            xp: newXP,
            level: newLevel,
          };
        });
      },
      
      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = get().lastTransactionDate;
        
        if (!lastDate) {
          set({ streak: 1, lastTransactionDate: today });
          return;
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastDate === today) {
          // Already recorded today
          return;
        } else if (lastDate === yesterdayStr) {
          // Continued streak
          set((state) => ({
            streak: state.streak + 1,
            lastTransactionDate: today,
          }));
        } else {
          // Streak broken
          set({ streak: 1, lastTransactionDate: today });
        }
      },
      
      unlockAchievement: (achievement) => {
        set((state) => {
          if (state.achievements.includes(achievement)) return state;
          return { achievements: [...state.achievements, achievement] };
        });
      },
      
      unlockDecoration: (decoration) => {
        set((state) => {
          if (state.decorations.includes(decoration)) return state;
          return { decorations: [...state.decorations, decoration] };
        });
      },
      
      getLevelProgress: () => {
        const { xp, level } = get();
        const currentLevelXP = (level - 1) * XP_PER_LEVEL;
        const nextLevelXP = level * XP_PER_LEVEL;
        const progress = xp - currentLevelXP;
        const needed = nextLevelXP - currentLevelXP;
        return {
          current: progress,
          max: needed,
          percentage: Math.round((progress / needed) * 100),
        };
      },
      
      getLevelName: () => {
        const level = get().level;
        return LEVEL_NAMES[Math.min(level, 10)] || LEVEL_NAMES[10];
      },
    }),
    {
      name: 'fin-quest-game',
    }
  )
);
