// React & Expo
import { Stack } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { PieChart } from 'react-native-gifted-charts'

// Components
import ExpenseBlock from '@/components/ExpenseBlock'
import Header from '@/components/header'
import IncomeBlock from '@/components/incomeBlock'
import OnboardingCoach from '@/components/OnboardingCoach'
import SpendingBlock from '@/components/SpendingBlock'

// Store
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchAllExpenses } from '@/store/slices/expenseSlice'
import { fetchAllIncome } from '@/store/slices/incomeSlice'
import { initializeUser } from '@/store/slices/userSlice'
import type { RootState } from '@/store/store'

// Constants & Utils
import { getCategoryColor, normalizeCategoryId } from '@/constants/categories'
import { useCurrency } from '@/hooks/useCurrency'
import { useTheme } from '@/hooks/useTheme'
import type { ExpenseType } from '@/types'

const Page = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const expenses = useAppSelector((state: RootState) => state.expenses.items);
  const income = useAppSelector((state: RootState) => state.income.items);
  const { token, loading, profile } = useAppSelector((state: RootState) => state.user);
  const { formatCurrency, formatShort } = useCurrency();

  const [selectedSlice, setSelectedSlice] = useState<number | null>(null);

  // Color palette not needed for category-locked colors

  useEffect(() => {
    dispatch(initializeUser());
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      dispatch(fetchAllExpenses());
      dispatch(fetchAllIncome());
    }
  }, [token, dispatch]);

  // --- Calculate total expenses
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum: number, item: ExpenseType) => sum + (item.amount || 0), 0);
  }, [expenses]);


  // --- Prepare pie chart data (aggregate by category)
  const pieData = useMemo(() => {
    if (totalExpenses === 0) {
      return [{ value: 100, color: '#444', text: '0%' }];
    }

    // Aggregate totals by category id
    const byCategory = new Map<string, number>();
    expenses.forEach((e) => {
      const cat = normalizeCategoryId(e.category);
      const prev = byCategory.get(cat) || 0;
      byCategory.set(cat, prev + (e.amount || 0));
    });

    const entries = Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1]);
    const data = entries.map(([cat, amt], index) => {
      const percentage = (amt / totalExpenses) * 100;
      const color = getCategoryColor(cat);
      return {
        value: percentage,
        color,
        text: `${percentage.toFixed(0)}%`,
        onPress: () => setSelectedSlice(index),
      };
    });

    return data.length > 0 ? data : [{ value: 100, color: '#444', text: '0%' }];
  }, [expenses, totalExpenses]);

  // --- Memoize income data based on specific income items (not entire array)

  if (loading) {
    return (
      <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Loading your data...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          header: () => <Header />,
        }}
      />
      <View style={[{ flex: 1, backgroundColor: theme.background, paddingHorizontal: 8 }, { paddingTop: 130 }]}>
        <OnboardingCoach />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* --- Monthly Budget Indicator --- */}
          {profile.monthlyBudget && profile.monthlyBudget > 0 && (
            <View style={{ marginBottom: 16, backgroundColor: theme.surface, borderRadius: 12, padding: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: theme.text, fontSize: 14 }}>Monthly Budget</Text>
                <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>
                  {formatShort(totalExpenses)} / {formatShort(profile.monthlyBudget)}
                </Text>
              </View>
              <View style={{ height: 8, backgroundColor: theme.black, borderRadius: 4, overflow: 'hidden' }}>
                <View 
                  style={{ 
                    height: '100%', 
                    width: `${Math.min(100, (totalExpenses / profile.monthlyBudget) * 100)}%`,
                    backgroundColor: totalExpenses > profile.monthlyBudget ? theme.red : 
                                     totalExpenses > profile.monthlyBudget * 0.9 ? '#F59E0B' : 
                                     theme.tint 
                  }} 
                />
              </View>
              {totalExpenses > profile.monthlyBudget && (
                <Text style={{ color: theme.red, fontSize: 12, marginTop: 4 }}>
                  ⚠️ You've exceeded your budget by {formatShort(totalExpenses - profile.monthlyBudget)}
                </Text>
              )}
              {totalExpenses > profile.monthlyBudget * 0.9 && totalExpenses <= profile.monthlyBudget && (
                <Text style={{ color: '#F59E0B', fontSize: 12, marginTop: 4 }}>
                  ⚠️ Approaching budget limit ({((totalExpenses / profile.monthlyBudget) * 100).toFixed(0)}%)
                </Text>
              )}
            </View>
          )}

          {/* --- Total Expenses Section --- */}
          <View key="expenses-section" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ gap: 10 }}>
              <Text style={{ color: theme.text, fontSize: 16 }}>
                My <Text style={{ fontWeight: '700' }}>Expenses</Text>
              </Text>
              <Text style={{ color: theme.text, fontSize: 36, fontWeight: '700' }}>
                {formatCurrency(totalExpenses)}
              </Text>
            </View>

            {/* --- Pie Chart Section --- */}
            <View style={{ padding: 20, alignItems: 'center' }}>
              <PieChart
                data={pieData}
                donut
                showGradient={expenses.length > 0}
                sectionAutoFocus={expenses.length > 0}
                focusOnPress={expenses.length > 0}
                semiCircle
                radius={70}
                innerRadius={55}
                innerCircleColor={theme.background}
                centerLabelComponent={() => {
                  if (selectedSlice !== null && pieData[selectedSlice]) {
                    const slice = pieData[selectedSlice];
                    const pctText = typeof slice.text === 'string' ? slice.text : '';
                    return (
                      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 22, color: theme.text, fontWeight: 'bold' }}>
                          {pctText}
                        </Text>
                      </View>
                    );
                  }

                  return (
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: 22, color: theme.text, fontWeight: 'bold' }}>
                        {totalExpenses > 0 ? '100%' : '0%'}
                      </Text>
                    </View>
                  );
                }}
              />
            </View>
          </View>

          {/* --- Expense Block --- */}
          <ExpenseBlock
            key="expense-block"
            expenseList={expenses}
            totalExpenses={totalExpenses}
          />

          {/* -- Income Block (Salary and Freelance editable, Investments view-only) -- */}
          <IncomeBlock
            key="income-block"
            incomeList={income}
          />

          {/* Weekly Spending Overview */}
          <SpendingBlock />
        </ScrollView>
      </View>
    </>
  );
};

export default Page;
