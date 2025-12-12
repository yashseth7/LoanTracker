import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import theme from '../../../theme';

function AccountSwitcher({ selectedAccount, setSelectedAccount }) {
  return (
    <View style={styles.accountRow}>
      <TouchableOpacity
        style={[styles.accountButton, selectedAccount === 'intraday' && styles.accountButtonActive]}
        onPress={() => setSelectedAccount('intraday')}
      >
        <Text
          style={[styles.accountText, selectedAccount === 'intraday' && styles.accountTextActive]}
        >
          Intraday Account
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.accountButton, selectedAccount === 'swing' && styles.accountButtonActive]}
        onPress={() => setSelectedAccount('swing')}
      >
        <Text style={[styles.accountText, selectedAccount === 'swing' && styles.accountTextActive]}>
          Swing Account
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function PnLInputSection({
  selectedAccount,
  setSelectedAccount,
  amountInput,
  setAmountInput,
  dateInput,
  setDateInput,
  onSave,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Add / Update Day&apos;s PnL</Text>

      <AccountSwitcher selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} />

      <View style={styles.dateRow}>
        <Text style={styles.dateLabel}>Trade date (YYYY-MM-DD)</Text>
        <TextInput
          placeholder="2025-12-11"
          placeholderTextColor={theme.colors.textMuted}
          value={dateInput}
          onChangeText={setDateInput}
          style={styles.dateInput}
        />
      </View>

      <View style={styles.pnlRow}>
        <TextInput
          placeholder="Capital for that day (USDT, e.g. 1050 or 980.5)"
          placeholderTextColor={theme.colors.textMuted}
          keyboardType="numeric"
          value={amountInput}
          onChangeText={setAmountInput}
          style={styles.input}
        />
        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 8,
  },
  accountRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 8,
  },
  accountButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  accountButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  accountText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  accountTextActive: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  dateRow: {
    marginBottom: 10,
  },
  dateLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  dateInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: 13,
  },
  pnlRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: 13,
  },
  saveButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent,
  },
  saveText: {
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
});
