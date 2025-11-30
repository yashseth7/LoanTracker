// screens/LoansTable.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../theme'; // adjust path
import { formatCurrency } from '../../LoansContext';

const getDueDay = (dueDate) => {
  if (!dueDate) return '-';

  const parsed = new Date(dueDate);
  if (isNaN(parsed.getTime())) {
    // if it's not a valid date string, just show as-is
    return dueDate;
  }

  const day = parsed.getDate(); // 1–31
  return String(day); // e.g. "30"
};

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
      {/* Header */}
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.tableHeaderText, styles.colName]}>Loan</Text>
        <Text style={[styles.tableHeaderText, styles.colAmount]}>Balance</Text>
        <Text style={[styles.tableHeaderText, styles.colRate]}>Rate</Text>
        <Text style={[styles.tableHeaderText, styles.colEmi]}>EMI</Text>
        <Text style={[styles.tableHeaderText, styles.colDue]}>Due</Text>
      </View>

      {/* Rows */}
      {loans.map((loan) => (
        <View key={loan.id} style={styles.tableRow}>
          <Text style={[styles.tableCellText, styles.colName]}>
            {loan.name}
          </Text>

          <Text style={[styles.tableCellText, styles.colAmount]}>
            {formatCurrency(loan.remainingAmount)}
          </Text>

          <Text style={[styles.tableCellText, styles.colRate]}>
            {loan.interestRate ? `${loan.interestRate}%` : '-'}
          </Text>

          <Text style={[styles.tableCellText, styles.colEmi]}>
            {loan.emiAmount ? formatCurrency(loan.emiAmount) : '-'}
          </Text>

          <Text style={[styles.tableCellText, styles.colDue]}>
            {getDueDay(loan.dueDate)}
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

  /* Header */
  tableHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#252A3A',
  },
  tableHeaderText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },

  /* Row */
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#1C2132',
  },
  tableCellText: {
    color: theme.colors.text,
    fontSize: 12,
  },

  /* Column widths */
  colName: {
    flex: 1,
  },
  colAmount: {
    flex: 1.2,
  },
  colRate: {
    flex: 0.8,
    textAlign: 'center',
  },
  colEmi: {
    flex: 1,
    textAlign: 'right',
  },
  colDue: {
    flex: 0.7,
    textAlign: 'right',
  },

  /* Empty state */
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
