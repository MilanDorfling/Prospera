import Colors from '@/constants/Colors';
import { useCurrency } from '@/hooks/useCurrency';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type InterestType = 'simple' | 'compound';
type CompoundFrequency = 'Annually' | 'Semi-Annually' | 'Quarterly' | 'Monthly' | 'Daily';

const compoundsPerYear: Record<CompoundFrequency, number> = {
  'Annually': 1,
  'Semi-Annually': 2,
  'Quarterly': 4,
  'Monthly': 12,
  'Daily': 365,
};

export default function InterestCalculatorTab() {
  const { formatCurrency } = useCurrency();
  const [principal, setPrincipal] = useState('10000');
  const [rate, setRate] = useState('4.5');
  const [timeValue, setTimeValue] = useState('5');
  const [timeUnit, setTimeUnit] = useState<'years' | 'months'>('years');
  const [interestType, setInterestType] = useState<InterestType>('compound');
  const [frequency, setFrequency] = useState<CompoundFrequency>('Monthly');

  const sanitizeNumber = (text: string) => text.replace(/[^0-9.]/g, '');

  const results = useMemo(() => {
    const P = parseFloat(principal) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const timeInYears = timeUnit === 'years' ? parseFloat(timeValue) || 0 : (parseFloat(timeValue) || 0) / 12;

    if (P <= 0 || r <= 0 || timeInYears <= 0) {
      return null;
    }

    // Simple Interest
    const simpleInterest = P * r * timeInYears;
    const totalSimple = P + simpleInterest;

    // Compound Interest
    const n = compoundsPerYear[frequency];
    const totalCompound = P * Math.pow((1 + r / n), n * timeInYears);
    const compoundInterest = totalCompound - P;

    const selected = interestType === 'simple' ? totalSimple : totalCompound;
    const selectedInterest = interestType === 'simple' ? simpleInterest : compoundInterest;
    const difference = totalCompound - totalSimple;

    return {
      finalBalance: selected,
      interestEarned: selectedInterest,
      simpleTotal: totalSimple,
      compoundTotal: totalCompound,
      difference,
    };
  }, [principal, rate, timeValue, timeUnit, interestType, frequency]);

  return (
    <ScrollView style={{ paddingHorizontal: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      {/* Input Form */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Input Details</Text>

        {/* Principal */}
        <Text style={styles.label}>Principal Amount ($)</Text>
        <TextInput
          style={styles.input}
          value={principal}
          onChangeText={(t) => setPrincipal(sanitizeNumber(t))}
          keyboardType="numeric"
          placeholder="10000"
          placeholderTextColor="#555"
        />
        <Text style={styles.helper}>How much are you starting with?</Text>

        {/* Interest Rate */}
        <Text style={[styles.label, { marginTop: 16 }]}>Annual Interest Rate (%)</Text>
        <TextInput
          style={styles.input}
          value={rate}
          onChangeText={(t) => setRate(sanitizeNumber(t))}
          keyboardType="numeric"
          placeholder="4.5"
          placeholderTextColor="#555"
        />
        <Text style={styles.helper}>What's your account's APY/interest rate?</Text>

        {/* Time Period */}
        <Text style={[styles.label, { marginTop: 16 }]}>Time Period</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={timeValue}
            onChangeText={(t) => setTimeValue(sanitizeNumber(t))}
            keyboardType="numeric"
            placeholder="5"
            placeholderTextColor="#555"
          />
          <View style={{ flexDirection: 'row', backgroundColor: Colors.black, borderRadius: 8, padding: 2 }}>
            <Pressable
              style={[styles.unitButton, timeUnit === 'years' && styles.unitButtonActive]}
              onPress={() => setTimeUnit('years')}
            >
              <Text style={[styles.unitText, timeUnit === 'years' && styles.unitTextActive]}>Years</Text>
            </Pressable>
            <Pressable
              style={[styles.unitButton, timeUnit === 'months' && styles.unitButtonActive]}
              onPress={() => setTimeUnit('months')}
            >
              <Text style={[styles.unitText, timeUnit === 'months' && styles.unitTextActive]}>Months</Text>
            </Pressable>
          </View>
        </View>
        <Text style={styles.helper}>How long will you save?</Text>

        {/* Interest Type */}
        <Text style={[styles.label, { marginTop: 16 }]}>Interest Type</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            style={[styles.typeButton, interestType === 'simple' && styles.typeButtonActive]}
            onPress={() => setInterestType('simple')}
          >
            <Text style={[styles.typeText, interestType === 'simple' && styles.typeTextActive]}>Simple</Text>
          </Pressable>
          <Pressable
            style={[styles.typeButton, interestType === 'compound' && styles.typeButtonActive]}
            onPress={() => setInterestType('compound')}
          >
            <Text style={[styles.typeText, interestType === 'compound' && styles.typeTextActive]}>Compound</Text>
          </Pressable>
        </View>

        {/* Compound Frequency */}
        {interestType === 'compound' && (
          <>
            <Text style={[styles.label, { marginTop: 16 }]}>Compound Frequency</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {(Object.keys(compoundsPerYear) as CompoundFrequency[]).map((freq) => (
                <Pressable
                  key={freq}
                  style={[styles.freqButton, frequency === freq && styles.freqButtonActive]}
                  onPress={() => setFrequency(freq)}
                >
                  <Text style={[styles.freqText, frequency === freq && styles.freqTextActive]}>{freq}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.helper}>How often does interest compound?</Text>
          </>
        )}
      </View>

      {/* Results */}
      {results && (
        <>
          {/* Final Balance */}
          <View style={[styles.card, { backgroundColor: '#22C55E22', marginTop: 16 }]}>
            <Text style={styles.resultLabel}>Final Balance</Text>
            <Text style={styles.resultValue}>{formatCurrency(results.finalBalance)}</Text>
            <Text style={styles.resultMeta}>
              After {timeValue} {timeUnit} at {rate}% {interestType} interest
            </Text>
          </View>

          {/* Interest Earned */}
          <View style={[styles.card, { marginTop: 12 }]}>
            <Text style={styles.resultLabel}>Interest Earned</Text>
            <Text style={[styles.resultValue, { color: '#22C55E', fontSize: 28 }]}>
              +{formatCurrency(results.interestEarned)}
            </Text>
            <Text style={styles.resultMeta}>Total interest gained</Text>
          </View>

          {/* Comparison */}
          {interestType === 'compound' && results.difference > 0 && (
            <View style={[styles.card, { marginTop: 12 }]}>
              <Text style={styles.resultLabel}>vs Simple Interest</Text>
              <Text style={styles.resultMeta}>Simple would give: {formatCurrency(results.simpleTotal)}</Text>
              <Text style={[styles.resultValue, { fontSize: 20, color: Colors.tintColor, marginTop: 4 }]}>
                You earn {formatCurrency(results.difference)} more with compound!
              </Text>
            </View>
          )}
        </>
      )}

      {!results && (
        <View style={[styles.card, { marginTop: 16, alignItems: 'center', paddingVertical: 32 }]}>
          <Text style={{ color: '#aaa' }}>Enter values above to see results</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.grey,
    borderRadius: 14,
    padding: 16,
  },
  cardTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  label: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.black,
    color: Colors.white,
    padding: 12,
    borderRadius: 8,
    fontSize: 18,
  },
  helper: {
    color: '#bbb',
    fontSize: 12,
    marginTop: 4,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  unitButtonActive: {
    backgroundColor: Colors.tintColor,
  },
  unitText: {
    color: '#aaa',
    fontSize: 14,
  },
  unitTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.black,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: Colors.tintColor,
  },
  typeText: {
    color: '#aaa',
    fontSize: 15,
  },
  typeTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  freqButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.black,
  },
  freqButtonActive: {
    backgroundColor: Colors.tintColor,
  },
  freqText: {
    color: '#aaa',
    fontSize: 13,
  },
  freqTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  resultLabel: {
    color: '#bbb',
    fontSize: 13,
    marginBottom: 4,
  },
  resultValue: {
    color: Colors.white,
    fontSize: 34,
    fontWeight: '800',
  },
  resultMeta: {
    color: '#bbb',
    fontSize: 13,
    marginTop: 4,
  },
});
