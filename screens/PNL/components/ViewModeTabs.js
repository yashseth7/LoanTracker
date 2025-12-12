import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import theme from '../../../theme';
import { VIEW_MODES } from '../LossRecoveryScreen';

export default function ViewModeTabs({ viewMode, setViewMode }) {
  return (
    <View style={styles.container}>
      {Object.values(VIEW_MODES).map(mode => (
        <TouchableOpacity
          key={mode}
          style={[styles.button, viewMode === mode && styles.buttonActive]}
          onPress={() => setViewMode(mode)}
        >
          <Text style={[styles.text, viewMode === mode && styles.textActive]}>
            {mode === VIEW_MODES.DAILY
              ? 'Daily'
              : mode === VIEW_MODES.WEEKLY
                ? 'Weekly'
                : 'Monthly'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: 4,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: theme.colors.primary,
  },
  text: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  textActive: {
    color: theme.colors.text,
    fontWeight: '600',
  },
});
