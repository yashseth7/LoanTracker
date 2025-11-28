// LoansContext.js
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
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

  // Persist whenever loans change
  useEffect(() => {
    if (loading) return; // skip first render
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loans)).catch((e) =>
      console.warn('Failed to save loans', e)
    );
  }, [loans, loading]);

  const addLoan = ({ name, lender, remainingAmount }) => {
    setLoans((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name,
        lender,
        remainingAmount,
      },
    ]);
  };

  const totalLiability = loans.reduce(
    (sum, loan) => sum + (loan.remainingAmount || 0),
    0
  );

  return (
    <LoansContext.Provider
      value={{ loans, addLoan, totalLiability, loading }}
    >
      {children}
    </LoansContext.Provider>
  );
}

export function useLoans() {
  return useContext(LoansContext);
}

export const formatCurrency = (amount) =>
  `₹ ${Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
