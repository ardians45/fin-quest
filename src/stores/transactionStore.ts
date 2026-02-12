import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Transaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  note: string;
  date: string;
  createdAt: number;
}

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  editTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByDate: (date: string) => Transaction[];
  getTotalExpenseThisMonth: () => number;
  getTotalIncomeThisMonth: () => number;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      
      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: generateId(),
          createdAt: Date.now(),
        };
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
      },
      
      editTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },
      
      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },
      
      getTransactionsByDate: (date) => {
        return get().transactions.filter((t) => t.date === date);
      },
      
      getTotalExpenseThisMonth: () => {
        const currentMonth = getCurrentMonth();
        return get()
          .transactions.filter(
            (t) => t.type === 'expense' && t.date.startsWith(currentMonth)
          )
          .reduce((sum, t) => sum + t.amount, 0);
      },
      
      getTotalIncomeThisMonth: () => {
        const currentMonth = getCurrentMonth();
        return get()
          .transactions.filter(
            (t) => t.type === 'income' && t.date.startsWith(currentMonth)
          )
          .reduce((sum, t) => sum + t.amount, 0);
      },
    }),
    {
      name: 'fin-quest-transactions',
    }
  )
);
