import { useCurrency } from '@/hooks/useCurrency';
import { useTheme } from '@/hooks/useTheme';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { ExpenseType, IncomeType } from '@/types';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type WeekBucket = {
  start: Date;
  end: Date;
  label: string;
  total: number;
};

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday=0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isoWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Thursday in current week decides the year
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const diff = Number(date) - Number(firstThursday);
  return 1 + Math.round(diff / (7 * 24 * 3600 * 1000));
}

function parseWhenPossible(e: ExpenseType): Date | null {
  const v = (e as any).createdAt || (e as any).date;
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export default function SpendingBlock() {
  const theme = useTheme();
  const expenses = useAppSelector((s: RootState) => s.expenses.items);
  const income = useAppSelector((s: RootState) => s.income.items);
  const router = useRouter();
  const { formatCurrency } = useCurrency();

  const buckets = useMemo<WeekBucket[]>(() => {
    const now = new Date();
    const thisWeekStart = startOfWeek(now);

    // Create 7 daily buckets for current week (Mon-Sun)
    const COUNT = 7;
    const days: WeekBucket[] = Array.from({ length: COUNT }, (_, i) => {
      const start = addDays(thisWeekStart, i);
      const end = addDays(start, 1); // next day (exclusive)
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const label = dayNames[i];
      return { start, end, label, total: 0 };
    });

    // Sum expenses into daily buckets
    for (const e of expenses) {
      const d = parseWhenPossible(e);
      if (!d) continue;
      for (const day of days) {
        if (d >= day.start && d < day.end) {
          day.total += e.amount || 0;
          break;
        }
      }
    }

    return days;
  }, [expenses]);

  // Compute a simple weekly budget recommendation: 1/4 of total monthly income
  const weeklyBudget = useMemo(() => {
    const monthlyIncome = (income || []).reduce((sum: number, it: IncomeType) => sum + (parseFloat((it as any).amount) || 0), 0);
    // fall back to a minimal budget if income is zero to avoid divide-by-zero visuals
    return monthlyIncome > 0 ? monthlyIncome / 4 : 0;
  }, [income]);

  // Use weekly budget as baseline for meaningful scale, or highest spending if over budget
  const maxValue = useMemo(() => {
    const maxSpending = Math.max(...buckets.map((b) => b.total));
    const baseline = weeklyBudget > 0 ? weeklyBudget : 500; // Default to $500 if no income set
    // Use the higher of budget or max spending (with 10% padding)
    return Math.max(baseline, maxSpending * 1.1, 50); // Minimum $50 scale
  }, [buckets, weeklyBudget]);

  const data = useMemo(
    () =>
      buckets.map((b) => ({
        value: b.total,
        label: b.label,
        frontColor: "#99f800ff",
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/(tabs)/transactions');
        },
      })),
    [buckets, router]
  );

  // Total for entire current week (sum all 7 days)
  const totalThisWeek = buckets.reduce((sum, b) => sum + b.total, 0);

  const withinBudget = weeklyBudget > 0 ? totalThisWeek <= weeklyBudget : null;

  // Prepare expenses list (newest -> oldest)
  const sortedExpenses = useMemo(() => {
    const arr = [...expenses];
    arr.sort((a, b) => {
      const da = new Date((a as any).createdAt || (a as any).date || 0).getTime();
      const db = new Date((b as any).createdAt || (b as any).date || 0).getTime();
      return db - da;
    });
    return arr;
  }, [expenses]);

  const chartWidth = useMemo(() => {
    // Calculate available width: screen width minus container padding
    const containerPadding = SCREEN_WIDTH * 0.04 * 2; // main container padding
    const blockPadding = SCREEN_WIDTH * 0.03 * 2; // SpendingBlock padding
    const chartWrapPadding = 12 * 2; // chartWrap padding
    const availableWidth = SCREEN_WIDTH - containerPadding - blockPadding - chartWrapPadding;
    
    // Distribute space evenly across 7 days
    const totalSpace = availableWidth - 32; // margins
    const spacePerBar = totalSpace / 7;
    
    return availableWidth;
  }, [buckets.length]);

  return (
    <View style={{ marginTop: 20, padding: SCREEN_WIDTH * 0.03, backgroundColor: theme.surface, borderRadius: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700' }}>Spending Overview</Text>
        <Text style={{ color: theme.text, fontSize: 12 }}>This Week</Text>
      </View>
      <Pressable style={{ backgroundColor: theme.background, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 12, overflow: 'hidden' }} onPress={() => router.push('/(tabs)/transactions')} accessibilityRole="button" accessibilityLabel="Open detailed transactions view">
        <BarChart
          data={data}
          width={chartWidth}
          height={160}
          barWidth={24}
          spacing={20}
          noOfSections={3}
          maxValue={maxValue}
          yAxisThickness={0}
          xAxisThickness={0}
          hideYAxisText
          xAxisLabelTextStyle={{ color: theme.text, fontSize: 12 }}
          isAnimated
          animationDuration={700}
          hideRules
          capColor={theme.tint}
          capThickness={2}
          barBorderRadius={16}
          initialSpacing={8}
          endSpacing={8}
          hideOrigin
        />
      </Pressable>
      <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: theme.textSecondary, fontSize: 12 }}></Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {withinBudget !== null && (
            <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1, backgroundColor: withinBudget ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', borderColor: withinBudget ? '#22c55e' : '#ef4444' }}>
              <Text style={{ color: withinBudget ? '#22c55e' : '#ef4444', fontSize: 12, fontWeight: '600' }}>
                {withinBudget ? 'Within budget' : 'Over budget'}
              </Text>
            </View>
          )}
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700' }}>{formatCurrency(totalThisWeek)}</Text>
        </View>
      </View>

      {/* Expenses list (newest first) — render inline to avoid nested VirtualizedList warning */}
      <View style={{ marginTop: 10 }}>
        {sortedExpenses.length === 0 && (
          <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 6 }}>No expenses yet</Text>
        )}
        {sortedExpenses.slice(0, 8).map((item, idx) => {
          const d = new Date((item as any).createdAt || (item as any).date || Date.now());
          const dateStr = isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          const name = (item.name || '').trim() || 'Unnamed';
          return (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.background, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 10, marginBottom: 8, gap: 10 }} key={(item as any)._id ?? item.id ?? String(idx)}>
              <Text style={{ color: theme.text, fontSize: 14, flex: 1, fontWeight: '600' }} numberOfLines={1}>{name}</Text>
              <Text style={{ color: theme.text, fontSize: 12, width: 70, textAlign: 'right' }}>{dateStr}</Text>
              <Text style={{ color: theme.text, fontSize: 14, width: 90, textAlign: 'right', fontWeight: '700' }}>{formatCurrency(item.amount || 0)}</Text>
            </View>
          );
        })}
        {sortedExpenses.length > 8 && (
          <Text style={{ color: theme.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 4 }}>
            Showing 8 of {sortedExpenses.length} · See Transactions tab for more
          </Text>
        )}
      </View>
    </View>
  );
}
