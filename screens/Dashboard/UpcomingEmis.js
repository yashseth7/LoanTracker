// screens/UpcomingEmis.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../../theme';
import { formatCurrency, useLoans } from '../../LoansContext';

const NEAR_DAYS = 3; // within 3 days is "near due"

// helper: strip time part for date-only comparison
const toDateOnly = date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export default function UpcomingEmis({ loans }) {
  const { markEmiPaid } = useLoans();

  const today = new Date();
  const todayOnly = toDateOnly(today);
  const year = today.getFullYear();
  const month = today.getMonth();

  const upcoming = (loans || [])
    .filter(loan => loan.emiDayOfMonth && loan.emiAmount)
    .map(loan => {
      const emiDateThisMonth = new Date(year, month, loan.emiDayOfMonth);

      if (isNaN(emiDateThisMonth.getTime())) {
        return null;
      }

      // Check if already paid for this cycle
      let isPaidThisCycle = false;
      if (loan.lastEmiPaidDate) {
        const paidDate = new Date(loan.lastEmiPaidDate);
        if (!isNaN(paidDate.getTime())) {
          isPaidThisCycle = paidDate.getFullYear() === year && paidDate.getMonth() === month;
        }
      }

      // Determine status: overdue / near / upcoming
      const emiDateOnly = toDateOnly(emiDateThisMonth);
      const diffMs = emiDateOnly.getTime() - todayOnly.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      let status = 'upcoming';
      if (diffDays < 0) {
        status = 'overdue';
      } else if (diffDays >= 0 && diffDays <= NEAR_DAYS) {
        status = 'near';
      }

      return {
        loanId: loan.id,
        name: loan.name,
        lender: loan.lender,
        emiAmount: loan.emiAmount,
        emiDayOfMonth: loan.emiDayOfMonth,
        emiDate: emiDateOnly,
        status,
        isPaidThisCycle,
      };
    })
    .filter(Boolean)
    // Remove EMIs already paid this month
    .filter(emi => !emi.isPaidThisCycle)
    // Sort by date
    .sort((a, b) => a.emiDate - b.emiDate)
    // Limit to 4
    .slice(0, 4);

  if (!upcoming.length) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Upcoming EMIs</Text>
        <Text style={styles.emptyText}>
          No EMI schedule added yet, or all paid for this month. Add EMI date & amount to your loans
          to see them here.
        </Text>
      </View>
    );
  }

  const handleMarkPaid = emi => {
    markEmiPaid(emi.loanId, emi.emiDate);
  };

  const formatDate = date =>
    date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short', // e.g. "30 Nov"
    });

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Upcoming EMIs</Text>
        <Text style={styles.chipCount}>{upcoming.length} due soon</Text>
      </View>

      {upcoming.map((emi, index) => {
        let rowStyle = [styles.row];
        let amountStyle = [styles.amount];
        let dateStyle = [styles.meta];
        let statusChipStyle = [styles.statusChip];
        let statusTextStyle = [styles.statusChipText];

        if (emi.status === 'overdue') {
          rowStyle.push(styles.rowOverdue);
          amountStyle.push(styles.amountOverdue);
          dateStyle.push(styles.metaOverdue);
          statusChipStyle.push(styles.statusOverdueChip);
          statusTextStyle.push(styles.statusOverdueText);
        } else if (emi.status === 'near') {
          rowStyle.push(styles.rowNear);
          statusChipStyle.push(styles.statusNearChip);
          statusTextStyle.push(styles.statusNearText);
        }

        return (
          <View
            key={emi.loanId}
            style={[...rowStyle, index === upcoming.length - 1 && { marginBottom: 0 }]}
          >
            {/* LEFT: Loan + status */}
            <View style={styles.left}>
              <Text style={styles.loanName} numberOfLines={1}>
                {emi.name}
              </Text>
              <View style={styles.statusRow}>
                {emi.status !== 'upcoming' && (
                  <View style={statusChipStyle}>
                    <Text style={statusTextStyle}>
                      {emi.status === 'overdue' ? 'OVERDUE' : 'DUE SOON'}
                    </Text>
                  </View>
                )}
                <Text style={dateStyle}>{formatDate(emi.emiDate)}</Text>
              </View>
            </View>

            {/* RIGHT: Amount + check */}
            <View style={styles.right}>
              <View style={styles.rightTopRow}>
                <Text style={amountStyle}>{formatCurrency(emi.emiAmount)}</Text>
                <TouchableOpacity style={styles.checkButton} onPress={() => handleMarkPaid(emi)}>
                  <Text style={styles.checkText}>✓</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  chipCount: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 224, 255, 0.1)',
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },

  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },

  row: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: '#1C2132',
    marginBottom: theme.spacing.sm,
  },
  rowOverdue: {
    backgroundColor: 'rgba(255, 78, 78, 0.08)',
    borderColor: theme.colors.danger,
  },
  rowNear: {
    backgroundColor: 'rgba(255, 206, 79, 0.06)',
    borderColor: 'rgba(255, 206, 79, 0.7)',
  },

  left: {
    flex: 1.4,
    justifyContent: 'center',
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  rightTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  loanName: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  statusChip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusOverdueChip: {
    borderColor: theme.colors.danger,
    backgroundColor: 'rgba(255, 78, 78, 0.15)',
  },
  statusOverdueText: {
    color: theme.colors.danger,
  },
  statusNearChip: {
    borderColor: theme.colors.accent2 || '#FFCE4F',
    backgroundColor: 'rgba(255, 206, 79, 0.18)',
  },
  statusNearText: {
    color: theme.colors.accent2 || '#FFCE4F',
  },

  amount: {
    color: theme.colors.primarySoft,
    fontSize: 15,
    fontWeight: '700',
  },
  amountOverdue: {
    color: theme.colors.danger,
  },

  meta: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  metaOverdue: {
    color: theme.colors.danger,
  },

  checkButton: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(0, 230, 142, 0.12)',
    borderWidth: 1,
    borderColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: '700',
  },
});
