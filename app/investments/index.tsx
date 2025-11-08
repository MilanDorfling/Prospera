import InterestCalculatorTab from '@/components/investments/InterestCalculatorTab';
import SavingsGoalsTab from '@/components/investments/SavingsGoalsTab';
import Colors from '@/constants/Colors';
import { useAppDispatch } from '@/store/hooks';
import { fetchAllGoals } from '@/store/slices/savingsSlice';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Tab = 'goals' | 'calculator';

export default function InvestmentsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('goals');
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Fetch goals on mount
    dispatch(fetchAllGoals());
  }, [dispatch]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Investments</Text>
          <Text style={styles.subtitle}>Plan your financial future</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tab, activeTab === 'goals' && styles.tabActive]}
            onPress={() => setActiveTab('goals')}
          >
            <Text style={[styles.tabLabel, activeTab === 'goals' && styles.tabLabelActive]}>
              Savings Goals
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'calculator' && styles.tabActive]}
            onPress={() => setActiveTab('calculator')}
          >
            <Text style={[styles.tabLabel, activeTab === 'calculator' && styles.tabLabelActive]}>
              Interest Calculator
            </Text>
          </Pressable>
        </View>

        {/* Tab Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'goals' ? <SavingsGoalsTab /> : <InterestCalculatorTab />}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
  },
  title: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: '#aaa',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: Colors.grey,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: Colors.grey,
    borderWidth: 1.5,
    borderColor: Colors.tintColor,
  },
  tabLabel: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '500',
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  content: {
    flex: 1,
    marginTop: 16,
  },
});
