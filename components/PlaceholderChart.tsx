import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Line, Polyline } from 'react-native-svg';
import { AppTheme } from '@/constants/AppTheme';

type PlaceholderChartProps = {
  lineColor: string;
  avgLabel: string;
  points: string;
  xLabels: [string, string, string];
  isDark: boolean;
};

export function PlaceholderChart({
  lineColor,
  avgLabel,
  points,
  xLabels,
  isDark,
}: PlaceholderChartProps) {
  const colors = isDark ? AppTheme.dark : AppTheme.light;
  return (
    <View className="mt-3 rounded-2xl border px-3 py-2.5" style={{ backgroundColor: colors.cardAltBg, borderColor: colors.border }}>
      <View className="self-start rounded-full px-3 py-1 border" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
        <Text className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{avgLabel}</Text>
      </View>
      <Svg width="100%" height={124} viewBox="0 0 320 124">
        <Line x1="0" y1="35" x2="320" y2="35" stroke={colors.lineGrid} strokeWidth="1" strokeDasharray="4 4" />
        <Line x1="0" y1="70" x2="320" y2="70" stroke={colors.lineGrid} strokeWidth="1" strokeDasharray="4 4" />
        <Line x1="0" y1="105" x2="320" y2="105" stroke={colors.lineGrid} strokeWidth="1" strokeDasharray="4 4" />
        <Polyline points={points} fill="none" stroke={lineColor} strokeWidth="3" strokeLinecap="round" />
      </Svg>
      <View className="flex-row justify-between px-1">
        <Text className="text-xs" style={{ color: colors.textSecondary }}>{xLabels[0]}</Text>
        <Text className="text-xs" style={{ color: colors.textSecondary }}>{xLabels[1]}</Text>
        <Text className="text-xs" style={{ color: colors.textSecondary }}>{xLabels[2]}</Text>
      </View>
    </View>
  );
}
