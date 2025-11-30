// screens/UpcomingEmis.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../theme';
import { formatCurrency } from '../../LoansContext';

// Given a day of month (1–31), compute the next due date
const getNextEmiDate = (emiDayOfMonth) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // Try this month
  let next = new Date(year, month, emiDayOfMonth);

  // If already passed today, move to next month
  const todayDateOnly = new Date(year, month, today.getDate());
  if (next < todayDateOnly) {
    next = new Date(year, month + 1, emiDayOfMonth);
  }

  return next;
};

const formatDate = (date) =>
  date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short', // e.g. "30 Nov"
  });

export default function UpcomingEmis({ loans }) {
  const upcoming = (loans || [])
    .filter((loan) => loan.emiDayOfMonth && loan.emiAmount)
    .map((loan) => {
      const nextDate = getNextEmiDate(loan.emiDayOfMonth);
      return {
        loanId: loan.id,
        name: loan.name,
        lender: loan.lender,
        emiAmount: loan.emiAmount,
        emiDayOfMonth: loan.emiDayOfMonth,
        nextDate,
      };
    })
    .sort((a, b) => a.nextDate - b.nextDate)
    .slice(0, 4);

  if (!upcoming.length) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Upcoming EMIs</Text>
        <Text style={styles.emptyText}>
          No EMI schedule added yet. Add EMI date & amount to your loans to see
          them here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Upcoming EMIs</Text>
      {upcoming.map((emi, index) => (
        <View
          key={emi.loanId}
          style={[
            styles.row,
            index === upcoming.length - 1 && { borderBottomWidth: 0 },
          ]}
        >
          <View style={styles.left}>
            {/* Only loan name + lender on left */}
            <Text style={styles.loanName}>{emi.name}</Text>
          </View>
          <View style={styles.right}>
            {/* EMI amount on top */}
            <Text style={styles.amount}>
              {formatCurrency(emi.emiAmount)}
            </Text>
            {/* Day + month (e.g. 30 Nov) below */}
            <Text style={styles.meta}>{formatDate(emi.nextDate)}</Text>
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
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#1C2132',
  },
  left: {
    flex: 1.4,
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
  },
  loanName: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  lender: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    color: theme.colors.primarySoft,
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});
