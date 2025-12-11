// screens/Dashboard/TotalLiability.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../theme';
import { formatCurrency, useLoans, getEmiStats } from '../../LoansContext';

export default function TotalLiability({ total }) {
  const { loans } = useLoans();

  // --- Debt-free horizon based on max EMIs remaining across loans ---
  let maxEmisRemaining = 0;

  (loans || []).forEach(loan => {
    const { totalEmis, emisRemaining } = getEmiStats(loan);
    if (totalEmis != null && emisRemaining != null) {
      if (emisRemaining > maxEmisRemaining) {
        maxEmisRemaining = emisRemaining;
      }
    }
  });

  let horizonText = 'No EMI schedule info yet.';
  if (maxEmisRemaining > 0) {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + maxEmisRemaining, 1);
    const targetLabel = target.toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    });

    horizonText = `${maxEmisRemaining} months to debt-free (≈ ${targetLabel})`;
  }

  return (
    <View style={styles.topCard}>
      {/* HEADLINE TOTAL LIABILITY */}
      <Text style={styles.topCardLabel}>Total Liability</Text>
      <Text style={styles.topCardValue}>{formatCurrency(total)}</Text>
      <Text style={styles.topCardNote}>Sum of remaining amounts across all active loans.</Text>

      {/* DEBT-FREE HORIZON */}
      <Text style={styles.horizonText}>{horizonText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...((theme.shadow && theme.shadow.card) || {}),
  },
  topCardLabel: {
    color: theme.colors.textMuted,
    fontSize: 14,
    marginBottom: theme.spacing.sm,
  },
  topCardValue: {
    color: theme.colors.accent,
    fontSize: 26,
    fontWeight: '700',
  },
  topCardNote: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: theme.spacing.sm,
  },
  horizonText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.success,
    fontSize: 13,
    fontWeight: '600',
  },
});
