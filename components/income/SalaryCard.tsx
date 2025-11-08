import { useCurrency } from '@/hooks/useCurrency';
import { useTheme } from '@/hooks/useTheme';
import { useAppSelector } from '@/store/hooks';
import { FontAwesome } from '@expo/vector-icons';
import React, { useMemo, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

type Props = {
  onPressEdit?: (payload: { id: string; name: 'Salary'; amount: number }) => void;
};

const SalaryCard = ({ onPressEdit }: Props) => {
  const theme = useTheme();
  const { symbol } = useCurrency();
  const salary = useAppSelector((state) =>
    state.income.items.find((i) => i.name === 'Salary')
  );

  const id = salary?._id || (salary as any)?.id;
  const amountNum = useMemo(() => Number(salary?.amount ?? 0), [salary?.amount]);
  const [whole, cents] = amountNum.toFixed(2).split('.');

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (id && onPressEdit) onPressEdit({ id, name: 'Salary', amount: amountNum });
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, friction: 6 }),
        Animated.timing(opacityAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 6 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]),
    ]).start();
  };

  return (
    <Pressable onPress={handlePress} disabled={!id}>
      <Animated.View
        style={{
          backgroundColor: theme.surface,
          padding: 20,
          borderRadius: 20,
          width: 150,
          gap: 10,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ borderColor: theme.border, borderWidth: 1, borderRadius: 50, padding: 5, alignSelf: 'flex-start' }}>
            <FontAwesome name="dollar" size={22} color={theme.text} />
          </View>
        </View>
        <Text style={{ color: theme.text }}>Salary</Text>
        <Text style={{ color: theme.text, fontSize: 18, fontWeight: '600' }}>
          {symbol}{whole}.<Text style={{ fontSize: 12, fontWeight: '400' }}>{cents}</Text>
        </Text>
      </Animated.View>
    </Pressable>
  );
};

export default SalaryCard;
