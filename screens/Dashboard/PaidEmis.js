// screens/PaidEmis.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../theme';
import { useLoans, formatCurrency } from '../../LoansContext';

// helper: strip time part
const toDateOnly = date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const formatDate = date =>
  date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short', // e.g. "05 Dec"
  });

export default function PaidEmis() {
  const { loans } = useLoans();

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const paidEmis = (loans || [])
    .filter(loan => loan.emiAmount && loan.lastEmiPaidDate)
    .map(loan => {
      const paidDate = new Date(loan.lastEmiPaidDate);
      if (isNaN(paidDate.getTime())) return null;

      const paidDateOnly = toDateOnly(paidDate);

      const isThisMonth =
        paidDateOnly.getFullYear() === currentYear && paidDateOnly.getMonth() === currentMonth;

      if (!isThisMonth) return null;

      return {
        loanId: loan.id,
        name: loan.name,
        lender: loan.lender,
        emiAmount: loan.emiAmount,
        paidDate: paidDateOnly,
      };
    })
    .filter(Boolean)
    // latest paid first
    .sort((a, b) => b.paidDate - a.paidDate)
    // show last 6 payments
    .slice(0, 6);

  const totalPaidThisMonth = paidEmis.reduce((sum, emi) => sum + (emi.emiAmount || 0), 0);

  if (!paidEmis.length) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Paid EMIs (This Month)</Text>
          <Text style={styles.chipMuted}>0 paid</Text>
        </View>
        <Text style={styles.emptyText}>
          No EMIs marked as paid yet this month. Start knocking them off from the Upcoming EMIs
          section ✅
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Paid EMIs (This Month)</Text>
        <View style={styles.chipRow}>
          <Text style={styles.chipSuccess}>{paidEmis.length} paid</Text>
          <Text style={styles.chipAmount}>{formatCurrency(totalPaidThisMonth)}</Text>
        </View>
      </View>

      {paidEmis.map((emi, index) => (
        <View
          key={emi.loanId + emi.paidDate.toISOString()}
          style={[styles.row, index === paidEmis.length - 1 && { marginBottom: 0 }]}
        >
          {/* Left: Loan name + lender + date */}
          <View style={styles.left}>
            <Text style={styles.loanName} numberOfLines={1}>
              {emi.name}
            </Text>
            <View style={styles.subRow}>
              {emi.lender ? (
                <Text style={styles.lender} numberOfLines={1}>
                  {emi.lender}
                </Text>
              ) : null}
              <Text style={styles.meta}>• {formatDate(emi.paidDate)}</Text>
            </View>
          </View>

          {/* Right: Amount */}
          <View style={styles.right}>
            <Text style={styles.amount}>{formatCurrency(emi.emiAmount)}</Text>
            <Text style={styles.tagText}>PAID</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 142, 0.16)',
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

  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipSuccess: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 230, 142, 0.12)',
    color: theme.colors.success,
    fontSize: 11,
    fontWeight: '600',
  },
  chipAmount: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 224, 255, 0.1)',
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  chipMuted: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(153, 163, 194, 0.14)',
    color: theme.colors.textMuted,
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
    backgroundColor: 'rgba(0, 230, 142, 0.04)',
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

  loanName: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lender: {
    color: theme.colors.textMuted,
    fontSize: 11,
    maxWidth: 120,
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },

  amount: {
    color: theme.colors.success,
    fontSize: 15,
    fontWeight: '700',
  },
  tagText: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: theme.colors.success,
  },
});
