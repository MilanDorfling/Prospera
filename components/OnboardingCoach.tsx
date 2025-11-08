import Colors from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

const steps = [
  {
    title: 'Welcome to Prospera',
    body: 'We will walk you through the basics in a few quick steps.'
  },
  {
    title: 'Income',
    body: 'Tap Salary or Side Income to edit amounts. Investments opens a dedicated page.'
  },
  {
    title: 'Expenses',
    body: 'Long-press an expense card to edit it, or tap the dashed card to add a new one.'
  },
  {
    title: 'Overview',
    body: 'The chart and totals summarize your budget. Use the tabs to explore more.'
  }
];

export default function OnboardingCoach() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const seen = await AsyncStorage.getItem('onboardingSeen');
        if (!seen) setVisible(true);
      } catch {}
    })();
  }, []);

  const close = async () => {
    setVisible(false);
    await AsyncStorage.setItem('onboardingSeen', '1');
  };

  const next = async () => {
    if (index < steps.length - 1) setIndex((i) => i + 1);
    else await close();
  };

  if (!visible) return null;
  const step = steps[index];

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={close}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={{ backgroundColor: Colors.grey, padding: 18, borderRadius: 14, width: '100%', gap: 8 }}>
          <Text style={{ color: Colors.white, fontSize: 18, fontWeight: '700' }}>{step.title}</Text>
          <Text style={{ color: Colors.white, opacity: 0.9 }}>{step.body}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
            <Pressable onPress={close}>
              <Text style={{ color: '#bbb' }}>Skip</Text>
            </Pressable>
            <Pressable onPress={next}>
              <Text style={{ color: Colors.blue }}>{index < steps.length - 1 ? 'Next' : 'Got it'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
