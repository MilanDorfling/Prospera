import Colors from '@/constants/Colors';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface WheelDatePickerProps {
  initialDate?: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  onDateChange: (date: Date) => void;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

function generateDays(month: number, year: number): number[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => i + 1);
}

function generateMonths(): Array<{ value: number; label: string }> {
  return [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];
}

function generateYears(min: number, max: number): number[] {
  const years: number[] = [];
  for (let y = min; y <= max; y++) {
    years.push(y);
  }
  return years;
}

export default function WheelDatePicker({
  initialDate = new Date(),
  minimumDate = new Date(),
  maximumDate = new Date(new Date().getFullYear() + 20, 11, 31),
  onDateChange,
}: WheelDatePickerProps) {
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());

  const months = generateMonths();
  const years = generateYears(minimumDate.getFullYear(), maximumDate.getFullYear());
  const [days, setDays] = useState<number[]>(generateDays(selectedMonth, selectedYear));

  const dayScrollRef = useRef<ScrollView>(null);
  const monthScrollRef = useRef<ScrollView>(null);
  const yearScrollRef = useRef<ScrollView>(null);

  // Update days when month or year changes
  useEffect(() => {
    const newDays = generateDays(selectedMonth, selectedYear);
    setDays(newDays);
    
    // If current selected day doesn't exist in new month, adjust it
    if (selectedDay > newDays.length) {
      setSelectedDay(newDays.length);
    }
  }, [selectedMonth, selectedYear]);

  // Notify parent of date changes
  useEffect(() => {
    const newDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
    onDateChange(newDate);
  }, [selectedDay, selectedMonth, selectedYear, onDateChange]);

  const scrollToIndex = (ref: React.RefObject<ScrollView | null>, index: number) => {
    ref.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
  };

  // Initialize scroll positions
  useEffect(() => {
    setTimeout(() => {
      scrollToIndex(dayScrollRef, selectedDay - 1);
      scrollToIndex(monthScrollRef, selectedMonth - 1);
      scrollToIndex(yearScrollRef, years.indexOf(selectedYear));
    }, 100);
  }, []);

  const handleDayScroll = useCallback((event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const validIndex = Math.max(0, Math.min(index, days.length - 1));
    if (days[validIndex] !== selectedDay) {
      setSelectedDay(days[validIndex]);
    }
  }, [days, selectedDay]);

  const handleMonthScroll = useCallback((event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const validIndex = Math.max(0, Math.min(index, months.length - 1));
    if (months[validIndex].value !== selectedMonth) {
      setSelectedMonth(months[validIndex].value);
    }
  }, [months, selectedMonth]);

  const handleYearScroll = useCallback((event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const validIndex = Math.max(0, Math.min(index, years.length - 1));
    if (years[validIndex] !== selectedYear) {
      setSelectedYear(years[validIndex]);
    }
  }, [years, selectedYear]);

  const renderWheel = (
    items: Array<number | { value: number; label: string }>,
    selected: number,
    scrollRef: React.RefObject<ScrollView | null>,
    onScroll: (e: any) => void,
    type: 'day' | 'month' | 'year'
  ) => {
    return (
      <View style={styles.wheelContainer}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={onScroll}
          contentContainerStyle={styles.scrollContent}
          style={{ height: WHEEL_HEIGHT }}
        >
          {/* Top padding */}
          <View style={{ height: ITEM_HEIGHT * 2 }} />
          
          {items.map((item, index) => {
            const value = typeof item === 'number' ? item : item.value;
            const label = typeof item === 'number' ? String(item) : item.label;
            const isSelected = value === selected;
            
            return (
              <Pressable
                key={value}
                onPress={() => {
                  if (type === 'day') setSelectedDay(value);
                  if (type === 'month') setSelectedMonth(value);
                  if (type === 'year') setSelectedYear(value);
                  scrollToIndex(scrollRef, index);
                }}
                style={[styles.item, isSelected && styles.itemSelected]}
              >
                <Text
                  style={[
                    styles.itemText,
                    isSelected && styles.itemTextSelected,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
          
          {/* Bottom padding */}
          <View style={{ height: ITEM_HEIGHT * 2 }} />
        </ScrollView>
        
        {/* Selection indicator */}
        <View style={styles.selectionIndicator} pointerEvents="none">
          <View style={styles.selectionLine} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.wheelRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.columnLabel}>Day</Text>
          {renderWheel(days, selectedDay, dayScrollRef, handleDayScroll, 'day')}
        </View>
        
        <View style={{ flex: 2 }}>
          <Text style={styles.columnLabel}>Month</Text>
          {renderWheel(months, selectedMonth, monthScrollRef, handleMonthScroll, 'month')}
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={styles.columnLabel}>Year</Text>
          {renderWheel(years, selectedYear, yearScrollRef, handleYearScroll, 'year')}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.black,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  wheelRow: {
    flexDirection: 'row',
    gap: 8,
  },
  columnLabel: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.7,
  },
  wheelContainer: {
    position: 'relative',
    height: WHEEL_HEIGHT,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingVertical: 0,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemSelected: {
    // Selected state handled by text styling
  },
  itemText: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.4,
  },
  itemTextSelected: {
    fontSize: 18,
    fontWeight: '700',
    opacity: 1,
    color: Colors.tintColor,
  },
  selectionIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  selectionLine: {
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.tintColor + '40',
    backgroundColor: Colors.tintColor + '10',
  },
});
