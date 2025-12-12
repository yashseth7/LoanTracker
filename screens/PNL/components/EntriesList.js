import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, Alert } from 'react-native';
import theme from '../../../theme';
import { getPnLColor } from '../LossRecoveryScreen';

function SingleRow({ item, onEdit, onDelete }) {
  const openActions = () => {
    Alert.alert(
      'Entry actions',
      `${item.date} • ${item.account === 'intraday' ? 'Intraday' : 'Swing'}\nCapital: ${item.capital.toFixed(
        2,
      )} USDT`,
      [
        {
          text: 'Edit',
          onPress: () => {
            Alert.prompt(
              'Edit capital',
              'Enter updated capital (USDT)',
              text => {
                const v = parseFloat(String(text || '').replace(',', '.'));
                if (!Number.isFinite(v)) {
                  Alert.alert('Invalid amount', 'Please enter a valid number.');
                  return;
                }
                onEdit?.(item, v);
              },
              'plain-text',
              String(item.capital),
            );
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Delete entry?', 'This will remove the entry permanently.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => onDelete?.(item) },
            ]);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  return (
    <Pressable onPress={openActions} style={styles.row}>
      <Text style={styles.date}>{item.date}</Text>
      <Text style={styles.account}>{item.account === 'intraday' ? 'Intraday' : 'Swing'}</Text>
      <Text style={[styles.capital, { color: getPnLColor(item.capital) }]}>
        {item.capital.toFixed(2)} USDT
      </Text>
    </Pressable>
  );
}

function Footer({ loadingMore }) {
  if (!loadingMore) return null;
  return (
    <View style={styles.footer}>
      <ActivityIndicator size="small" color={theme.colors.textMuted} />
    </View>
  );
}

export default {
  SingleRow,
  Footer,
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm,
    marginBottom: 8,
  },
  date: {
    flex: 1.2,
    fontSize: 12,
    color: theme.colors.text,
  },
  account: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  capital: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
});
