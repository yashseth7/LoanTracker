// LoansContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'loanTracker_loans';

const LoansContext = createContext();

export function LoansProvider({ children }) {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load loans from storage on startup
  useEffect(() => {
    const loadLoans = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setLoans(JSON.parse(stored));
        }
      } catch (e) {
        console.warn('Failed to load loans', e);
      } finally {
        setLoading(false);
      }
    };

    loadLoans();
  }, []);

  // Persist loans when updated
  useEffect(() => {
    if (loading) return; // prevent saving empty on first render
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loans)).catch(e =>
      console.warn('Failed to save loans', e),
    );
  }, [loans, loading]);

  // Add new loan with all fields
  const addLoan = ({
    name,
    lender,
    remainingAmount,
    interestRate,
    emiAmount,
    dueDate,
    emiDayOfMonth,
    totalEmis, // optional: total EMIs for this loan
    emisPaidCount, // optional: already paid
  }) => {
    // normalize numeric fields
    const balanceNum = Number(remainingAmount || 0);
    const emiNum = Number(emiAmount || 0);

    // derive totalEmis if not passed but we have balance + emi
    let derivedTotalEmis = typeof totalEmis === 'number' ? totalEmis : null;

    if (derivedTotalEmis == null && balanceNum > 0 && emiNum > 0) {
      derivedTotalEmis = Math.ceil(balanceNum / emiNum);
    }

    const initialPaidCount = typeof emisPaidCount === 'number' ? emisPaidCount : 0;

    setLoans(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name,
        lender,
        remainingAmount: balanceNum,
        interestRate,
        emiAmount: emiNum,
        dueDate,
        emiDayOfMonth,
        lastEmiPaidDate: null, // last EMI paid date (YYYY-MM-DD)
        totalEmis: derivedTotalEmis, // total instalments planned
        emisPaidCount: initialPaidCount, // how many EMIs completed
      },
    ]);
  };

  // Update existing loan by id
  const updateLoan = (id, updates) => {
    setLoans(prev => prev.map(loan => (loan.id === id ? { ...loan, ...updates } : loan)));
  };

  // Delete loan by id
  const deleteLoan = id => {
    setLoans(prev => prev.filter(loan => loan.id !== id));
  };

  /**
   * Mark EMI as paid for a given date (usually this month's EMI date)
   *
   * Behaviour:
   * - Sets lastEmiPaidDate (YYYY-MM-DD)
   * - Increments emisPaidCount ONCE per month to avoid double-tapping
   * - Reduces remainingAmount by emiAmount (capped at >= 0)
   */
  const markEmiPaid = (id, date) => {
    const iso = date instanceof Date ? date.toISOString().split('T')[0] : String(date);

    const paidDate = new Date(iso);
    if (isNaN(paidDate.getTime())) {
      console.warn('markEmiPaid: invalid date', date);
      return;
    }

    const paidYear = paidDate.getFullYear();
    const paidMonth = paidDate.getMonth();

    setLoans(prev =>
      prev.map(loan => {
        if (loan.id !== id) return loan;

        const emi = Number(loan.emiAmount || 0);
        const balance = Number(loan.remainingAmount || 0);
        const rate = Number(loan.interestRate || 0);

        if (emi <= 0 || balance <= 0) return loan;

        // Check if EMI already paid this cycle
        if (loan.lastEmiPaidDate) {
          const last = new Date(loan.lastEmiPaidDate);
          if (!isNaN(last.getTime())) {
            if (last.getFullYear() === paidYear && last.getMonth() === paidMonth) {
              return loan; // already paid this cycle
            }
          }
        }

        // ---- NEW BANK LOGIC ----
        const monthlyInterest = balance * (rate / 12 / 100);
        const principalRepaid = Math.max(0, emi - monthlyInterest);
        const newBalance = Math.max(0, balance - principalRepaid);

        const newEmiPaidCount = (loan.emisPaidCount || 0) + 1;
        const accumulatedInterest = (loan.totalInterestPaid || 0) + monthlyInterest;

        return {
          ...loan,
          lastEmiPaidDate: iso,
          emisPaidCount: newEmiPaidCount,
          totalInterestPaid: accumulatedInterest,
          remainingAmount: newBalance,
        };
      }),
    );
  };

  const totalLiability = loans.reduce((sum, loan) => sum + (Number(loan.remainingAmount) || 0), 0);

  return (
    <LoansContext.Provider
      value={{
        loans,
        addLoan,
        updateLoan,
        deleteLoan,
        markEmiPaid,
        totalLiability,
        loading,
      }}
    >
      {children}
    </LoansContext.Provider>
  );
}

export function useLoans() {
  return useContext(LoansContext);
}

// Currency helper
export const formatCurrency = amount =>
  `₹ ${Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;

// 🔢 EMI stats helper – use this in UI wherever you need per-loan progress
export const getEmiStats = loan => {
  if (!loan) {
    return {
      totalEmis: null,
      emisPaidCount: 0,
      emisRemaining: null,
      progressPct: 0,
    };
  }

  const totalEmis = typeof loan.totalEmis === 'number' ? loan.totalEmis : null;
  const emisPaidCount = loan.emisPaidCount ?? 0;

  const emisRemaining = totalEmis != null ? Math.max(totalEmis - emisPaidCount, 0) : null;

  const progressPct =
    totalEmis && totalEmis > 0 ? Math.min(100, Math.round((emisPaidCount / totalEmis) * 100)) : 0;

  return {
    totalEmis,
    emisPaidCount,
    emisRemaining,
    progressPct,
  };
};
