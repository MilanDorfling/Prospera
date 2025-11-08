import { useCurrency } from '@/hooks/useCurrency'
import { useTheme } from '@/hooks/useTheme'
import { useAppSelector } from '@/store/hooks'
import React from 'react'
import { Image, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Header = () => {
  const theme = useTheme();
  const { formatCurrency } = useCurrency();
  const profile = useAppSelector((state) => state.user.profile);

  const getInitials = () => {
    if (!profile.name) return '?';
    const names = profile.name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const getGreeting = () => {
    if (profile.name) {
      const firstName = profile.name.trim().split(' ')[0];
      return `Hello, ${firstName}`;
    }
    return 'Hello!';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
    <View 
      style={{
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        height: 70, 
        alignItems: 'center', 
        paddingHorizontal: 20
      }}
    >
      <View
        style={{ flexDirection: 'row', alignItems: 'center' }}
      >
      {profile.profilePhoto ? (
        <Image 
          source={{uri: profile.profilePhoto}} 
          style={{ height: 50, width: 50, borderRadius: 30 }} 
        />
      ) : (
        <View style={{ 
          height: 50, 
          width: 50, 
          borderRadius: 30, 
          backgroundColor: theme.surface, 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text }}>{getInitials()}</Text>
        </View>
      )}
        <View style={{ marginLeft: 10 }}>
          <Text style={{ color: theme.text, fontSize: 12 }}>{getGreeting()}</Text>
          <Text style={{ color: theme.text, fontSize: 16 }}>
            Your <Text style={{ fontWeight: '700' }}>Budget</Text>
          </Text>
        </View>
      </View>
      <View 
        style={{ borderColor: theme.border, borderWidth: 1, padding: 8, borderRadius: 10 }}
      >
        <Text style={{ color: theme.textSecondary, fontSize: 10 }}>
          Monthly Budget
        </Text>
        <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 2 }}>
          {profile.monthlyBudget ? formatCurrency(profile.monthlyBudget) : 'Not set'}
        </Text>
      </View>
    </View>
    </SafeAreaView>
  )
}

export default Header