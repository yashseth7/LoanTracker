// screens/LoansTable.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../../theme';
import { formatCurrency, getEmiStats } from '../../LoansContext';

const getDueDay = dueDate => {
  if (!dueDate) return '-';

  const parsed = new Date(dueDate);
  if (isNaN(parsed.getTime())) {
    return dueDate; // fallback if weird format
  }

  return String(parsed.getDate()); // "30"
};

// For sorting by due date (earliest first)
const getDueSortValue = dueDate => {
  if (!dueDate) return Number.POSITIVE_INFINITY;

  const parsed = new Date(dueDate);
  if (isNaN(parsed.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  return parsed.getTime();
};

export default function LoansTable({ loans, onEditLoan, onDeleteLoan }) {
  if (!loans || loans.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No loans added yet. Tap "Add Loan" to create your first one.
        </Text>
      </View>
    );
  }

  // 🔽 Sort loans by due date before rendering
  const sortedLoans = [...loans].sort(
    (a, b) => getDueSortValue(a.dueDate) - getDueSortValue(b.dueDate),
  );

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Active Loans</Text>
        <Text style={styles.subtitle}>{sortedLoans.length} running</Text>
      </View>

      {/* Column headers */}
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.tableHeaderText, styles.colName]}>Loan</Text>
        <Text style={[styles.tableHeaderText, styles.colRate]}>Rate</Text>
        <Text style={[styles.tableHeaderText, styles.colEmi]}>EMI</Text>
        <Text style={[styles.tableHeaderText, styles.colDue]}>Due</Text>
        <Text style={[styles.tableHeaderText, styles.colActions]}>Action</Text>
      </View>

      {/* Rows */}
      {sortedLoans.map(loan => {
        const stats = getEmiStats
          ? getEmiStats(loan)
          : {
              totalEmis: null,
              emisPaidCount: loan.emisPaidCount ?? 0,
              emisRemaining: null,
              progressPct: 0,
            };

        const progressText =
          stats.totalEmis != null
            ? `${stats.emisPaidCount}/${stats.totalEmis} EMIs paid`
            : `${stats.emisPaidCount} EMIs paid`;

        return (
          <View key={loan.id} style={styles.rowWrapper}>
            {/* Top row: table style */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellText, styles.colName]} numberOfLines={1}>
                {loan.name}
              </Text>

              <Text style={[styles.tableCellText, styles.colRate]}>
                {loan.interestRate ? `${loan.interestRate}%` : '-'}
              </Text>

              <Text style={[styles.tableCellText, styles.colEmi]}>
                {loan.emiAmount ? formatCurrency(loan.emiAmount) : '-'}
              </Text>

              <Text style={[styles.tableCellText, styles.colDue]}>{getDueDay(loan.dueDate)}</Text>

              {/* ACTIONS */}
              <View style={styles.colActions}>
                {/* EDIT BUTTON (Pencil) */}
                <TouchableOpacity
                  onPress={() => onEditLoan && onEditLoan(loan)}
                  style={styles.actionButton}
                >
                  <Text style={styles.editIcon}>✏️</Text>
                </TouchableOpacity>

                {/* DELETE BUTTON (X) */}
                <TouchableOpacity
                  onPress={() => onDeleteLoan && onDeleteLoan(loan)}
                  style={styles.actionButton}
                >
                  <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom: EMI progress bar */}
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>
                {progressText}
                {stats.progressPct ? ` (${stats.progressPct}%)` : ''}
              </Text>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${stats.progressPct || 0}%` }]} />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // outer card
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...((theme.shadow && theme.shadow.card) || {}),
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },

  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.xs,
    marginTop: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#252A3A',
  },
  tableHeaderText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },

  rowWrapper: {
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: '#1C2132',
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: 'rgba(10,15,31,0.4)',
  },

  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },

  tableCellText: {
    color: theme.colors.text,
    fontSize: 12,
  },

  // column sizes
  colName: { flex: 1.4 },
  colRate: { flex: 0.6, textAlign: 'center' },
  colEmi: { flex: 1, textAlign: 'center' },
  colDue: { flex: 0.6, textAlign: 'center' },
  colActions: {
    flex: 0.9,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
  },

  actionButton: { paddingHorizontal: 4 },

  editIcon: {
    fontSize: 14,
    color: theme.colors.accent,
  },

  deleteText: {
    color: theme.colors.danger,
    fontSize: 16,
    fontWeight: '700',
  },

  // progress bar row
  progressRow: {
    marginTop: theme.spacing.xs,
  },
  progressLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginBottom: 4,
  },
  progressBarBackground: {
    height: 5,
    borderRadius: 999,
    backgroundColor: '#1C2132',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: theme.colors.primarySoft,
  },

  // empty state
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
