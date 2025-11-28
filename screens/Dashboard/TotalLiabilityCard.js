import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../theme'; // adjust path
import { formatCurrency } from '../../LoansContext';

export default function TotalLiabilityCard({ total }) {
  return (
    <View style={styles.topCard}>
      <Text style={styles.topCardLabel}>Total Liability</Text>
      <Text style={styles.topCardValue}>{formatCurrency(total)}</Text>
      <Text style={styles.topCardNote}>
        Sum of remaining amounts across all active loans.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
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
});
