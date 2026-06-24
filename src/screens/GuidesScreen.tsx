import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';
import { Screen, Body, Header } from '../components/ui';
import { GuideCard } from '../components/GuideCard';
import { GUIDES, Guide } from '../constants/guides';
import { useApp } from '../context/AppContext';

export const GuidesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useApp();
  const [active, setActive] = useState<Guide | null>(null);

  return (
    <Screen>
      <Header title={t('guidesTitle')} onBack={() => navigation.goBack()} />
      <Body>
        <Text style={styles.intro}>
          Step-by-step help for the main French administrations. Tap a guide to open it.
        </Text>
        {GUIDES.map((g) => (
          <GuideCard
            key={g.id}
            title={g.title}
            subtitle={g.subtitle}
            icon={g.icon}
            accent={g.accent}
            steps={g.steps.length}
            onPress={() => setActive(g)}
          />
        ))}
      </Body>

      <Modal visible={!!active} animationType="slide" onRequestClose={() => setActive(null)}>
        {active ? (
          <Screen edges={['top', 'bottom', 'left', 'right']}>
            <Header
              title={active.title}
              onBack={() => setActive(null)}
            />
            <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xxl }}>
              <LinearGradient
                colors={[`${active.accent}26`, 'transparent']}
                style={styles.detailHero}
              >
                <View style={[styles.heroIcon, { borderColor: active.accent }]}>
                  <Ionicons name={active.icon} size={32} color={active.accent} />
                </View>
                <Text style={styles.heroSubtitle}>{active.subtitle}</Text>
              </LinearGradient>

              {active.steps.map((s, i) => (
                <View key={i} style={styles.step}>
                  <View style={styles.stepLeft}>
                    <View style={[styles.stepNum, { borderColor: active.accent }]}>
                      <Text style={[styles.stepNumText, { color: active.accent }]}>{i + 1}</Text>
                    </View>
                    {i < active.steps.length - 1 ? (
                      <View style={[styles.stepLine, { backgroundColor: Colors.border }]} />
                    ) : null}
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{s.title}</Text>
                    <Text style={styles.stepBody}>{s.body}</Text>
                  </View>
                </View>
              ))}

              <View style={styles.disclaimerBox}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
                <Text style={styles.disclaimerText}>{t('disclaimer')}</Text>
              </View>
            </ScrollView>
          </Screen>
        ) : (
          <View />
        )}
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  intro: { color: Colors.textSecondary, fontSize: FontSize.sm, marginBottom: Spacing.md, lineHeight: 20 },
  detailHero: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  heroSubtitle: { color: Colors.textPrimary, fontSize: FontSize.md, textAlign: 'center' },
  step: { flexDirection: 'row' },
  stepLeft: { alignItems: 'center', width: 36 },
  stepNum: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { fontSize: FontSize.sm, fontWeight: '800' },
  stepLine: { width: 2, flex: 1, marginVertical: 4 },
  stepContent: { flex: 1, paddingBottom: Spacing.lg, marginLeft: Spacing.md },
  stepTitle: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700', marginBottom: 4 },
  stepBody: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 21 },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  disclaimerText: { color: Colors.textMuted, fontSize: FontSize.xs, marginLeft: 8, flex: 1, lineHeight: 17 },
});
