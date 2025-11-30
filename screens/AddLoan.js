// screens/Addloan.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import theme from '../theme';
import { useLoans } from '../LoansContext';

export default function Addloan({ navigation }) {
  const { addLoan } = useLoans();

  const [name, setName] = useState('');
  const [lender, setLender] = useState('');
  const [remainingAmount, setRemainingAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [minPayment, setMinPayment] = useState('');

  const [dueDate, setDueDate] = useState('');         // stored as string (YYYY-MM-DD)
  const [pickerDate, setPickerDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const handleAddLoan = () => {
    if (
      !name.trim() ||
      !lender.trim() ||
      !remainingAmount.trim() ||
      !interestRate.trim() ||
      !minPayment.trim() ||
      !dueDate.trim()
    ) {
      Alert.alert('Missing info', 'Please fill all fields.');
      return;
    }

    const balanceNumber = Number(remainingAmount.replace(/,/g, ''));
    if (isNaN(balanceNumber) || balanceNumber <= 0) {
      Alert.alert('Invalid balance', 'Please enter a valid positive balance.');
      return;
    }

    const rateNumber = Number(interestRate);
    if (isNaN(rateNumber) || rateNumber < 0) {
      Alert.alert(
        'Invalid rate',
        'Please enter a valid interest rate (e.g. 8 or 15.5).'
      );
      return;
    }

    const minPaymentNumber = Number(minPayment.replace(/,/g, ''));
    if (isNaN(minPaymentNumber) || minPaymentNumber <= 0) {
      Alert.alert(
        'Invalid minimum payment',
        'Please enter a valid positive EMI amount.'
      );
      return;
    }

    // derive EMI day-of-month from due date if possible
    let emiDayOfMonth = null;
    const parsed = new Date(dueDate);
    if (!isNaN(parsed.getTime())) {
      emiDayOfMonth = parsed.getDate();
    }

    addLoan({
      name: name.trim(),
      lender: lender.trim(),
      remainingAmount: balanceNumber,   // Balance
      interestRate: rateNumber,        // Rate
      emiAmount: minPaymentNumber,     // Min Pmt / EMI
      dueDate: dueDate.trim(),         // YYYY-MM-DD
      emiDayOfMonth,                   // used by UpcomingEmis if available
    });

    // Clear form
    setName('');
    setLender('');
    setRemainingAmount('');
    setInterestRate('');
    setMinPayment('');
    setDueDate('');
    setPickerDate(new Date());

    // Go back to dashboard
    navigation.goBack();
  };

  const handleOpenPicker = () => {
    setShowPicker(true);
  };

  const handleChangeDate = (event, selectedDate) => {
    // Android fires event.type === "dismissed" when cancelled
    setShowPicker(false);

    if (selectedDate) {
      setPickerDate(selectedDate);
      const iso = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
      setDueDate(iso);
    }
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
        placeholder="e.g. Debt1 / Fibe Personal Loan"
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

      <Text style={styles.label}>Balance Amount (₹)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 1400"
        placeholderTextColor={theme.colors.textMuted}
        value={remainingAmount}
        onChangeText={setRemainingAmount}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Rate of Interest (%)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 8"
        placeholderTextColor={theme.colors.textMuted}
        value={interestRate}
        onChangeText={setInterestRate}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Min Payment / EMI (₹)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 35 or 1500"
        placeholderTextColor={theme.colors.textMuted}
        value={minPayment}
        onChangeText={setMinPayment}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Due Date</Text>
      <TouchableOpacity style={styles.input} onPress={handleOpenPicker}>
        <Text style={dueDate ? styles.dateText : styles.placeholderText}>
          {dueDate || 'Select due date'}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display="default"
          onChange={handleChangeDate}
        />
      )}

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
    justifyContent: 'center',
  },
  dateText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  placeholderText: {
    color: theme.colors.textMuted,
    fontSize: 14,
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
