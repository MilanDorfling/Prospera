import { CATEGORIES, getCategoryChipColor, getCategoryColor } from '@/constants/categories';
import { useCurrency } from '@/hooks/useCurrency';
import { useTheme } from '@/hooks/useTheme';
import { useAppDispatch } from '@/store/hooks';
import { addExpense, fetchAllExpenses, removeExpense, updateExpense } from '@/store/slices/expenseSlice';
import { ExpenseType } from '@/types';
import { Feather, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Easing, FlatList, ListRenderItem, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, } from 'react-native';

// Marquee for overflowing names on small cards
function MarqueeName({ text, color }: { text: string; color: string }) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const needsScroll = textWidth > containerWidth && containerWidth > 0;

  useEffect(() => {
    translateX.stopAnimation();
    translateX.setValue(0);
    if (!needsScroll) return;
    const distance = textWidth - containerWidth;
    const duration = Math.max(3500, distance * 30); // speed scaling
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(translateX, { toValue: -distance, duration, easing: Easing.linear, useNativeDriver: true }),
        Animated.delay(600),
        Animated.timing(translateX, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [needsScroll, textWidth, containerWidth, translateX]);

  return (
    <View
      style={{ overflow: 'hidden' }}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Animated.Text
        numberOfLines={1}
        onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
        style={[styles.expenseBlockTxt1, { color, transform: [{ translateX }] }]}
      >
        {text}
      </Animated.Text>
    </View>
  );
}

interface ExpenseBlockProps {
  expenseList: (ExpenseType & { color?: string })[];
  totalExpenses: number;
}

const ExpenseBlock = ({
  expenseList,
  totalExpenses,
}: ExpenseBlockProps) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { symbol } = useCurrency();
  const [modalVisible, setModalVisible] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [step, setStep] = useState<'select-category' | 'details'>('details');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('uncategorized');

  // Long-press feedback (single animated value, applied to pressed card only)
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [pressedId, setPressedId] = useState<string | null>(null);

  const chartColors = useMemo(
    () => [
      theme.tint,
      theme.blue,
      theme.green,
      theme.red,
      theme.purple,
      theme.blue,
    ],
    [theme]
  );

  // 🔹 Load expenses from backend on mount
  useEffect(() => {
    dispatch(fetchAllExpenses());
  }, [dispatch]);

  // 🔹 Add new expense (save to backend + state)
  const handleAddExpense = async () => {
    const trimmedName = (name || '').trim();
    const amtNum = parseFloat(amount);
    if (!trimmedName || isNaN(amtNum)) {
      Alert.alert('Missing info', 'Please enter a name and a valid amount.');
      return;
    }

    const newExpense = {
      name: trimmedName,
      amount: amtNum,
      category: category || 'uncategorized',
  // Persist color for historical stability: base color (same as icon)
  color: getCategoryColor(category),
    } as any;

    try {
      await dispatch(addExpense(newExpense)).unwrap();
    } catch (err) {
      console.error('Error adding expense:', err);
      Alert.alert('Error', 'Could not add expense. Please try again.');
    } finally {
      // Always reset state
      setName('');
      setAmount('');
      setCategory('uncategorized');
      setModalVisible(false);
      setStep('details');
      setPressedId(null);
      opacityAnim.setValue(1);
    }
  };

  const handleUpdateExpense = async () => {
    if (!selectedId) return;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 0) return;
    try {
      await dispatch(
        updateExpense({ id: selectedId, update: { name, amount: amt, category, color: getCategoryColor(category) } })
      ).unwrap();
    } catch (err) {
      console.error('Error updating expense:', err);
      Alert.alert('Error', 'Could not update expense.');
    } finally {
      // Always reset state regardless of success/failure
      setModalVisible(false);
      setSelectedId(null);
      setName('');
      setAmount('');
  setCategory('uncategorized');
      setPressedId(null);
      // Ensure opacity resets when modal closes
      opacityAnim.setValue(1);
    }
  };

  // sanitize amount input: only digits and one dot, 2 decimals
  const sanitizeMoney = useCallback((text: string) => {
    let v = text.replace(/[^0-9.]/g, '');
    const dot = v.indexOf('.');
    if (dot !== -1) {
      v = v.slice(0, dot + 1) + v.slice(dot + 1).replace(/\./g, '');
      const [w, d] = v.split('.');
      v = w + '.' + (d ?? '').slice(0, 2);
    }
    if (v.startsWith('00')) v = v.replace(/^0+/, '0');
    return v;
  }, []);

  // 🔹 Remove expense (delete from backend + state)
  const handleRemoveExpense = async (id: string) => {
    try {
      await dispatch(removeExpense(id)).unwrap();
    } catch (err) {
      console.error('Error deleting expense:', err);
      Alert.alert('Error', 'Could not delete expense.');
    }
  };

  const startEditTimer = (id: string, item: Partial<ExpenseType & { color?: string }>) => {
    setPressedId(id);
    Animated.timing(opacityAnim, { toValue: 0.7, duration: 400, useNativeDriver: true }).start();
    const t = setTimeout(() => {
      // Haptic feedback when edit opens
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setMode('edit');
      setSelectedId(id);
  setName(item.name ?? '');
  setAmount(String(item.amount ?? 0));
  setCategory((item as any).category ?? 'uncategorized');
      setStep('details');
      setModalVisible(true);
      setPressedId(null);
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }, 400);
    pressTimerRef.current = t;
  };

  const cancelEditTimer = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    setPressedId(null);
    Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  // 🔹 Function to determine readable text color based on brightness
  const getTextColor = (bgColor: string) => {
    if (!bgColor) return theme.white;
    const c = bgColor.replace('#', '');
    const rgb = parseInt(c.substring(0, 6), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    // Use perceptual luminance (ITU-R BT.709)
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    // Only use black text on very bright backgrounds (luminance > 0.6)
    return luminance > 0.6 ? theme.black : theme.white;
  };

  // 🔹 Render expense cards
  const renderItem: ListRenderItem<
    Partial<ExpenseType & { color?: string }>
  > = ({ item, index }) => {
    if (index === 0) {
      return (
        <TouchableOpacity onPress={() => { setMode('add'); setSelectedId(null); setName(''); setAmount(''); setCategory('uncategorized'); setStep('select-category'); setModalVisible(true); }}>
          <View style={styles.addItemBtn}>
            <Feather name="plus" size={22} color={'#ccc'} />
          </View>
        </TouchableOpacity>
      );
    }

  const amountValue = item.amount ?? 0;
  const displayName = typeof item.name === 'string' && item.name.trim().length > 0 ? item.name : 'Unnamed';
  const id = (item as any)._id || item.id; // handle MongoDB _id or local id
  const catId = (item as any).category as string | undefined;
  // Card color should match the base icon color (chip is slightly darker)
  const color = catId ? getCategoryColor(catId) : (item.color ?? chartColors[Math.floor(Math.random() * chartColors.length)]);
    const percentage =
      totalExpenses > 0
        ? ((amountValue / totalExpenses) * 100).toFixed(0)
        : '0';
    const amountStr = amountValue.toFixed(2).split('.');
    const textColor = getTextColor(color);

    const key = (item as any)._id || item.id || String(index);
    const cardOpacity = pressedId === key ? opacityAnim : 1;
    return (
      <Pressable
        onPressIn={() => startEditTimer(key!, item)}
        onPressOut={cancelEditTimer}
      >
        <Animated.View style={[styles.expenseBlock, { backgroundColor: color, opacity: cardOpacity }]}> 
        {/* Delete button */}
        <Pressable style={styles.removeBtn} onPress={() => handleRemoveExpense(id!)}>
          <FontAwesome name="trash" size={14} color={textColor} />
        </Pressable>

  <MarqueeName text={displayName} color={textColor} />
        <Text style={[styles.expenseBlockTxt2, { color: textColor }]}>
          {symbol}{amountStr[0]}.<Text style={styles.expenseBlockTxt2span}>{amountStr[1]}</Text>
        </Text>

        {/* Percentage bubble */}
        <View style={styles.expenseBlock3View}>
          <Text style={[styles.expenseBlockTxt3, { color: textColor }]}>
            {percentage}%
          </Text>
        </View>
        </Animated.View>
      </Pressable>
    );
  };

  const staticItem: Partial<ExpenseType>[] = [{}];

  return (
    <View style={{ paddingVertical: 20 }}>
      <FlatList
        data={staticItem.concat(expenseList)}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => (item as any)._id ?? item.id ?? Math.random().toString()}
      />

      {/* Modal for add/edit expense */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setPressedId(null);
          setStep('details');
          opacityAnim.setValue(1);
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setModalVisible(false);
            setPressedId(null);
            setStep('details');
            opacityAnim.setValue(1);
          }}
        >
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            {mode === 'add' && step === 'select-category' ? (
              <>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Select a Category</Text>
                <View style={{ gap: 22, marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                    {CATEGORIES.slice(0, 4).map((c) => (
                      <Pressable
                        key={c.id}
                        onPress={() => { setCategory(c.id); setStep('details'); }}
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 28,
                          backgroundColor: getCategoryChipColor(c.id),
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <MaterialCommunityIcons name={c.icon.name as any} size={24} color={getCategoryColor(c.id)} />
                      </Pressable>
                    ))}
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                    {CATEGORIES.slice(4, 8).map((c) => (
                      <Pressable
                        key={c.id}
                        onPress={() => { setCategory(c.id); setStep('details'); }}
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 28,
                          backgroundColor: getCategoryChipColor(c.id),
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <MaterialCommunityIcons name={c.icon.name as any} size={24} color={getCategoryColor(c.id)} />
                      </Pressable>
                    ))}
                  </View>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.modalTitle, { color: theme.text }]}>{mode === 'add' ? 'Add Expense' : 'Edit Expense'}</Text>
                {/* Selected category badge (for context) */}
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: getCategoryChipColor(category), paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                    <MaterialCommunityIcons name={(CATEGORIES.find(x => x.id === category)?.icon.name || 'tag') as any} size={14} color={getCategoryColor(category)} />
                    <Text style={{ color: theme.white, fontSize: 12 }}>{(CATEGORIES.find(x => x.id === category)?.name) || 'Uncategorized'}</Text>
                  </View>
                  {mode === 'add' && (
                    <Pressable onPress={() => setStep('select-category')} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: theme.card }}>
                      <Text style={{ color: theme.white, fontSize: 12 }}>Change</Text>
                    </Pressable>
                  )}
                </View>

                <TextInput
                  placeholder="Expense name"
                  placeholderTextColor={theme.textSecondary}
                  value={name}
                  onChangeText={setName}
                  style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
                />
                <TextInput
                  placeholder="Amount"
                  placeholderTextColor={theme.textSecondary}
                  value={amount}
                  onChangeText={(t) => setAmount(sanitizeMoney(t))}
                  keyboardType="numeric"
                  style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Pressable onPress={() => Alert.alert('Name', 'Enter a label for your expense, e.g., Rent or Groceries.')}> 
                    <Text style={{ color: '#aaa', fontSize: 12 }}>What is the name?</Text>
                  </Pressable>
                  <Pressable onPress={() => Alert.alert('Amount', 'Enter the cost in dollars. Only numbers and up to two decimals are allowed.')}> 
                    <Text style={{ color: '#aaa', fontSize: 12 }}>What is the amount?</Text>
                  </Pressable>
                </View>
                <View style={styles.modalActions}>
                  {mode === 'add' ? (
                    <Pressable style={{ backgroundColor: theme.tint, padding: 10, borderRadius: 8 }} onPress={handleAddExpense}>
                      <Text style={{ color: theme.white }}>Add</Text>
                    </Pressable>
                  ) : (
                    <Pressable style={{ backgroundColor: theme.tint, padding: 10, borderRadius: 8 }} onPress={handleUpdateExpense}>
                      <Text style={{ color: theme.white }}>Save</Text>
                    </Pressable>
                  )}
                </View>
              </>
            )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default ExpenseBlock;

const styles = StyleSheet.create({
  expenseBlock: {
    width: 100,
    padding: 14,
    paddingVertical: 20,
    height: 120,
    borderRadius: 15,
    marginRight: 20,
    gap: 8,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
  },
  expenseBlockTxt1: { fontSize: 14 },
  expenseBlockTxt2: { fontSize: 16, fontWeight: '700' },
  expenseBlockTxt2span: { fontSize: 12, fontWeight: '400' },
  expenseBlockTxt3: { fontSize: 12, fontWeight: '500' },
  expenseBlock3View: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  removeBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 2,
    padding: 2,
  },
  addItemBtn: {
    width: 80,
    height: 120,
    borderWidth: 2,
    borderColor: '#666',
    borderStyle: 'dashed',
    borderRadius: 10,
    marginRight: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    padding: 20,
    borderRadius: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
    marginTop: 10,
  },
});
