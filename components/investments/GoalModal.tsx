import WheelDatePicker from '@/components/WheelDatePicker';
import Colors from '@/constants/Colors';
import { SavingsGoal } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

interface GoalModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (goal: Omit<SavingsGoal, '_id' | 'userToken' | 'createdAt' | 'updatedAt' | 'completedAt'>) => void;
  editingGoal?: SavingsGoal | null;
}

const ICON_OPTIONS: Array<{ icon: SavingsGoal['icon']; label: string }> = [
  { icon: 'car', label: 'Car' },
  { icon: 'home', label: 'Home' },
  { icon: 'airplane', label: 'Travel' },
  { icon: 'school', label: 'Education' },
  { icon: 'heart-pulse', label: 'Health' },
  { icon: 'piggy-bank', label: 'Savings' },
  { icon: 'star', label: 'Other' },
];

export default function GoalModal({ visible, onClose, onSave, editingGoal }: GoalModalProps) {
  const [step, setStep] = useState(1);
  const [selectedIcon, setSelectedIcon] = useState<SavingsGoal['icon']>('piggy-bank');
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [internalDate, setInternalDate] = useState<Date | null>(null);
  // Palette chosen to harmonize with existing accent colors
  const COLOR_CHOICES = ['#198a00ff','#22C55E','#4dff7cff','#86d3ffff','#ffa60bff','#ff6b6bff','#b28dff','#547ab3ff'];
  const [selectedColor, setSelectedColor] = useState<string>(COLOR_CHOICES[0]);

  useEffect(() => {
    if (editingGoal) {
      setSelectedIcon(editingGoal.icon);
      setName(editingGoal.name);
      setTargetAmount(editingGoal.targetAmount.toString());
      setCurrentAmount(editingGoal.currentAmount.toString());
      setMonthlyContribution(editingGoal.monthlyContribution?.toString() || '');
      setSelectedColor(editingGoal.color || COLOR_CHOICES[0]);
      // Prefill date as DD-MM-YYYY
      const d = new Date(editingGoal.targetDate);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      setTargetDate(`${dd}-${mm}-${yyyy}`);
      setInternalDate(d);
    } else {
      resetForm();
    }
  }, [editingGoal, visible]);

  const resetForm = () => {
    setStep(1);
    setSelectedIcon('piggy-bank');
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setMonthlyContribution('');
    setTargetDate('');
    setInternalDate(null);
    setSelectedColor(COLOR_CHOICES[0]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNext = () => {
    if (step === 1 && !selectedIcon) {
      Alert.alert('Error', 'Please select an icon');
      return;
    }
    if (step === 2) {
      if (!name.trim()) {
        Alert.alert('Error', 'Please enter a goal name');
        return;
      }
      if (!targetAmount || parseFloat(targetAmount) <= 0) {
        Alert.alert('Error', 'Please enter a valid target amount');
        return;
      }
      if (currentAmount && parseFloat(currentAmount) < 0) {
        Alert.alert('Error', 'Current amount cannot be negative');
        return;
      }
      if (monthlyContribution && parseFloat(monthlyContribution) <= 0) {
        Alert.alert('Error', 'Monthly contribution must be greater than 0');
        return;
      }
    }
    if (step === 3) {
      if (!internalDate) {
        Alert.alert('Error', 'Please select a target date');
        return;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (internalDate <= today) {
        Alert.alert('Error', 'Target date must be in the future');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSave = () => {
    if (!internalDate) {
      Alert.alert('Error', 'Select a date first');
      return;
    }
    const goalData = {
      name: name.trim(),
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount || '0'),
      targetDate: internalDate.toISOString(),
      icon: selectedIcon,
      color: selectedColor,
      monthlyContribution: monthlyContribution ? parseFloat(monthlyContribution) : undefined,
    };

    console.log('[GoalModal] Saving goal with data:', goalData);
    onSave(goalData);
    handleClose();
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((num) => (
        <View
          key={num}
          style={[
            styles.stepDot,
            step >= num && styles.stepDotActive,
          ]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose an Icon</Text>
      <View style={styles.iconGrid}>
        {ICON_OPTIONS.map((option) => (
          <Pressable
            key={option.icon}
            style={[
              styles.iconOption,
              selectedIcon === option.icon && styles.iconOptionSelected,
            ]}
            onPress={() => setSelectedIcon(option.icon)}
          >
            <MaterialCommunityIcons
              name={option.icon as any}
              size={36}
              color={selectedIcon === option.icon ? Colors.white : Colors.tintColor}
            />
            <Text
              style={[
                styles.iconLabel,
                selectedIcon === option.icon && styles.iconLabelSelected,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={[styles.label,{marginTop:24}]}>Goal Color</Text>
      <View style={styles.colorRow}>
        {COLOR_CHOICES.map(c => (
          <Pressable
            key={c}
            onPress={() => setSelectedColor(c)}
            style={[styles.colorSwatch,{backgroundColor:c, borderColor: selectedColor===c? Colors.white: 'transparent'}]}
          />
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Goal Details</Text>
      
      <Text style={styles.label}>Goal Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g., New Car, Dream Vacation"
        placeholderTextColor={Colors.white + '88'}
      />

      <Text style={styles.label}>Target Amount ($)</Text>
      <TextInput
        style={styles.input}
        value={targetAmount}
        onChangeText={setTargetAmount}
        placeholder="0.00"
        placeholderTextColor={Colors.white + '88'}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Current Amount ($)</Text>
      <TextInput
        style={styles.input}
        value={currentAmount}
        onChangeText={setCurrentAmount}
        placeholder="0.00"
        placeholderTextColor={Colors.white + '88'}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Monthly Contribution ($) - Optional</Text>
      <TextInput
        style={styles.input}
        value={monthlyContribution}
        onChangeText={setMonthlyContribution}
        placeholder="0.00"
        placeholderTextColor={Colors.white + '88'}
        keyboardType="decimal-pad"
      />
    </View>
  );

  const onDateChange = (selected: Date) => {
    setInternalDate(selected);
    const dd = String(selected.getDate()).padStart(2, '0');
    const mm = String(selected.getMonth() + 1).padStart(2, '0');
    const yyyy = selected.getFullYear();
    setTargetDate(`${dd}-${mm}-${yyyy}`);
  };

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Target Date</Text>
      <Text style={styles.label}>When do you want to reach this goal?</Text>

      <WheelDatePicker
        initialDate={internalDate || new Date(Date.now() + 24*60*60*1000)}
        minimumDate={new Date(Date.now() + 24*60*60*1000)}
        onDateChange={onDateChange}
      />
      
      <Text style={styles.helperText}>Scroll to select your target date</Text>
    </View>
  );

  const renderStep4 = () => {
    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount || '0');
    const remaining = target - current;
    const progress = (current / target) * 100;

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Review</Text>
        
        <View style={styles.reviewCard}>
          <View style={styles.reviewIconContainer}>
            <MaterialCommunityIcons
              name={selectedIcon as any}
              size={48}
              color={Colors.tintColor}
            />
          </View>
          
          <Text style={styles.reviewGoalName}>{name}</Text>
          
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Target Amount:</Text>
            <Text style={styles.reviewValue}>${target.toLocaleString()}</Text>
          </View>
          
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Current Amount:</Text>
            <Text style={styles.reviewValue}>${current.toLocaleString()}</Text>
          </View>
          
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Remaining:</Text>
            <Text style={styles.reviewValue}>${remaining.toLocaleString()}</Text>
          </View>

          {monthlyContribution && (
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Monthly Contribution:</Text>
              <Text style={styles.reviewValue}>${parseFloat(monthlyContribution).toLocaleString()}</Text>
            </View>
          )}
          
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Target Date:</Text>
            <Text style={styles.reviewValue}>{formatDisplayDate(targetDate)}</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress.toFixed(0)}% Complete</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {editingGoal ? 'Edit Goal' : 'Create New Goal'}
            </Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={Colors.white} />
            </Pressable>
          </View>

          {renderStepIndicator()}

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </ScrollView>

          <View style={styles.footer}>
            {step > 1 && (
              <Pressable style={styles.secondaryButton} onPress={handleBack}>
                <Text style={styles.secondaryButtonText}>Back</Text>
              </Pressable>
            )}
            
            {step < 4 ? (
              <Pressable
                style={[styles.primaryButton, step === 1 && { flex: 1 }]}
                onPress={handleNext}
              >
                <Text style={styles.primaryButtonText}>Next</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.primaryButton} onPress={handleSave}>
                <Text style={styles.primaryButtonText}>
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Parse and format DD-MM-YYYY safely to a Date for checks and display
function parseDDMMYYYY(input: string): Date | null {
  const m = input.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return null;
  const [_, dd, mm, yyyy] = m;
  const day = Number(dd);
  const month = Number(mm) - 1; // JS months 0-11
  const year = Number(yyyy);
  const d = new Date(year, month, day);
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null; // invalid date
  return d;
}

function formatDisplayDate(input: string): string {
  const d = parseDDMMYYYY(input) || new Date(input);
  if (isNaN(d as any)) return input;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.black,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
  },
  closeButton: {
    padding: 4,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.grey,
  },
  stepDotActive: {
    backgroundColor: Colors.tintColor,
    width: 32,
  },
  scrollContent: {
    flex: 1,
  },
  stepContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 24,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: Colors.grey,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconOptionSelected: {
    backgroundColor: Colors.tintColor,
    borderColor: Colors.tintColor,
    shadowColor: Colors.tintColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  iconLabel: {
    fontSize: 13,
    color: Colors.white,
    marginTop: 6,
    fontWeight: '500',
  },
  iconLabelSelected: {
    fontWeight: '700',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  colorSwatch: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: Colors.grey,
    borderRadius: 12,
    padding: 16,
    fontSize: 17,
    color: Colors.white,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  helperText: {
    fontSize: 13,
    color: Colors.white + 'AA',
    marginTop: 4,
  },
  reviewCard: {
    backgroundColor: Colors.grey,
    borderRadius: 16,
    padding: 20,
  },
  reviewIconContainer: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  reviewGoalName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 20,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewLabel: {
    fontSize: 14,
    color: Colors.white + 'CC',
  },
  reviewValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.black,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.tintColor,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.white + 'CC',
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.grey,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.tintColor,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.grey,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.grey,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    marginTop: 8,
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
