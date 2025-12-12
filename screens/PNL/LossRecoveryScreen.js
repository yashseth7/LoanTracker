import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '../../theme';

import PnLSummary from './components/PnLSummary';
import ViewModeTabs from './components/ViewModeTabs';
import PnLChart from './components/PnLChart';
import PnLInputSection from './components/PnLInputSection';
import EntriesList from './components/EntriesList';
import BaselineCard from './components/BaselineCard';

const STORAGE_KEY = 'pnl_entries_v1';
const BASELINE_KEY = 'pnl_baseline_v1';

export const VIEW_MODES = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
};

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const PAGE_SIZE = 20;

// -------- helpers (shared) ----------

export function getPnLColor(value) {
  if (value > 0) return theme.colors.success || '#4caf50';
  if (value < 0) return theme.colors.danger || '#f44336';
  return theme.colors.textMuted || theme.colors.text;
}

function getDateKey(dateStr, mode) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;

  if (mode === VIEW_MODES.DAILY) return dateStr;

  if (mode === VIEW_MODES.WEEKLY) {
    const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
    const pastDays = Math.floor((d - firstDayOfYear) / (24 * 60 * 60 * 1000));
    const week = Math.floor(pastDays / 7) + 1;
    return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
  }

  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${m}`;
}

function formatLabel(key, mode) {
  if (mode === VIEW_MODES.DAILY) return key.slice(5);
  if (mode === VIEW_MODES.WEEKLY) return key.split('-W')[1] || key;
  const [, m] = key.split('-');
  const idx = Number(m) - 1;
  return monthNames[idx] || key;
}

// ---------- main screen ----------

export default function LossRecoveryScreen() {
  const [entries, setEntries] = useState([]);

  // pagination (infinite scroll)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState('intraday');
  const [amountInput, setAmountInput] = useState('');
  const [viewMode, setViewMode] = useState(VIEW_MODES.DAILY);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [dateInput, setDateInput] = useState(todayStr);

  const [baselineIntraday, setBaselineIntraday] = useState(0);
  const [baselineSwing, setBaselineSwing] = useState(0);
  const [baselineIntradayInput, setBaselineIntradayInput] = useState('');
  const [baselineSwingInput, setBaselineSwingInput] = useState('');
  const [baselineSaved, setBaselineSaved] = useState(false);

  const screenWidth = Dimensions.get('window').width - 32;

  // ---- Load entries (with migration + cleanup) ----
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        const parsed = JSON.parse(raw);
        let arr = Array.isArray(parsed) ? parsed : [];

        arr = arr
          .map(e => {
            const date = typeof e.date === 'string' ? e.date : '';
            const account = e.account === 'intraday' || e.account === 'swing' ? e.account : null;

            let capital = e.capital;
            if (capital === undefined && e.pnl !== undefined) capital = e.pnl;

            const capNum = typeof capital === 'number' ? capital : Number(capital);

            if (!account) return null;
            if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
            if (!Number.isFinite(capNum)) return null;

            return { id: e.id || `${date}-${account}`, date, account, capital: capNum };
          })
          .filter(Boolean);

        setEntries(arr);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      } catch (e) {
        console.warn('Failed to load capital entries', e);
      }
    })();
  }, []);

  // ---- Load baseline ----
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(BASELINE_KEY);
        if (!raw) return;

        const parsed = JSON.parse(raw) || {};
        const intraday = Number(parsed.intraday) || 0;
        const swing = Number(parsed.swing) || 0;

        setBaselineIntraday(intraday);
        setBaselineSwing(swing);
        setBaselineIntradayInput(intraday ? String(intraday) : '');
        setBaselineSwingInput(swing ? String(swing) : '');

        if (parsed.saved || intraday !== 0 || swing !== 0) setBaselineSaved(true);
      } catch (e) {
        console.warn('Failed to load baseline capital', e);
      }
    })();
  }, []);

  // reset pagination when entries change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [entries]);

  const persistEntries = async updated => {
    setEntries(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save capital entries', e);
    }
  };

  const persistBaseline = async (intraday, swing) => {
    try {
      await AsyncStorage.setItem(BASELINE_KEY, JSON.stringify({ intraday, swing, saved: true }));
    } catch (e) {
      console.warn('Failed to save baseline capital', e);
    }
  };
  const handleDeleteItem = async item => {
    const updated = entries.filter(e => e.id !== item.id);
    await persistEntries(updated);
  };

  const handleEditItem = async (item, newCapital) => {
    const updated = entries.map(e => (e.id === item.id ? { ...e, capital: newCapital } : e));
    await persistEntries(updated);
  };

  const handleSaveEntry = () => {
    const trimmedDate = dateInput.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
      Alert.alert('Invalid date', 'Please enter date in YYYY-MM-DD format.');
      return;
    }

    const d = new Date(trimmedDate);
    if (Number.isNaN(d.getTime())) {
      Alert.alert('Invalid date', 'The date is not valid.');
      return;
    }

    const value = parseFloat(amountInput.replace(',', '.'));
    if (Number.isNaN(value)) {
      Alert.alert('Invalid amount', 'Please enter a number like 1050 or 980.5');
      return;
    }

    const dateKey = trimmedDate;

    const filtered = entries.filter(e => !(e.date === dateKey && e.account === selectedAccount));

    const updated = [
      ...filtered,
      {
        id: `${dateKey}-${selectedAccount}`,
        date: dateKey,
        account: selectedAccount,
        capital: value,
      },
    ];

    persistEntries(updated);
    setAmountInput('');
  };

  const handleSaveBaseline = () => {
    const intradayVal = parseFloat((baselineIntradayInput || '0').replace(',', '.'));
    const swingVal = parseFloat((baselineSwingInput || '0').replace(',', '.'));

    const intradayFinal = Number.isNaN(intradayVal) ? 0 : intradayVal;
    const swingFinal = Number.isNaN(swingVal) ? 0 : swingVal;

    setBaselineIntraday(intradayFinal);
    setBaselineSwing(swingFinal);
    persistBaseline(intradayFinal, swingFinal);
    setBaselineSaved(true);
    Alert.alert('Saved', 'Starting capital (USDT) saved for both accounts.');
  };

  const handleResetPnL = useCallback(() => {
    Alert.alert(
      'Reset PnL Data',
      'This will permanently delete all capital entries and starting capital for both accounts. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([STORAGE_KEY, BASELINE_KEY]);

              setEntries([]);
              setBaselineIntraday(0);
              setBaselineSwing(0);
              setBaselineIntradayInput('');
              setBaselineSwingInput('');
              setBaselineSaved(false);

              setAmountInput('');
              setDateInput(todayStr);
              setSelectedAccount('intraday');

              Alert.alert('Reset complete', 'PnL data has been cleared.');
            } catch (e) {
              console.warn('Failed to reset PnL data', e);
              Alert.alert('Error', 'Failed to reset data.');
            }
          },
        },
      ],
    );
  }, [todayStr]);

  // ---- Chart + totals ----
  const chartState = useMemo(() => {
    const validEntries = entries.filter(
      e =>
        e &&
        typeof e.date === 'string' &&
        (e.account === 'intraday' || e.account === 'swing') &&
        typeof e.capital === 'number' &&
        Number.isFinite(e.capital),
    );

    if (!validEntries.length) return { labels: [], data: [], deltaIntraday: 0, deltaSwing: 0 };

    const sorted = [...validEntries].sort((a, b) => {
      if (a.date === b.date) return a.account.localeCompare(b.account);
      return a.date.localeCompare(b.date);
    });

    let currentIntraday = baselineIntraday;
    let currentSwing = baselineSwing;

    const perDateRecovery = [];

    sorted.forEach(entry => {
      if (entry.account === 'intraday') currentIntraday = entry.capital;
      else currentSwing = entry.capital;

      const recovery = currentIntraday - baselineIntraday + (currentSwing - baselineSwing);

      if (Number.isFinite(recovery)) {
        perDateRecovery.push({ date: entry.date, recovery: Number(recovery.toFixed(2)) });
      }
    });

    const deltaIntraday = Number((currentIntraday - baselineIntraday).toFixed(2));
    const deltaSwing = Number((currentSwing - baselineSwing).toFixed(2));

    const byPeriod = {};
    perDateRecovery.forEach(r => {
      const key = getDateKey(r.date, viewMode);
      byPeriod[key] = r.recovery;
    });

    const periodKeys = Object.keys(byPeriod).sort();
    const labels = [];
    const data = [];

    periodKeys.forEach(key => {
      const v = byPeriod[key];
      if (Number.isFinite(v)) {
        labels.push(formatLabel(key, viewMode));
        data.push(v);
      }
    });

    return { labels, data, deltaIntraday, deltaSwing };
  }, [entries, viewMode, baselineIntraday, baselineSwing]);

  const { labels, data, deltaIntraday, deltaSwing } = chartState;

  // entries sorted (desc) for UI list
  const sortedEntries = useMemo(
    () =>
      [...entries].sort((a, b) => {
        if (a.date === b.date) return a.account.localeCompare(b.account);
        return b.date.localeCompare(a.date);
      }),
    [entries],
  );

  // visible slice for infinite scroll
  const visibleEntries = useMemo(
    () => sortedEntries.slice(0, visibleCount),
    [sortedEntries, visibleCount],
  );

  const handleLoadMore = useCallback(() => {
    if (loadingMore) return;
    if (visibleCount >= sortedEntries.length) return;

    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + PAGE_SIZE, sortedEntries.length));
      setLoadingMore(false);
    }, 150);
  }, [loadingMore, visibleCount, sortedEntries.length]);

  // ---- UI: single FlatList (this fixes scrolling) ----
  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={visibleEntries}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <EntriesList.SingleRow item={item} onEdit={handleEditItem} onDelete={handleDeleteItem} />
      )}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={<EntriesList.Footer loadingMore={loadingMore} />}
      ListHeaderComponent={
        <View>
          <Text style={styles.title}>PNL Tracker / Loss Recovery</Text>

          <PnLSummary
            baselineIntraday={baselineIntraday}
            baselineSwing={baselineSwing}
            deltaIntraday={deltaIntraday}
            deltaSwing={deltaSwing}
          />

          {!baselineSaved && (
            <BaselineCard
              baselineIntraday={baselineIntraday}
              baselineSwing={baselineSwing}
              baselineIntradayInput={baselineIntradayInput}
              baselineSwingInput={baselineSwingInput}
              setBaselineIntradayInput={setBaselineIntradayInput}
              setBaselineSwingInput={setBaselineSwingInput}
              deltaIntraday={deltaIntraday}
              deltaSwing={deltaSwing}
              onSaveBaseline={handleSaveBaseline}
            />
          )}

          <PnLInputSection
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
            amountInput={amountInput}
            setAmountInput={setAmountInput}
            dateInput={dateInput}
            setDateInput={setDateInput}
            onSave={handleSaveEntry}
          />

          <ViewModeTabs viewMode={viewMode} setViewMode={setViewMode} />
          <PnLChart labels={labels} data={data} width={screenWidth} />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Capital History</Text>
            <Text style={styles.sectionSub}>
              Showing {Math.min(visibleCount, sortedEntries.length)} / {sortedEntries.length}
            </Text>
          </View>
          <View style={styles.resetContainer}>
            <Text style={styles.resetHint}>
              Use this if you want to start fresh or restart tracking.
            </Text>

            <Text style={styles.resetButton} onPress={handleResetPnL}>
              Reset PnL Data
            </Text>
          </View>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No entries yet.</Text>
        </View>
      }
      ListFooterComponentStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    />
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  title: {
    fontSize: 20,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  sectionSub: {
    marginTop: 2,
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  emptyWrap: {
    paddingVertical: 18,
  },
  emptyText: {
    color: theme.colors.textMuted,
  },
  resetContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  resetHint: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 6,
    textAlign: 'center',
  },
  resetButton: {
    fontSize: 13,
    color: theme.colors.danger,
    fontWeight: '600',
  },
});
