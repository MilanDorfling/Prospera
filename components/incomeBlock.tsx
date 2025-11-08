import { useTheme } from '@/hooks/useTheme';
import { useAppDispatch } from '@/store/hooks';
import { updateIncome } from '@/store/slices/incomeSlice';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import FreelanceCard from './income/FreelanceCard';
import InvestmentsCard from './income/InvestmentsCard';
import SalaryCard from './income/SalaryCard';

interface IncomeBlockProps {
  incomeList: any[]; // no longer used directly; kept for prop compatibility
}

const IncomeBlock = ({ incomeList }: IncomeBlockProps) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState<'Salary' | 'Freelance' | null>(null);
  const [inputValue, setInputValue] = useState('');

  const openEditor = useCallback((payload: { id: string; name: 'Salary' | 'Freelance'; amount: number }) => {
    setEditId(payload.id);
    setEditName(payload.name);
    setInputValue(payload.amount.toFixed(2));
    setEditorOpen(true);
  }, []);

  const closeEditor = () => {
    setEditorOpen(false);
    setEditId(null);
    setEditName(null);
    setInputValue('');
  };

  const saveEditor = async () => {
    if (!editId) return closeEditor();
    const num = parseFloat(inputValue);
    if (isNaN(num) || num < 0) return closeEditor();
    try {
      await dispatch(updateIncome({ id: editId, amount: num })).unwrap();
    } catch {}
    closeEditor();
  };

  // Allow only digits and a single dot, max two decimals
  const sanitizeMoney = useCallback((text: string) => {
    // Remove invalid chars
    let v = text.replace(/[^0-9.]/g, '');
    // Keep only first dot
    const firstDot = v.indexOf('.');
    if (firstDot !== -1) {
      v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
    }
    // Limit to two decimals
    if (firstDot !== -1) {
      const [w, d] = v.split('.');
      v = w + '.' + (d ?? '').slice(0, 2);
    }
    // Remove leading zeros for whole part (except '0' or '0.x')
    if (v.startsWith('00')) {
      v = v.replace(/^0+/, '0');
    }
    return v;
  }, []);

  const isInvalid = useMemo(() => {
    if (!inputValue) return true;
    const n = Number(inputValue);
    return !isFinite(n) || n < 0;
  }, [inputValue]);

  return (
    <View>
      <Text style={{ color: theme.text, fontSize: 16, marginBottom: 20 }}>
        My <Text style={{ fontWeight: '700' }}>Income</Text>
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexDirection: 'row', gap: 15, paddingRight: 15 }}
      >
        <SalaryCard onPressEdit={(p) => openEditor(p)} />
        <FreelanceCard onPressEdit={(p) => openEditor(p)} />
        <InvestmentsCard />
      </ScrollView>

      <Modal visible={editorOpen} transparent animationType="slide" onRequestClose={closeEditor}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: theme.surface, width: '100%', borderRadius: 16, padding: 16 }}>
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600', marginBottom: 10 }}>Edit {editName}</Text>
            <TextInput
              style={{ color: theme.text, fontSize: 18, borderBottomColor: theme.tint, borderBottomWidth: 1, paddingVertical: 6 }}
              value={inputValue}
              onChangeText={(t) => setInputValue(sanitizeMoney(t))}
              keyboardType="numeric"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={saveEditor}
              placeholderTextColor={theme.textSecondary}
            />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <Pressable onPress={closeEditor} style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: theme.card }}>
                <Text style={{ color: theme.text }}>Cancel</Text>
              </Pressable>
              <Pressable disabled={isInvalid} onPress={saveEditor} style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: isInvalid ? theme.card : theme.tint }}>
                <Text style={{ color: theme.white }}>Save</Text>
              </Pressable>
            </View>
            <View style={{ marginTop: 6 }}>
              <Pressable onPress={() => Alert.alert('What is this?', 'Enter your monthly income amount in dollars. Only numbers and up to two decimals are allowed.')}>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>What is this?</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default IncomeBlock;