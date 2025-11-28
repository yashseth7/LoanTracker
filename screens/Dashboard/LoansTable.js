import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../theme'; // adjust path
import { formatCurrency } from '../../LoansContext';

export default function LoansTable({ loans }) {
  if (!loans || loans.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No loans added yet. Tap "Add Loan" to create your first one.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.tableHeaderText, styles.colName]}>Loan</Text>
        <Text style={[styles.tableHeaderText, styles.colLender]}>Lender</Text>
        <Text style={[styles.tableHeaderText, styles.colAmount]}>
          Remaining
        </Text>
      </View>

      {loans.map((loan) => (
        <View key={loan.id} style={styles.tableRow}>
          <Text style={[styles.tableCellText, styles.colName]}>
            {loan.name}
          </Text>
          <Text style={[styles.tableCellText, styles.colLender]}>
            {loan.lender}
          </Text>
          <Text style={[styles.tableCellText, styles.colAmount]}>
            {formatCurrency(loan.remainingAmount)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tableContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#252A3A',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#1C2132',
  },
  tableHeaderText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  tableCellText: {
    color: theme.colors.text,
    fontSize: 13,
  },
  colName: {
    flex: 1.4,
  },
  colLender: {
    flex: 1,
  },
  colAmount: {
    flex: 1,
    textAlign: 'right',
  },
  emptyContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
});
