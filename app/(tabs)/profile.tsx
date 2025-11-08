import { CURRENCIES, getCurrencySymbol } from '@/constants/currencies';
import { LANGUAGES, getLanguageNativeName } from '@/constants/languages';
import { useTheme } from '@/hooks/useTheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetAllAppData, updateProfile } from '@/store/slices/userSlice';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.user.profile);

  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [budgetInput, setBudgetInput] = useState(profile.monthlyBudget?.toString() || '');

  const triggerHaptic = () => {
    if (profile.hapticFeedbackEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePickImage = async () => {
    triggerHaptic();
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      dispatch(updateProfile({ profilePhoto: result.assets[0].uri }));
    }
  };

  const handleSaveName = () => {
    triggerHaptic();
    dispatch(updateProfile({ name: nameInput.trim() }));
    setEditingName(false);
  };

  const handleSaveBudget = () => {
    triggerHaptic();
    const budget = parseFloat(budgetInput);
    dispatch(updateProfile({ monthlyBudget: isNaN(budget) ? null : budget }));
    setEditingBudget(false);
  };

  const handleToggleTheme = () => {
    triggerHaptic();
    dispatch(updateProfile({ theme: profile.theme === 'dark' ? 'light' : 'dark' }));
  };

  const handleToggleNotifications = () => {
    triggerHaptic();
    dispatch(updateProfile({ notificationsEnabled: !profile.notificationsEnabled }));
  };

  const handleToggleHaptic = () => {
    if (profile.hapticFeedbackEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    dispatch(updateProfile({ hapticFeedbackEnabled: !profile.hapticFeedbackEnabled }));
  };

  const handleSelectCurrency = (code: string) => {
    triggerHaptic();
    dispatch(updateProfile({ currency: code }));
    setShowCurrencyPicker(false);
  };

  const handleSelectLanguage = (code: string) => {
    triggerHaptic();
    dispatch(updateProfile({ language: code }));
    setShowLanguagePicker(false);
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset App Data',
      'This will delete all your expenses, income, and savings goals. Your profile settings will be kept. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            triggerHaptic();
            try {
              await dispatch(resetAllAppData()).unwrap();
              Alert.alert('Success', 'App data has been reset. Please restart the app.');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset app data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getInitials = () => {
    if (!profile.name) return '?';
    const names = profile.name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
            <Text style={{ fontSize: 32, fontWeight: '700', color: theme.text }}>Profile</Text>
          </View>

          {/* Profile Photo Section */}
          <View style={{ marginHorizontal: 20, marginBottom: 24 }}>
            <TouchableOpacity onPress={handlePickImage} style={{ alignSelf: 'center', marginBottom: 20, position: 'relative' }}>
              {profile.profilePhoto ? (
                <Image source={{ uri: profile.profilePhoto }} style={{ width: 120, height: 120, borderRadius: 60 }} />
              ) : (
                <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: theme.surface, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 48, fontWeight: '700', color: theme.text }}>{getInitials()}</Text>
                </View>
              )}
              <View style={{ position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, borderRadius: 18, backgroundColor: theme.tint, justifyContent: 'center', alignItems: 'center' }}>
                <MaterialCommunityIcons name="camera" size={16} color={theme.white} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Name Section */}
          <View style={{ marginHorizontal: 20, marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textSecondary, marginBottom: 12, textTransform: 'uppercase' }}>Name</Text>
            {editingName ? (
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TextInput
                  style={{ flex: 1, backgroundColor: theme.surface, color: theme.text, padding: 16, borderRadius: 12, fontSize: 16 }}
                  value={nameInput}
                  onChangeText={setNameInput}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.textSecondary}
                  autoFocus
                />
                <TouchableOpacity onPress={handleSaveName} style={{ backgroundColor: theme.tint, paddingHorizontal: 24, justifyContent: 'center', borderRadius: 12 }}>
                  <Text style={{ color: theme.white, fontWeight: '600', fontSize: 16 }}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setEditingName(true)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.surface, padding: 16, borderRadius: 12 }}>
                <Text style={{ fontSize: 16, color: theme.text }}>{profile.name || 'Tap to set name'}</Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Currency Section */}
          <View style={{ marginHorizontal: 20, marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textSecondary, marginBottom: 12, textTransform: 'uppercase' }}>Currency</Text>
            <TouchableOpacity onPress={() => setShowCurrencyPicker(true)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.surface, padding: 16, borderRadius: 12 }}>
              <Text style={{ fontSize: 16, color: theme.text }}>
                {getCurrencySymbol(profile.currency)} - {profile.currency}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Monthly Budget Section */}
          <View style={{ marginHorizontal: 20, marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textSecondary, marginBottom: 12, textTransform: 'uppercase' }}>Monthly Budget Target</Text>
            {editingBudget ? (
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TextInput
                  style={{ flex: 1, backgroundColor: theme.surface, color: theme.text, padding: 16, borderRadius: 12, fontSize: 16 }}
                  value={budgetInput}
                  onChangeText={setBudgetInput}
                  placeholder="Enter budget amount"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  autoFocus
                />
                <TouchableOpacity onPress={handleSaveBudget} style={{ backgroundColor: theme.tint, paddingHorizontal: 24, justifyContent: 'center', borderRadius: 12 }}>
                  <Text style={{ color: theme.white, fontWeight: '600', fontSize: 16 }}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setEditingBudget(true)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.surface, padding: 16, borderRadius: 12 }}>
                <Text style={{ fontSize: 16, color: theme.text }}>
                  {profile.monthlyBudget
                    ? `${getCurrencySymbol(profile.currency)}${profile.monthlyBudget.toFixed(0)}`
                    : 'Not set'}
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Theme Section */}
          <View style={{ marginHorizontal: 20, marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textSecondary, marginBottom: 12, textTransform: 'uppercase' }}>Appearance</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.surface, padding: 16, borderRadius: 12 }}>
              <Text style={{ fontSize: 16, color: theme.text }}>Dark Mode</Text>
              <Switch
                value={profile.theme === 'dark'}
                onValueChange={handleToggleTheme}
                trackColor={{ false: '#767577', true: theme.tint }}
                thumbColor={theme.white}
              />
            </View>
          </View>

          {/* Notifications Section */}
          <View style={{ marginHorizontal: 20, marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textSecondary, marginBottom: 12, textTransform: 'uppercase' }}>Notifications</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.surface, padding: 16, borderRadius: 12 }}>
              <Text style={{ fontSize: 16, color: theme.text }}>Enable Notifications</Text>
              <Switch
                value={profile.notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: '#767577', true: theme.tint }}
                thumbColor={theme.white}
              />
            </View>
          </View>

          {/* Language Section */}
          <View style={{ marginHorizontal: 20, marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textSecondary, marginBottom: 12, textTransform: 'uppercase' }}>Language</Text>
            <TouchableOpacity onPress={() => setShowLanguagePicker(true)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.surface, padding: 16, borderRadius: 12 }}>
              <Text style={{ fontSize: 16, color: theme.text }}>{getLanguageNativeName(profile.language)}</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Haptic Feedback Section */}
          <View style={{ marginHorizontal: 20, marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textSecondary, marginBottom: 12, textTransform: 'uppercase' }}>Haptic Feedback</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.surface, padding: 16, borderRadius: 12 }}>
              <Text style={{ fontSize: 16, color: theme.text }}>Enable Haptic Feedback</Text>
              <Switch
                value={profile.hapticFeedbackEnabled}
                onValueChange={handleToggleHaptic}
                trackColor={{ false: '#767577', true: theme.tint }}
                thumbColor={theme.white}
              />
            </View>
          </View>

          {/* Reset Data Section */}
          <View style={{ marginHorizontal: 20, marginBottom: 24 }}>
            <TouchableOpacity onPress={handleResetData} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.surface, padding: 16, borderRadius: 12, gap: 12 }}>
              <MaterialCommunityIcons name="delete-forever" size={24} color={theme.red} />
              <Text style={{ color: theme.red, fontSize: 16, fontWeight: '600' }}>Reset App Data</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Currency Picker Modal */}
        <Modal visible={showCurrencyPicker} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: theme.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text }}>Select Currency</Text>
                <TouchableOpacity onPress={() => setShowCurrencyPicker(false)}>
                  <MaterialCommunityIcons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {CURRENCIES.map((currency) => (
                  <Pressable
                    key={currency.code}
                    onPress={() => handleSelectCurrency(currency.code)}
                    style={{
                      padding: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.border,
                      ...(profile.currency === currency.code && { backgroundColor: theme.card })
                    }}
                  >
                    <Text style={{ fontSize: 16, color: theme.text }}>
                      {currency.symbol} - {currency.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Language Picker Modal */}
        <Modal visible={showLanguagePicker} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: theme.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text }}>Select Language</Text>
                <TouchableOpacity onPress={() => setShowLanguagePicker(false)}>
                  <MaterialCommunityIcons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {LANGUAGES.map((language) => (
                  <Pressable
                    key={language.code}
                    onPress={() => handleSelectLanguage(language.code)}
                    style={{
                      padding: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.border,
                      ...(profile.language === language.code && { backgroundColor: theme.card })
                    }}
                  >
                    <Text style={{ fontSize: 16, color: theme.text }}>{language.nativeName}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
};

export default Profile;