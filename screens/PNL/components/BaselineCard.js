import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import theme from '../../../theme';
import { getPnLColor } from '../LossRecoveryScreen';

export default function BaselineCard({
  baselineIntraday,
  baselineSwing,
  baselineIntradayInput,
  baselineSwingInput,
  setBaselineIntradayInput,
  setBaselineSwingInput,
  deltaIntraday,
  deltaSwing,
  onSaveBaseline,
}) {
  // live updated current capital based on cumulative pnl
  const currentIntraday = baselineIntraday + deltaIntraday;
  const currentSwing = baselineSwing + deltaSwing;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Starting PnL (USDT, one-time)</Text>

      <Text style={styles.hint}>
        Enter your overall realised PnL so far for each account when you start using this tracker.
        After saving, this setup is hidden permanently.
      </Text>

      <View style={styles.row}>
        {/* Intraday */}
        <View style={styles.col}>
          <Text style={styles.label}>Intraday start (USDT)</Text>
          <TextInput
            placeholder="-5000"
            placeholderTextColor={theme.colors.textFaded || theme.colors.textMuted}
            keyboardType="numeric"
            value={baselineIntradayInput}
            onChangeText={setBaselineIntradayInput}
            style={styles.input}
          />

          <Text style={styles.info}>
            Current now:{' '}
            <Text style={{ color: getPnLColor(currentIntraday) }}>
              {currentIntraday.toFixed(2)} USDT
            </Text>
          </Text>
        </View>

        {/* Swing */}
        <View style={styles.col}>
          <Text style={styles.label}>Swing start (USDT)</Text>
          <TextInput
            placeholder="-3000"
            placeholderTextColor={theme.colors.textFaded || theme.colors.textMuted}
            keyboardType="numeric"
            value={baselineSwingInput}
            onChangeText={setBaselineSwingInput}
            style={styles.input}
          />

          <Text style={styles.info}>
            Current now:{' '}
            <Text style={{ color: getPnLColor(currentSwing) }}>{currentSwing.toFixed(2)} USDT</Text>
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={onSaveBaseline}>
        <Text style={styles.saveText}>Save starting PnL</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: 12,
    marginBottom: 12,
  },

  title: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },

  hint: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 8,
  },

  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },

  col: {
    flex: 1,
  },

  label: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },

  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.borderLight || theme.colors.border,
    fontSize: 12,
    marginBottom: 4,
  },

  info: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },

  saveButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.pill || theme.radius.lg,
    backgroundColor: theme.colors.primarySoft || theme.colors.primary,
    marginTop: 4,
  },

  saveText: {
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 12,
  },
});
