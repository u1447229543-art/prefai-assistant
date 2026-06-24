import React, { useRef, useState } from 'react';
import {
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing, glow } from '../constants/colors';
import { MAX_CONTENT_WIDTH, SCREEN_WIDTH } from '../constants/responsive';
import { Screen, NeonButton } from '../components/ui';
import { useApp } from '../context/AppContext';

interface Slide {
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    icon: 'language-outline',
    accent: Colors.blue,
    title: 'Understand any French letter',
    body: 'Upload a document from CAF, CPAM, Préfecture or Impôts and get a clear explanation in your language.',
  },
  {
    icon: 'create-outline',
    accent: Colors.red,
    title: 'Reply & fill forms with confidence',
    body: 'Generate official French responses, understand every form field, and never miss a deadline again.',
  },
  {
    icon: 'shield-checkmark-outline',
    accent: '#2EE6A6',
    title: 'Your documents, organized & safe',
    body: 'Store passport, visa and contracts securely on your device. PrefAI helps you — it never replaces official services.',
  },
];

export const OnboardingScreen: React.FC = () => {
  const { completeOnboarding } = useApp();
  const [index, setIndex] = useState(0);
  // The list viewport is constrained to MAX_CONTENT_WIDTH on web, so the slide
  // width must match the actual rendered list width — not the full window width.
  const [width, setWidth] = useState(Math.min(SCREEN_WIDTH, MAX_CONTENT_WIDTH));
  const listRef = useRef<FlatList<Slide>>(null);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - width) > 1) setWidth(w);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index && i >= 0 && i < SLIDES.length) setIndex(i);
  };

  const goTo = (i: number) => {
    setIndex(i);
    listRef.current?.scrollToOffset({ offset: i * width, animated: true });
  };

  const next = () => {
    if (index < SLIDES.length - 1) {
      goTo(index + 1);
    } else {
      completeOnboarding();
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.top}>
        <Pressable onPress={completeOnboarding} hitSlop={10}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onLayout={onLayout}
        scrollEventThrottle={16}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconWrap, { borderColor: item.accent }, glow(item.accent, 20)]}>
              <LinearGradient
                colors={[`${item.accent}33`, 'transparent']}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name={item.icon} size={56} color={item.accent} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <NeonButton
          title={index === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={next}
          variant={index === SLIDES.length - 1 ? 'blueRed' : 'blue'}
          icon={index === SLIDES.length - 1 ? 'rocket-outline' : undefined}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  top: { alignItems: 'flex-end', paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  skip: { color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: '600' },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  iconWrap: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  title: {
    color: Colors.white,
    fontSize: FontSize.xxl,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  body: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: Spacing.lg },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  dotActive: { width: 22, backgroundColor: Colors.blue },
});
