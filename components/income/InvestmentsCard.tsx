import { useTheme } from '@/hooks/useTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

const InvestmentsCard = () => {
  const theme = useTheme();
  const router = useRouter();

  // Visual-only feedback on press
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Cast to any to avoid typedRoutes mismatch during static analysis; route exists at app/investments
    router.push('/investments' as any);
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
    <Pressable onPress={handlePress}>
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
            <MaterialCommunityIcons name="gauge" size={22} color={theme.text} />
          </View>
        </View>
        <Text style={{ color: theme.text }}>Investments</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 14 }}>View goals</Text>
      </Animated.View>
    </Pressable>
  );
};

export default InvestmentsCard;
