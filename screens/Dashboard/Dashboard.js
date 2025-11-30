// screens/DashboardScreen.js
import React from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  View,
} from 'react-native';
import theme from '../../theme';

import TotalLiability from './TotalLiability'
import LoansTable from './LoansTable';
import UpcomingEmis from './UpcomingEmis';
import { useLoans } from '../../LoansContext';

export default function DashboardScreen({ navigation }) {
  const { loans, totalLiability, loading } = useLoans();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Loan Tracker</Text>
      <Text style={styles.subtitle}>Welcome yash 👋</Text>

      {/* Total liability summary */}
      <TotalLiability total={totalLiability} />

      {/* Upcoming EMIs – now uses loans from props */}
      <UpcomingEmis loans={loans} />

      {/* Loans table */}
      <LoansTable loans={loans} />

      {/* CTA to add a new loan */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Addloan')}
      >
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
