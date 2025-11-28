// screens/Screen2.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import theme from '../theme'; // adjust path
import { useLoans } from '../LoansContext';

export default function Screen2({ navigation }) {
  const { addLoan } = useLoans();

  const [name, setName] = useState('');
  const [lender, setLender] = useState('');
  const [remainingAmount, setRemainingAmount] = useState('');

  const handleAddLoan = () => {
    if (!name.trim() || !lender.trim() || !remainingAmount.trim()) {
      Alert.alert('Missing info', 'Please fill all fields.');
      return;
    }

    const amountNumber = Number(remainingAmount.replace(/,/g, ''));
    if (isNaN(amountNumber) || amountNumber <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid positive number.');
      return;
    }

    addLoan({
      name: name.trim(),
      lender: lender.trim(),
      remainingAmount: amountNumber,
    });

    // Clear form
    setName('');
    setLender('');
    setRemainingAmount('');

    // Go back to dashboard
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Loan</Text>
      <Text style={styles.subtitle}>
        Enter details of a new loan or liability.
      </Text>

      <Text style={styles.label}>Loan Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Fibe Personal Loan"
        placeholderTextColor={theme.colors.textMuted}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Lender</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. HDFC Bank"
        placeholderTextColor={theme.colors.textMuted}
        value={lender}
        onChangeText={setLender}
      />

      <Text style={styles.label}>Remaining Amount (₹)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 150000"
        placeholderTextColor={theme.colors.textMuted}
        value={remainingAmount}
        onChangeText={setRemainingAmount}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleAddLoan}>
        <Text style={styles.buttonText}>Save Loan</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xl,
  },
  label: {
    color: theme.colors.text,
    fontSize: 14,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.primarySoft,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.textMuted,
  },
  secondaryButtonText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
});
