import Colors from '@/constants/Colors';
import { useCurrency } from '@/hooks/useCurrency';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addGoal, fetchAllGoals, removeGoal, updateGoal, updateGoalProgress } from '@/store/slices/savingsSlice';
import type { RootState } from '@/store/store';
import { SavingsGoal } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import GoalModal from './GoalModal';
import UpdateProgressModal from './UpdateProgressModal';

export default function SavingsGoalsTab() {
  const dispatch = useAppDispatch();
  const goals = useAppSelector((s: RootState) => s.savings.goals);
  const activeGoals = goals.filter(g => !g.completedAt);
  const completedGoals = goals.filter(g => g.completedAt);
  const { formatShort } = useCurrency();

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  // Fetch existing goals on mount to ensure persistence after app reloads
  useEffect(() => {
    dispatch(fetchAllGoals());
  }, [dispatch]);

  const handleCreateGoal = (goalData: Omit<SavingsGoal, '_id' | 'userToken' | 'createdAt' | 'updatedAt' | 'completedAt'>) => {
    dispatch(addGoal(goalData));
  };

  const handleEditGoal = (goalData: Omit<SavingsGoal, '_id' | 'userToken' | 'createdAt' | 'updatedAt' | 'completedAt'>) => {
    if (editingGoal?._id) {
      dispatch(updateGoal({ id: editingGoal._id, update: goalData }));
    }
    setEditingGoal(null);
  };

  const handleUpdateProgress = (amount: number) => {
    if (selectedGoal?._id) {
      const newAmount = selectedGoal.currentAmount + amount;
      dispatch(updateGoalProgress({ id: selectedGoal._id, currentAmount: newAmount }));
    }
    setSelectedGoal(null);
  };

  const handleCompleteGoal = (goalId: string) => {
    Alert.alert(
      'Complete Goal',
      'Mark this goal as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          style: 'default',
          onPress: () => {
            const goal = goals.find(g => g._id === goalId);
            if (goal) {
              dispatch(updateGoalProgress({ id: goalId, currentAmount: goal.targetAmount }));
            }
          },
        },
      ]
    );
  };

  const handleDeleteGoal = (goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(removeGoal(goalId)),
        },
      ]
    );
  };

  const openEditModal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setShowGoalModal(true);
  };

  const openProgressModal = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setShowProgressModal(true);
  };

  // Show empty state ONLY when there are no goals at all
  if (goals.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="target" size={64} color="#555" />
        <Text style={styles.emptyTitle}>No Savings Goals Yet</Text>
        <Text style={styles.emptyText}>Start building your future. Create your first savings goal!</Text>
        <Pressable style={styles.addButton} onPress={() => setShowGoalModal(true)}>
          <MaterialCommunityIcons name="plus" size={20} color={Colors.white} />
          <Text style={styles.addButtonText}>Create Goal</Text>
        </Pressable>
        <GoalModal
          visible={showGoalModal}
          onClose={() => { setShowGoalModal(false); setEditingGoal(null); }}
          onSave={editingGoal ? handleEditGoal : handleCreateGoal}
          editingGoal={editingGoal}
        />
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 100 }}>
      {/* Add Goal Button */}
      <Pressable style={[styles.addButton, { marginBottom: 16 }]} onPress={() => setShowGoalModal(true)}>
        <MaterialCommunityIcons name="plus" size={20} color={Colors.white} />
        <Text style={styles.addButtonText}>Add Goal</Text>
      </Pressable>

      {/* Active Goals */}
      <Text style={styles.sectionTitle}>Active Goals ({activeGoals.length})</Text>
      <FlatList
        data={activeGoals}
        scrollEnabled={false}
        keyExtractor={(item) => (item._id || item.id)!}
        renderItem={({ item }) => (
          <GoalCard
            goal={item}
            onEdit={openEditModal}
            onUpdateProgress={openProgressModal}
            onComplete={handleCompleteGoal}
            onDelete={handleDeleteGoal}
          />
        )}
        contentContainerStyle={{ gap: 12 }}
      />

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Completed ({completedGoals.length})</Text>
          <FlatList
            data={completedGoals}
            scrollEnabled={false}
            keyExtractor={(item) => (item._id || item.id)!}
            renderItem={({ item }) => (
              <GoalCard
                goal={item}
                completed
                onEdit={openEditModal}
                onUpdateProgress={openProgressModal}
                onComplete={handleCompleteGoal}
                onDelete={handleDeleteGoal}
              />
            )}
            contentContainerStyle={{ gap: 12 }}
          />
        </>
      )}

      <GoalModal
        visible={showGoalModal}
        onClose={() => {
          setShowGoalModal(false);
          setEditingGoal(null);
        }}
        onSave={editingGoal ? handleEditGoal : handleCreateGoal}
        editingGoal={editingGoal}
      />

      <UpdateProgressModal
        visible={showProgressModal}
        onClose={() => {
          setShowProgressModal(false);
          setSelectedGoal(null);
        }}
        onUpdate={handleUpdateProgress}
        goal={selectedGoal}
      />
    </View>
  );
}

interface GoalCardProps {
  goal: SavingsGoal;
  completed?: boolean;
  onEdit: (goal: SavingsGoal) => void;
  onUpdateProgress: (goal: SavingsGoal) => void;
  onComplete: (goalId: string) => void;
  onDelete: (goalId: string) => void;
}

function GoalCard({ goal, completed, onEdit, onUpdateProgress, onComplete, onDelete }: GoalCardProps) {
  const { formatShort } = useCurrency();
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const progressClamped = Math.min(100, Math.max(0, progress));

  const iconName = goal.icon || 'piggy-bank';
  // Normalize color to 6-character hex (remove alpha channel if present)
  const normalizeColor = (color: string) => {
    if (!color) return Colors.tintColor;
    // If color is 9 chars (#rrggbbaa), trim to 7 (#rrggbb)
    if (color.length === 9) return color.substring(0, 7);
    return color;
  };
  const userColor = normalizeColor(goal.color || Colors.tintColor);
  // Icon color should always be bright/visible (white for custom colors, or green for completed)
  const iconColor = completed ? '#22C55E' : Colors.white;
  
  console.log('[GoalCard] Rendering goal:', { name: goal.name, color: goal.color, userColor, iconColor });

  const targetDate = new Date(goal.targetDate);
  const now = new Date();
  const msRemaining = targetDate.getTime() - now.getTime();
  const monthsRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24 * 30)));
  const amountRemaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const monthlyNeeded = monthsRemaining > 0 ? amountRemaining / monthsRemaining : 0;

  let statusColor = '#22C55E'; // On Track
  let statusText = 'On Track';
  if (!completed && monthlyNeeded > 0) {
    const contribution = goal.monthlyContribution || 0;
    if (contribution < monthlyNeeded * 0.75) {
      statusColor = '#EF4444';
      statusText = 'Off Track';
    } else if (contribution < monthlyNeeded * 0.95) {
      statusColor = '#F59E0B';
      statusText = 'Behind';
    }
  }

  return (
    <View style={styles.goalCard}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: Colors.black }]}>
          <MaterialCommunityIcons name={iconName as any} size={24} color={completed ? '#22C55E' : userColor} />
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text style={styles.goalName}>{goal.name}</Text>
            {!completed && (
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor}33`, borderColor: statusColor }]}>
                <Text style={{ color: statusColor, fontSize: 11, fontWeight: '600' }}>{statusText}</Text>
              </View>
            )}
          </View>

          <Text style={styles.goalAmount}>
            {formatShort(goal.currentAmount)} / {formatShort(goal.targetAmount)}
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressOuter}>
            <View style={[styles.progressInner, { width: `${progressClamped}%`, backgroundColor: completed ? '#22C55E' : userColor }]} />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={styles.goalMeta}>{progressClamped.toFixed(0)}% complete</Text>
            {!completed && (
              <Text style={styles.goalMeta}>
                {monthsRemaining > 0 ? `${monthsRemaining} months left` : 'Overdue'}
              </Text>
            )}
          </View>

          {!completed && monthlyNeeded > 0 && (
            <Text style={styles.goalMeta}>Save {formatShort(monthlyNeeded)}/month to reach goal</Text>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Pressable style={styles.actionButton} onPress={() => onEdit(goal)}>
          <Text style={styles.actionText}>Edit</Text>
        </Pressable>
        {!completed ? (
          <>
            <Pressable style={styles.actionButton} onPress={() => onUpdateProgress(goal)}>
              <Text style={styles.actionText}>Update Progress</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={() => onComplete(goal._id!)}>
              <Text style={[styles.actionText, { color: '#22C55E' }]}>Complete</Text>
            </Pressable>
          </>
        ) : (
          <Pressable style={styles.actionButton} onPress={() => onDelete(goal._id!)}>
            <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },
  emptyText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.tintColor,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    alignSelf: 'stretch',
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  goalCard: {
    backgroundColor: Colors.grey,
    borderRadius: 14,
    padding: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalName: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  goalAmount: {
    color: Colors.white,
    fontSize: 14,
    marginTop: 4,
  },
  goalMeta: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  progressOuter: {
    height: 8,
    backgroundColor: Colors.black,
    borderRadius: 999,
    marginTop: 10,
  },
  progressInner: {
    height: 8,
    borderRadius: 999,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: Colors.black,
    borderRadius: 8,
  },
  actionText: {
    color: Colors.tintColor,
    fontSize: 13,
    fontWeight: '600',
  },
});
