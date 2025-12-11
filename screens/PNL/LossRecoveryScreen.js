import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../theme';

export default function LossRecoveryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PNL Tracker / Loss Recovery</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  title: {
    fontSize: 20,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
});
