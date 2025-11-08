import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export type TimeframeOption = 'week' | 'month' | 'year';

interface Props {
  value: TimeframeOption;
  onChange: (next: TimeframeOption) => void;
  style?: any;
}

const OPTIONS: TimeframeOption[] = ['week', 'month', 'year'];

export default function TimeframeToggle({ value, onChange, style }: Props) {
  const theme = useTheme();
  
  return (
    <View style={[{ flexDirection: 'row', backgroundColor: theme.surface, padding: 4, borderRadius: 14, alignSelf: 'stretch', gap: 4 }, style]}> 
      {OPTIONS.map(opt => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            accessibilityRole="button"
            accessibilityLabel={`Select ${opt}`}
            onPress={() => onChange(opt)}
            style={{
              flex: 1,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              ...(active && {
                backgroundColor: theme.surface,
                borderWidth: 1.5,
                borderColor: theme.tint,
              })
            }}
          >
            <Text style={{ color: theme.text, fontSize: 13, fontWeight: active ? '700' : '500' }}>
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
