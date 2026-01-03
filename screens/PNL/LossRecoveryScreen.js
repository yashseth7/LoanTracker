import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions, FlatList, TextInput, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '../../theme';

import ViewModeTabs from './components/ViewModeTabs';
import PnLChart from './components/PnLChart';
import EntriesList from './components/EntriesList';

// ✅ NEW: single-account storage keys
const STORAGE_KEY = 'pnl_entries_single_v1';
const BASELINE_KEY = 'pnl_baseline_single_v1';

// ⛑️ OLD keys (for migration)
const OLD_STORAGE_KEY = 'pnl_entries_v1';
const OLD_BASELINE_KEY = 'pnl_baseline_v1';

export const VIEW_MODES = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
};

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PAGE_SIZE = 20;

// -------- helpers ----------
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
  if (mode === VIEW_MODES.DAILY) return key.slice(5); // MM-DD
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

  // ✅ single account inputs
  const [amountInput, setAmountInput] = useState('');
  const [viewMode, setViewMode] = useState(VIEW_MODES.DAILY);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [dateInput, setDateInput] = useState(todayStr);

  // ✅ single baseline
  const [baseline, setBaseline] = useState(0);
  const [baselineInput, setBaselineInput] = useState('');
  const [baselineSaved, setBaselineSaved] = useState(false);

  const screenWidth = Dimensions.get('window').width - 32;

  // ---- Migration + Load (single account) ----
  useEffect(() => {
    (async () => {
      try {
        // 1) If NEW data exists, load it
        const rawNew = await AsyncStorage.getItem(STORAGE_KEY);
        if (rawNew) {
          const parsed = JSON.parse(rawNew);
          const arr = Array.isArray(parsed) ? parsed : [];
          setEntries(arr);
          return;
        }

        // 2) Otherwise try MIGRATE from OLD data
        const rawOld = await AsyncStorage.getItem(OLD_STORAGE_KEY);
        const rawOldBaseline = await AsyncStorage.getItem(OLD_BASELINE_KEY);

        // migrate baseline: intraday+swing
        if (rawOldBaseline) {
          try {
            const parsed = JSON.parse(rawOldBaseline) || {};
            const intraday = Number(parsed.intraday) || 0;
            const swing = Number(parsed.swing) || 0;
            const mergedBaseline = Number((intraday + swing).toFixed(2));
            setBaseline(mergedBaseline);
            setBaselineInput(mergedBaseline ? String(mergedBaseline) : '');
            setBaselineSaved(Boolean(parsed.saved || mergedBaseline !== 0));
            await AsyncStorage.setItem(BASELINE_KEY, JSON.stringify(mergedBaseline));
          } catch {
            // ignore baseline migration errors
          }
        } else {
          // try load new baseline (if any)
          const rawBaselineNew = await AsyncStorage.getItem(BASELINE_KEY);
          if (rawBaselineNew) {
            const v = Number(JSON.parse(rawBaselineNew));
            if (Number.isFinite(v)) {
              setBaseline(v);
              setBaselineInput(v ? String(v) : '');
              setBaselineSaved(true);
            }
          }
        }

        if (!rawOld) return;

        const parsedOld = JSON.parse(rawOld);
        const oldArr = Array.isArray(parsedOld) ? parsedOld : [];

        // Old shape: { id, date, account, capital }
        // ✅ New single-account rule:
        // - group by date
        // - capital = (intraday capital if present) + (swing capital if present)
        const byDate = {};
        oldArr.forEach(e => {
          const date = typeof e.date === 'string' ? e.date : '';
          if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;

          let capital = e.capital;
          if (capital === undefined && e.pnl !== undefined) capital = e.pnl;
          const capNum = typeof capital === 'number' ? capital : Number(capital);
          if (!Number.isFinite(capNum)) return;

          if (!byDate[date]) byDate[date] = { intraday: 0, swing: 0 };
          if (e.account === 'intraday') byDate[date].intraday = capNum;
          if (e.account === 'swing') byDate[date].swing = capNum;
        });

        const migrated = Object.keys(byDate)
          .sort()
          .map(date => {
            const total = Number((byDate[date].intraday + byDate[date].swing).toFixed(2));
            return {
              id: date,
              date,
              // keep a constant account label so your existing EntriesList row UI won’t crash
              account: 'main',
              capital: total,
            };
          });

        setEntries(migrated);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      } catch (e) {
        console.warn('Failed to load/migrate PnL entries', e);
      }
    })();
  }, []);

  // ---- Load NEW baseline (if not already loaded via migration) ----
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(BASELINE_KEY);
        if (!raw) return;
        const v = Number(JSON.parse(raw));
        if (!Number.isFinite(v)) return;

        setBaseline(v);
        setBaselineInput(v ? String(v) : '');
        setBaselineSaved(true);
      } catch (e) {
        console.warn('Failed to load baseline', e);
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
      console.warn('Failed to save entries', e);
    }
  };

  const persistBaseline = async value => {
    try {
      await AsyncStorage.setItem(BASELINE_KEY, JSON.stringify(value));
    } catch (e) {
      console.warn('Failed to save baseline', e);
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
    if (!baselineSaved) {
      Alert.alert('Set baseline first', 'Please save your starting capital before adding entries.');
      return;
    }

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

    // ✅ only one entry per date
    const filtered = entries.filter(e => e.date !== dateKey);

    const updated = [
      ...filtered,
      {
        id: dateKey,
        date: dateKey,
        account: 'main', // constant label
        capital: value,
      },
    ];

    persistEntries(updated);
    setAmountInput('');
  };

  const handleSaveBaseline = () => {
    const val = parseFloat((baselineInput || '0').replace(',', '.'));
    const finalVal = Number.isNaN(val) ? 0 : val;

    setBaseline(finalVal);
    persistBaseline(finalVal);
    setBaselineSaved(true);
    Alert.alert('Saved', 'Starting capital (USDT) saved.');
  };

  const handleResetPnL = useCallback(() => {
    Alert.alert(
      'Reset PnL Data',
      'This will permanently delete all entries and starting capital. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([STORAGE_KEY, BASELINE_KEY, OLD_STORAGE_KEY, OLD_BASELINE_KEY]);

              setEntries([]);
              setBaseline(0);
              setBaselineInput('');
              setBaselineSaved(false);

              setAmountInput('');
              setDateInput(todayStr);

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

  // ---- Chart + totals (single account) ----
  const chartState = useMemo(() => {
    const validEntries = entries.filter(
      e => e && typeof e.date === 'string' && typeof e.capital === 'number' && Number.isFinite(e.capital),
    );

    if (!validEntries.length) return { labels: [], data: [], delta: 0, latestCapital: null };

    const sorted = [...validEntries].sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1]?.capital ?? null;

    const perDatePnl = sorted.map(e => ({
      date: e.date,
      pnl: Number((e.capital - baseline).toFixed(2)),
    }));

    const byPeriod = {};
    perDatePnl.forEach(r => {
      const key = getDateKey(r.date, viewMode);
      byPeriod[key] = r.pnl; // last value within the period
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

    const delta = latest === null ? 0 : Number((latest - baseline).toFixed(2));
    return { labels, data, delta, latestCapital: latest };
  }, [entries, viewMode, baseline]);

  const { labels, data, delta, latestCapital } = chartState;

  // entries sorted (desc) for UI list
  const sortedEntries = useMemo(
    () =>
      [...entries].sort((a, b) => {
        if (a.date === b.date) return 0;
        return b.date.localeCompare(a.date);
      }),
    [entries],
  );

  // visible slice for infinite scroll
  const visibleEntries = useMemo(() => sortedEntries.slice(0, visibleCount), [sortedEntries, visibleCount]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore) return;
    if (visibleCount >= sortedEntries.length) return;

    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + PAGE_SIZE, sortedEntries.length));
      setLoadingMore(false);
    }, 150);
  }, [loadingMore, visibleCount, sortedEntries.length]);

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
          <Text style={styles.title}> PNL Tracker</Text>

          {/* ✅ Simple single-account summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Baseline</Text>
              <Text style={styles.summaryValue}>{baselineSaved ? `${baseline}` : '-'}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Latest Capital</Text>
              <Text style={styles.summaryValue}>{latestCapital === null ? '-' : `${latestCapital}`}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>PnL</Text>
              <Text style={[styles.summaryValue, { color: getPnLColor(delta) }]}>{baselineSaved ? `${delta}` : '-'}</Text>
            </View>
          </View>

          {/* ✅ Baseline setup */}
          {!baselineSaved && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Set Starting Capital (USDT)</Text>
              <TextInput
                value={baselineInput}
                onChangeText={setBaselineInput}
                placeholder="e.g. 1000"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="decimal-pad"
                style={styles.input}
              />
              <Pressable style={styles.primaryBtn} onPress={handleSaveBaseline}>
                <Text style={styles.primaryBtnText}>Save Baseline</Text>
              </Pressable>
            </View>
          )}

          {/* ✅ Add entry (single account) */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Add / Update Capital</Text>

            <Text style={styles.fieldLabel}>Date (YYYY-MM-DD)</Text>
            <TextInput
              value={dateInput}
              onChangeText={setDateInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
              autoCapitalize="none"
            />

            <Text style={styles.fieldLabel}>Capital (USDT)</Text>
            <TextInput
              value={amountInput}
              onChangeText={setAmountInput}
              placeholder="e.g. 1250.5"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="decimal-pad"
              style={styles.input}
            />

            <Pressable style={styles.primaryBtn} onPress={handleSaveEntry}>
              <Text style={styles.primaryBtnText}>Save Entry</Text>
            </Pressable>
          </View>

          <ViewModeTabs viewMode={viewMode} setViewMode={setViewMode} />
          <PnLChart labels={labels} data={data} width={screenWidth} />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Capital History</Text>
            <Text style={styles.sectionSub}>
              Showing {Math.min(visibleCount, sortedEntries.length)} / {sortedEntries.length}
            </Text>
          </View>

          <View style={styles.resetContainer}>
            <Text style={styles.resetHint}>Use this if you want to start fresh or restart tracking.</Text>
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

  summaryCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card || theme.colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '600',
  },

  card: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card || theme.colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 8,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.text,
    backgroundColor: theme.colors.inputBg || 'transparent',
  },
  primaryBtn: {
    marginTop: 12,
    backgroundColor: theme.colors.primary,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
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
