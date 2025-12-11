// screens/Dashboard/MonthlyEmiTracker.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '../../theme';
import { useLoans, getEmiStats, formatCurrency } from '../../LoansContext';

const DAYS_WINDOW = 10;
const INR_PER_USDT = 90; // 1 USDT ≈ ₹90
const PROGRESS_KEY_PREFIX = 'loanTracker_usdtProgress_';

// Helper to store per-month progress
const getCurrentMonthKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export default function MonthlyEmiTracker() {
  const { loans } = useLoans() || {};

  // --- 1) Total monthly EMI outflow for ACTIVE loans ---
  const monthlyOutflow = (loans || []).reduce((sum, loan) => {
    const { emisRemaining, totalEmis } = getEmiStats(loan);

    if (totalEmis != null && emisRemaining === 0) {
      return sum; // fully completed loan, no EMI this month
    }

    return sum + Number(loan.emiAmount || 0);
  }, 0);

  const monthlyOutflowUsdt = monthlyOutflow > 0 ? monthlyOutflow / INR_PER_USDT : 0;

  // --- 2) Monthly average per day (this month) ---
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthlyAvgPerDay = monthlyOutflow > 0 && daysInMonth > 0 ? monthlyOutflow / daysInMonth : 0;
  const monthlyAvgPerDayUsdt = monthlyAvgPerDay > 0 ? monthlyAvgPerDay / INR_PER_USDT : 0;

  // --- 3) EMIs due in the next 10 days + avg per day in that window ---
  const todayDateOnly = new Date(year, month, today.getDate());
  const msPerDay = 1000 * 60 * 60 * 24;

  const dueInNext10Days = (loans || []).reduce((sum, loan) => {
    if (!loan.emiDayOfMonth || !loan.emiAmount) return sum;

    const { emisRemaining, totalEmis } = getEmiStats(loan);
    if (totalEmis != null && emisRemaining === 0) return sum;

    const emiDay = Number(loan.emiDayOfMonth);
    if (isNaN(emiDay)) return sum;

    const baseYear = today.getFullYear();
    const baseMonth = today.getMonth();

    let nextEmiDate = new Date(baseYear, baseMonth, emiDay);
    if (nextEmiDate < todayDateOnly) {
      nextEmiDate = new Date(baseYear, baseMonth + 1, emiDay);
    }

    const diffDays = (nextEmiDate.getTime() - todayDateOnly.getTime()) / msPerDay;

    if (diffDays >= 0 && diffDays < DAYS_WINDOW) {
      return sum + Number(loan.emiAmount || 0);
    }

    return sum;
  }, 0);

  const avgPerDayNext10 = dueInNext10Days > 0 ? dueInNext10Days / DAYS_WINDOW : 0;
  const avgPerDayNext10Usdt = avgPerDayNext10 > 0 ? avgPerDayNext10 / INR_PER_USDT : 0;

  // --- 4) Monthly USDT PROGRESS (manual, per-month, supports +/- deltas) ---
  const [usdtProgress, setUsdtProgress] = useState(0); // net USDT secured so far this month
  const [progressInput, setProgressInput] = useState(''); // delta to apply (+5, -10, etc.)

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const key = PROGRESS_KEY_PREFIX + getCurrentMonthKey();
        const stored = await AsyncStorage.getItem(key);
        if (stored != null) {
          const val = Number(stored);
          if (!isNaN(val)) {
            setUsdtProgress(val);
          }
        }
      } catch (e) {
        console.warn('Failed to load USDT progress', e);
      }
    };

    loadProgress();
  }, []);

  const handleSaveProgress = async () => {
    const delta = Number(progressInput);
    if (isNaN(delta)) {
      // invalid input, ignore (later you can show a toast/snackbar)
      return;
    }

    // Apply delta (can be positive or negative), but do not allow below 0
    const newValue = Math.max(0, usdtProgress + delta);

    setUsdtProgress(newValue);
    setProgressInput(''); // clear input after applying

    try {
      const key = PROGRESS_KEY_PREFIX + getCurrentMonthKey();
      await AsyncStorage.setItem(key, String(newValue));
    } catch (e) {
      console.warn('Failed to save USDT progress', e);
    }
  };

  const progressRatio = monthlyOutflowUsdt > 0 ? Math.min(1, usdtProgress / monthlyOutflowUsdt) : 0;
  const progressPercent = Math.round(progressRatio * 100);

  // If there are no active EMIs, we can optionally hide this card
  if (monthlyOutflow <= 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>EMI Planner</Text>

      {/* Monthly summary */}
      <Text style={styles.sectionLabel}>This month</Text>
      <Text style={styles.line}>
        Monthly EMI outflow: <Text style={styles.highlight}>{formatCurrency(monthlyOutflow)}</Text>
      </Text>
      <Text style={styles.lineMuted}>
        ≈ <Text style={styles.highlight}>{monthlyOutflowUsdt.toFixed(2)} USDT</Text>
      </Text>

      <Text style={styles.line}>
        Avg needed per day (this month):{' '}
        <Text style={styles.subHighlight}>{formatCurrency(monthlyAvgPerDay)}</Text>
      </Text>
      <Text style={styles.lineMuted}>
        ≈ <Text style={styles.highlight}>{monthlyAvgPerDayUsdt.toFixed(2)} USDT</Text> per day
      </Text>

      {/* --- TRADING PROGRESS VS MONTHLY EMI TARGET --- */}
      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>Trading progress towards this month&apos;s EMIs</Text>

        <View style={styles.progressHeaderRow}>
          <Text style={styles.progressSubText}>
            Net secured so far:{' '}
            <Text style={styles.usdtHighlight}>{usdtProgress.toFixed(2)} USDT</Text>
          </Text>
          <Text style={styles.progressSubText}>
            Target: <Text style={styles.usdtHighlight}>{monthlyOutflowUsdt.toFixed(2)} USDT</Text>
          </Text>
        </View>

        <View style={styles.progressBarOuter}>
          <View style={[styles.progressBarInner, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressPercentLabel}>{progressPercent}% of monthly target</Text>

        {/* Input + Update (delta mode) */}
        <View style={styles.progressInputRow}>
          <TextInput
            style={styles.progressInput}
            value={progressInput}
            onChangeText={setProgressInput}
            keyboardType="numeric"
            placeholder="Add / subtract USDT (e.g. 5 or -10)"
            placeholderTextColor={theme.colors.textMuted}
          />
          <TouchableOpacity style={styles.progressButton} onPress={handleSaveProgress}>
            <Text style={styles.progressButtonText}>Update</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Separator */}
      <View style={styles.separator} />

      {/* Next 10 days focus */}
      <Text style={styles.sectionLabel}>Next {DAYS_WINDOW} days focus</Text>

      {dueInNext10Days > 0 ? (
        <>
          <Text style={styles.line}>
            EMIs due in next {DAYS_WINDOW} days:{' '}
            <Text style={styles.highlight}>{formatCurrency(dueInNext10Days)}</Text>
          </Text>
          <Text style={styles.line}>
            Avg needed per day (next {DAYS_WINDOW}):{' '}
            <Text style={styles.subHighlight}>{formatCurrency(avgPerDayNext10)}</Text>
          </Text>
          <Text style={styles.lineMuted}>
            ≈ <Text style={styles.highlight}>{avgPerDayNext10Usdt.toFixed(2)} USDT</Text> per day
          </Text>
        </>
      ) : (
        <Text style={styles.lineMuted}>No EMIs falling in the next {DAYS_WINDOW} days.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...((theme.shadow && theme.shadow.card) || {}),
  },
  title: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  sectionLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: theme.spacing.xs,
    marginBottom: 2,
  },
  line: {
    color: theme.colors.text,
    fontSize: 13,
    marginTop: 2,
  },
  lineMuted: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  highlight: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
  subHighlight: {
    color: theme.colors.primarySoft,
    fontWeight: '600',
  },

  // Trading progress styles
  progressSection: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: '#171B28',
  },
  progressTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  progressSubText: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  usdtHighlight: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
  progressBarOuter: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#1F2433',
    overflow: 'hidden',
    marginTop: theme.spacing.xs,
  },
  progressBarInner: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: theme.colors.accent,
  },
  progressPercentLabel: {
    marginTop: 4,
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  progressInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  progressInput: {
    flex: 1,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: '#2A3145',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: theme.colors.text,
  },
  progressButton: {
    marginLeft: theme.spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
  progressHint: {
    marginTop: 4,
    fontSize: 10,
    color: theme.colors.textMuted,
  },

  separator: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    height: 1,
    backgroundColor: '#1C2132',
  },
});
