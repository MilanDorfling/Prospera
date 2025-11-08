import Colors from '@/constants/Colors';
import { SavingsGoal } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

interface UpdateProgressModalProps {
  visible: boolean;
  onClose: () => void;
  onUpdate: (amount: number) => void;
  goal: SavingsGoal | null;
}

export default function UpdateProgressModal({
  visible,
  onClose,
  onUpdate,
  goal,
}: UpdateProgressModalProps) {
  const [amount, setAmount] = useState('');

  const handleUpdate = () => {
    const newAmount = parseFloat(amount);
    
    if (!amount || isNaN(newAmount) || newAmount < 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    onUpdate(newAmount);
    setAmount('');
    onClose();
  };

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  if (!goal) return null;

  const remaining = goal.targetAmount - goal.currentAmount;
  const progress = (goal.currentAmount / goal.targetAmount) * 100;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <MaterialCommunityIcons
              name={goal.icon as any}
              size={32}
              color={Colors.tintColor}
            />
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={Colors.white} />
            </Pressable>
          </View>

          <Text style={styles.title}>Update Progress</Text>
          <Text style={styles.goalName}>{goal.name}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Current</Text>
              <Text style={styles.statValue}>${goal.currentAmount.toLocaleString()}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Target</Text>
              <Text style={styles.statValue}>${goal.targetAmount.toLocaleString()}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Remaining</Text>
              <Text style={styles.statValue}>${remaining.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress.toFixed(0)}% Complete</Text>

          <Text style={styles.label}>Add Amount ($)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={Colors.grey + '80'}
            keyboardType="decimal-pad"
            autoFocus
          />
          <Text style={styles.helperText}>
            Enter the amount you want to add to your current savings
          </Text>

          <View style={styles.footer}>
            <Pressable style={styles.secondaryButton} onPress={handleClose}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={handleUpdate}>
              <Text style={styles.primaryButtonText}>Update</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.black,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.grey,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  goalName: {
    fontSize: 16,
    color: Colors.white + 'CC',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.grey,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.white + '20',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.white + '80',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.grey,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
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
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.grey,
    borderRadius: 12,
    padding: 16,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    borderWidth: 2,
    borderColor: Colors.tintColor,
    textAlign: 'center',
  },
  helperText: {
    fontSize: 12,
    color: Colors.grey + 'CC',
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
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
});
