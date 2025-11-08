import TimeframeToggle from '@/components/TimeframeToggle'
import { CATEGORY_MAP, getCategoryChipColor, getCategoryColor } from '@/constants/categories'
import { useCurrency } from '@/hooks/useCurrency'
import { useTheme } from '@/hooks/useTheme'
import { useAppSelector } from '@/store/hooks'
import { selectCategoryPercentages, selectDeltaPercent, selectExpensesForCategoryInTimeframe, selectSortedCategoryTotals, selectTimeframeTotal } from '@/store/selectors/expensesSelectors'
import type { RootState } from '@/store/store'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Stack } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { FlatList, Text, View } from 'react-native'
import { PieChart } from 'react-native-gifted-charts'

const Transactions = () => {
  const theme = useTheme()
  const { formatCurrency, formatShort } = useCurrency()
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week')
  const totals = useAppSelector((s: RootState) => selectSortedCategoryTotals(s, timeframe))
  const percentages = useAppSelector((s: RootState) => selectCategoryPercentages(s, timeframe))
  const totalAmount = useAppSelector((s: RootState) => selectTimeframeTotal(s, timeframe))
  const deltaPercent = useAppSelector((s: RootState) => selectDeltaPercent(s, timeframe))

  const pieData = useMemo(() => {
    if (totalAmount <= 0) return [{ value: 100, color: '#333', text: '0%' }]
    return percentages.map((p) => ({
      value: p.percent,
      color: getCategoryColor(p.category),
      text: `${Math.round(p.percent)}%`
    }))
  }, [percentages, totalAmount])

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12 }}>
          <Text style={{ color: theme.text, fontSize: 26, fontWeight: '800' }}>Statistics</Text>
          <Text style={{ color: theme.textSecondary, marginTop: 4 }}>Track your spending patterns</Text>
          <View style={{ marginTop: 16 }}>
            <TimeframeToggle value={timeframe} onChange={setTimeframe} style={{ width: '100%' }} />
          </View>
        </View>

        {/* Totals Card + Pie */}
        <View style={{ marginHorizontal: 16 }}>
          <View style={{ backgroundColor: '#EF444455', borderRadius: 16, padding: 16, marginBottom: 12 }}>
            <Text style={{ color: theme.text, opacity: 0.9 }}>Total Expenses</Text>
            <Text style={{ color: theme.text, fontSize: 32, fontWeight: '800', marginTop: 6 }}>
              {formatCurrency(totalAmount)}
            </Text>
            {deltaPercent !== 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 }}>
                <Text style={{ color: deltaPercent > 0 ? '#EF4444' : '#22C55E', fontSize: 14, fontWeight: '600' }}>
                  {deltaPercent > 0 ? '↑' : '↓'} {Math.abs(deltaPercent).toFixed(0)}%
                </Text>
                <Text style={{ color: theme.text, opacity: 0.7, fontSize: 12 }}>
                  {deltaPercent > 0 ? 'higher' : 'lower'} than last {timeframe}
                </Text>
              </View>
            )}
          </View>
          <View style={{ backgroundColor: theme.background, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 8 }}>
            <PieChart
              data={pieData}
              donut
              radius={90}
              innerRadius={70}
              innerCircleColor={theme.background}
              showGradient={totalAmount > 0}
              shiftInnerCenterX={0}
              shiftInnerCenterY={0}
              centerLabelComponent={() => (
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  {totalAmount > 0 ? (
                    <>
                      <Text style={{ color: theme.text, fontSize: 16, fontWeight: '800' }}>
                        {formatShort(totalAmount)}
                      </Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>
                        {timeframe === 'week' ? 'This Week' : timeframe === 'month' ? 'This Month' : 'This Year'}
                      </Text>
                    </>
                  ) : (
                    <Text style={{ color: theme.textSecondary, fontSize: 14 }}>No data</Text>
                  )}
                </View>
              )}
            />
          </View>
        </View>

        {/* Category List */}
        <FlatList
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          data={totals}
          keyExtractor={(item) => item.category}
          ListHeaderComponent={() => (
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Top Categories</Text>
          )}
          renderItem={({ item }) => (
            <CategoryRow timeframe={timeframe} category={item.category} total={item.total} aggregateTotal={totalAmount} />
          )}
          ListEmptyComponent={() => (
            <View style={{ padding: 16 }}>
              <Text style={{ color: theme.textSecondary }}>No expenses found for this {timeframe}.</Text>
            </View>
          )}
        />
      </View>
    </>
  )
}

function CategoryRow({ timeframe, category, total, aggregateTotal }: { timeframe: 'week' | 'month' | 'year'; category: string; total: number; aggregateTotal: number }) {
  const theme = useTheme()
  const { formatCurrency } = useCurrency()
  const [expanded, setExpanded] = useState(false)
  const expenses = useAppSelector((s: RootState) => selectExpensesForCategoryInTimeframe(s, timeframe, category))
  const def = CATEGORY_MAP[category]
  const percent = aggregateTotal > 0 ? (total / aggregateTotal) * 100 : 0

  return (
    <View style={{ backgroundColor: theme.surface, borderRadius: 14, padding: 16, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', backgroundColor: getCategoryChipColor(category) }}>
            <MaterialCommunityIcons 
              name={def?.icon?.name as any || 'tag'} 
              size={22} 
              color={getCategoryColor(category)} 
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15 }}>{def?.name ?? category}</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>{Math.round(percent)}% of total</Text>
            <View style={{ height: 6, backgroundColor: theme.background, borderRadius: 999, marginTop: 6 }}>
              <View style={{ height: 6, borderRadius: 999, width: `${Math.max(4, percent)}%`, backgroundColor: getCategoryColor(category) }} />
            </View>
          </View>
        </View>
        <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15 }}>{formatCurrency(total)}</Text>
        <View style={{ width: 12 }} />
        <Text onPress={() => setExpanded(!expanded)} style={{ color: theme.tint, fontWeight: '600', fontSize: 13 }}>{expanded ? 'Hide' : 'View'}</Text>
      </View>
      {expanded && (
        <View style={{ marginTop: 10, backgroundColor: theme.card, borderRadius: 10, padding: 8 }}>
          {expenses.length === 0 && (
            <Text style={{ color: theme.text, opacity: 0.8 }}>No expenses in this category</Text>
          )}
          {expenses.map((e, idx) => {
            const d = new Date((e as any).createdAt || (e as any).date || 0)
            const ds = isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            return (
              <View key={(e as any)._id || e.id || String(idx)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 }}>
                <Text style={{ color: theme.text, flex: 1 }} numberOfLines={1}>{e.name || 'Unnamed'}</Text>
                <Text style={{ color: theme.text, width: 70, textAlign: 'right' }}>{ds}</Text>
                <Text style={{ color: theme.text, width: 90, textAlign: 'right', fontWeight: '700' }}>{formatCurrency(e.amount || 0)}</Text>
              </View>
            )
          })}
        </View>
      )}
    </View>
  )
}

export default Transactions