// screens/DashboardScreen.js
import React from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Alert,
} from 'react-native';
import theme from '../../theme';

import TotalLiability from './TotalLiability';
import LoansTable from './LoansTable';
import PaidEmis from './PaidEmis';
import UpcomingEmis from './UpcomingEmis';
import MonthlyEmiTracker from './MonthlyEmiTracker';
import { useLoans } from '../../LoansContext';

export default function DashboardScreen({ navigation }) {
  const { loans, totalLiability, loading, deleteLoan } = useLoans();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  // --- EDIT ---
  const handleEditLoan = loan => {
    navigation.navigate('EditLoan', { loanId: loan.id });
  };

  // --- DELETE ---
  const handleDeleteLoan = loan => {
    Alert.alert('Delete Loan', `Are you sure you want to delete "${loan.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteLoan(loan.id),
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.subtitle}>Welcome yash 👋</Text>

      {/* Total liability summary */}
      <TotalLiability total={totalLiability} />
      <MonthlyEmiTracker />

      {/* Upcoming EMIs */}
      <UpcomingEmis loans={loans} />

      {/* Loans table - PASS ACTION HANDLERS */}
      <LoansTable loans={loans} onEditLoan={handleEditLoan} onDeleteLoan={handleDeleteLoan} />
      <PaidEmis />

      {/* CTA to add a new loan */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Addloan')}>
        <Text style={styles.buttonText}>Add Loan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 2,
  },
  title: {
    fontSize: 26,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
