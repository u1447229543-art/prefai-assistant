import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Gradients, Radius, Spacing, glow } from '../constants/colors';
import { Screen, Body, SectionTitle, EmptyState } from '../components/ui';
import { FeatureCard } from '../components/FeatureCard';
import { DocumentCard } from '../components/DocumentCard';
import { useApp } from '../context/AppContext';
import { useSubscription } from '../hooks/useSubscription';
import * as storage from '../services/storage';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user, t } = useApp();
  const { plan, remaining, isUnlimited, usage } = useSubscription();
  const [recent, setRecent] = useState<storage.StoredDocument[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      storage.loadDocuments().then((d) => active && setRecent(d.slice(0, 4)));
      return () => {
        active = false;
      };
    }, [])
  );

  const features = [
    {
      title: t('featExplain'),
      description: t('featExplainDesc'),
      icon: 'document-text-outline' as const,
      accent: Colors.blue,
      route: 'DocumentExplain' as const,
    },
    {
      title: t('featTranslate'),
      description: t('featTranslateDesc'),
      icon: 'language-outline' as const,
      accent: Colors.red,
      route: 'Translation' as const,
    },
    {
      title: t('featReply'),
      description: t('featReplyDesc'),
      icon: 'create-outline' as const,
      accent: '#2EE6A6',
      route: 'AIReply' as const,
    },
    {
      title: t('featForm'),
      description: t('featFormDesc'),
      icon: 'list-outline' as const,
      accent: '#7B61FF',
      route: 'FormAssist' as const,
    },
  ];

  const secondary = [
    { title: t('featDeadlines'), icon: 'alarm-outline' as const, accent: Colors.warning, route: 'DeadlineTracker' as const },
    { title: t('featPdf'), icon: 'document-attach-outline' as const, accent: Colors.blue, route: 'PDFGenerator' as const },
    { title: t('featGuides'), icon: 'book-outline' as const, accent: Colors.red, route: 'Guides' as const },
  ];

  return (
    <Screen>
      <Body>
        {/* Greeting header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>
              {t('greeting')}, {user?.name ?? 'friend'} 👋
            </Text>
            <Text style={styles.subtitle}>{t('homeSubtitle')}</Text>
          </View>
        </View>

        {/* Usage / plan banner */}
        <Pressable onPress={() => navigation.navigate('Subscription')}>
          <LinearGradient
            colors={Gradients.blueRed}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.banner, glow(Colors.blue, 10)]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerPlan}>{plan.name} plan</Text>
              <Text style={styles.bannerUsage}>
                {isUnlimited
                  ? 'Unlimited documents'
                  : `${remaining} of ${plan.documentLimit} ${t('documentsThisMonth')}`}
              </Text>
            </View>
            {plan.id !== 'pro' ? (
              <View style={styles.upgradePill}>
                <Text style={styles.upgradeText}>{t('upgrade')}</Text>
                <Ionicons name="arrow-forward" size={14} color="#04121A" />
              </View>
            ) : (
              <Ionicons name="star" size={22} color="#04121A" />
            )}
          </LinearGradient>
        </Pressable>

        {/* Main features */}
        <SectionTitle>{t('features')}</SectionTitle>
        <View style={styles.grid}>
          {features.map((f) => (
            <View key={f.route} style={styles.gridItem}>
              <FeatureCard
                title={f.title}
                description={f.description}
                icon={f.icon}
                accent={f.accent}
                onPress={() => navigation.navigate(f.route)}
              />
            </View>
          ))}
        </View>

        {/* Secondary quick actions */}
        <SectionTitle>{t('quickActions')}</SectionTitle>
        <View style={styles.quickRow}>
          {secondary.map((s) => (
            <Pressable
              key={s.route}
              style={styles.quick}
              onPress={() => navigation.navigate(s.route)}
            >
              <View style={[styles.quickIcon, { borderColor: s.accent }]}>
                <Ionicons name={s.icon} size={20} color={s.accent} />
              </View>
              <Text style={styles.quickText} numberOfLines={2}>
                {s.title}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Recent documents */}
        <SectionTitle
          right={
            recent.length > 0 ? (
              <Pressable onPress={() => navigation.navigate('Main', { screen: 'DocumentVault' })}>
                <Text style={styles.viewAll}>{t('viewAll')}</Text>
              </Pressable>
            ) : undefined
          }
        >
          {t('recentDocuments')}
        </SectionTitle>

        {recent.length === 0 ? (
          <EmptyState
            icon="cloud-upload-outline"
            title={t('noDocuments')}
            subtitle={t('featExplainDesc')}
          />
        ) : (
          recent.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onPress={() => navigation.navigate('DocumentExplain')}
            />
          ))
        )}
      </Body>
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  greeting: { color: Colors.white, fontSize: FontSize.xxl, fontWeight: '800' },
  subtitle: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 4 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  bannerPlan: { color: '#04121A', fontSize: FontSize.md, fontWeight: '800' },
  bannerUsage: { color: '#04121A', fontSize: FontSize.xs, marginTop: 2, opacity: 0.85 },
  upgradePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  upgradeText: { color: '#04121A', fontWeight: '800', fontSize: FontSize.xs, marginRight: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -Spacing.xs },
  gridItem: { width: '50%', paddingHorizontal: Spacing.xs, marginBottom: Spacing.sm },
  quickRow: { flexDirection: 'row', gap: Spacing.sm as unknown as number },
  quick: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    alignItems: 'center',
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    borderWidth: 1,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  quickText: { color: Colors.textPrimary, fontSize: FontSize.xs, fontWeight: '600', textAlign: 'center' },
  viewAll: { color: Colors.blue, fontSize: FontSize.sm, fontWeight: '600' },
});
