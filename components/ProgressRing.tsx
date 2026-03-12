import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { AppTheme } from '@/constants/AppTheme';

type ProgressRingProps = {
  percent: number;
  isDark: boolean;
};

export function ProgressRing({ percent, isDark }: ProgressRingProps) {
  const colors = isDark ? AppTheme.dark : AppTheme.light;
  const size = 78;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalized = Math.max(0, Math.min(100, percent));
  const offset = circumference * (1 - normalized / 100);

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.success}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          fill="none"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text className="text-sm font-bold absolute" style={{ color: colors.textPrimary }}>{normalized.toFixed(2)}%</Text>
    </View>
  );
}
