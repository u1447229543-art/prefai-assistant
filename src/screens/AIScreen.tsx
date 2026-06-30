import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';
import { Screen, Body } from '../components/ui';
import { FeatureCard } from '../components/FeatureCard';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import type { TranslationKey } from '../i18n/translations';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TOOL_DEFS: {
  titleKey: TranslationKey;
  descKey: TranslationKey;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  route: keyof RootStackParamList;
}[] = [
  {
    titleKey: 'eligibilityChecker',
    descKey: 'eligibilityCheckerDesc',
    icon: 'shield-checkmark-outline',
    accent: '#2EE6A6',
    route: 'Eligibility',
  },
  {
    titleKey: 'featExplain',
    descKey: 'featExplainDesc',
    icon: 'document-text-outline',
    accent: Colors.blue,
    route: 'DocumentExplain',
  },
  {
    titleKey: 'featTranslate',
    descKey: 'featTranslateDesc',
    icon: 'language-outline',
    accent: Colors.red,
    route: 'Translation',
  },
  {
    titleKey: 'replyTitle',
    descKey: 'featReplyDesc',
    icon: 'create-outline',
    accent: '#2EE6A6',
    route: 'AIReply',
  },
  {
    titleKey: 'featForm',
    descKey: 'featFormDesc',
    icon: 'list-outline',
    accent: '#7B61FF',
    route: 'FormAssist',
  },
  {
    titleKey: 'pdfTitle',
    descKey: 'featPdfDesc',
    icon: 'document-attach-outline',
    accent: Colors.warning,
    route: 'PDFGenerator',
  },
];

export const AIScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { t } = useApp();

  const tools = useMemo(
    () =>
      TOOL_DEFS.map((tool) => ({
        ...tool,
        title: t(tool.titleKey),
        description: t(tool.descKey),
      })),
    [t]
  );

  return (
    <Screen>
      <Body>
        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <Ionicons name="sparkles" size={20} color={Colors.blue} />
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <Text style={styles.title}>{t('aiToolsTitle')}</Text>
            <Text style={styles.subtitle}>{t('aiToolsSubtitle')}</Text>
          </View>
        </View>

        <View style={{ gap: Spacing.sm as unknown as number }}>
          {tools.map((tool) => (
            <FeatureCard
              key={tool.route}
              wide
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              accent={tool.accent}
              onPress={() => navigation.navigate(tool.route as never)}
            />
          ))}
        </View>
      </Body>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.glassBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: Colors.white, fontSize: FontSize.xxl, fontWeight: '800' },
  subtitle: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 2 },
});
