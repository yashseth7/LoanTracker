import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../../theme';
import { getPnLColor } from '../LossRecoveryScreen';

export default function PnLSummary({ baselineIntraday, baselineSwing, deltaIntraday, deltaSwing }) {
  const startCombined = baselineIntraday + baselineSwing;
  const currentIntraday = baselineIntraday + deltaIntraday;
  const currentSwing = baselineSwing + deltaSwing;
  const currentCombined = currentIntraday + currentSwing;
  const recoveredCombined = deltaIntraday + deltaSwing; // how much moved since start

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Recovery since start (both accounts)</Text>
      <Text style={[styles.mainValue, { color: getPnLColor(recoveredCombined) }]}>
        {recoveredCombined >= 0 ? '+' : ''}
        {recoveredCombined.toFixed(2)} USDT
      </Text>

      <Text style={styles.subLine}>
        Starting total: {startCombined.toFixed(2)} USDT | Now:{' '}
        <Text style={{ color: getPnLColor(currentCombined) }}>
          {currentCombined.toFixed(2)} USDT
        </Text>
      </Text>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.subLabel}>Intraday</Text>
          <Text style={[styles.value, { color: getPnLColor(currentIntraday) }]}>
            {currentIntraday.toFixed(2)} USDT
          </Text>
          <Text style={styles.delta}>
            Δ {deltaIntraday >= 0 ? '+' : ''}
            {deltaIntraday.toFixed(2)} USDT
          </Text>
        </View>

        <View style={styles.col}>
          <Text style={styles.subLabel}>Swing</Text>
          <Text style={[styles.value, { color: getPnLColor(currentSwing) }]}>
            {currentSwing.toFixed(2)} USDT
          </Text>
          <Text style={styles.delta}>
            Δ {deltaSwing >= 0 ? '+' : ''}
            {deltaSwing.toFixed(2)} USDT
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardElevated || theme.colors.card,
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  mainValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  subLine: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 12,
  },
  col: {
    flex: 1,
  },
  subLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  delta: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});
