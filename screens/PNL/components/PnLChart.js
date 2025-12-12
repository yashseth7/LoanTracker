import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import theme from '../../../theme';

export default function PnLChart({ labels, data, width }) {
  if (!data.length) {
    return (
      <View style={styles.card}>
        <Text style={styles.empty}>No data yet. Add a day&apos;s PnL below 👇</Text>
      </View>
    );
  }

  // Make sure chart width fits nicely in screen
  const screenWidth = Dimensions.get('window').width;
  // Parent container has padding: 16, card has marginHorizontal ≈ 0,
  // so we leave a little margin on each side
  const maxChartWidth = screenWidth - 32; // 16 left + 16 right
  const chartWidth = Math.min(width || maxChartWidth, maxChartWidth);

  return (
    <View style={styles.card}>
      <LineChart
        data={{
          labels,
          datasets: [{ data, strokeWidth: 2 }],
          legend: ['Recovery vs start (USDT)'],
        }}
        width={chartWidth}
        height={220}
        yAxisSuffix=" USDT"
        fromZero
        chartConfig={{
          backgroundGradientFrom: theme.colors.cardElevated || theme.colors.card,
          backgroundGradientTo: theme.colors.card,
          decimalPlaces: 2,
          color: () => theme.colors.chartLine || theme.colors.accent2,
          labelColor: () => theme.colors.textMuted,
          propsForDots: {
            r: '3',
            strokeWidth: 1,
            stroke: theme.colors.chartDot || theme.colors.accent3,
          },
          propsForBackgroundLines: {
            stroke: theme.colors.chartGrid || 'rgba(255,255,255,0.08)',
          },
        }}
        style={styles.chart}
        bezier
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    paddingVertical: 8,
    // no horizontal padding so chart can take full width
    marginBottom: 12,
    alignItems: 'stretch', // let children stretch to width
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
    alignSelf: 'center',
  },
  empty: {
    color: theme.colors.textMuted,
    fontSize: 13,
    padding: 12,
    textAlign: 'center',
  },
});
