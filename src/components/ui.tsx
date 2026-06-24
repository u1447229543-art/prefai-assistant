import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Gradients, Radius, Spacing, glow } from '../constants/colors';
import { MAX_CONTENT_WIDTH, SCREEN_HEIGHT } from '../constants/responsive';

/** Full-screen dark container with safe area. Centers to a phone width on web/tablets. */
export const Screen: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}> = ({ children, style, edges = ['top', 'left', 'right'] }) => (
  <SafeAreaView style={[styles.screen, styles.screenFrame, style]} edges={edges}>
    {children}
  </SafeAreaView>
);

/** Scrollable body with sensible padding. */
export const Body: React.FC<ScrollViewProps & { children: React.ReactNode }> = ({
  children,
  contentContainerStyle,
  ...rest
}) => (
  <ScrollView
    style={styles.body}
    contentContainerStyle={[styles.bodyContent, contentContainerStyle]}
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
    {...rest}
  >
    {children}
  </ScrollView>
);

/** Screen header with optional back button and right slot. */
export const Header: React.FC<{
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}> = ({ title, subtitle, onBack, right }) => (
  <View style={styles.header}>
    {onBack ? (
      <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={24} color={Colors.white} />
      </Pressable>
    ) : (
      <View style={styles.backBtn} />
    )}
    <View style={styles.headerTitleWrap}>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
    </View>
    <View style={styles.headerRight}>{right}</View>
  </View>
);

/** Card surface. */
export const Card: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}> = ({ children, style, onPress }) => {
  const content = <View style={[styles.card, style]}>{children}</View>;
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => (pressed ? { opacity: 0.85 } : null)}>
        {content}
      </Pressable>
    );
  }
  return content;
};

export const SectionTitle: React.FC<{ children: React.ReactNode; right?: React.ReactNode }> = ({
  children,
  right,
}) => (
  <View style={styles.sectionTitleRow}>
    <Text style={styles.sectionTitle}>{children}</Text>
    {right}
  </View>
);

type ButtonVariant = 'blue' | 'red' | 'blueRed' | 'ghost';

/** Primary neon gradient button. */
export const NeonButton: React.FC<{
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  textStyle?: TextStyle;
}> = ({ title, onPress, variant = 'blue', loading, disabled, icon, style, textStyle }) => {
  const isGhost = variant === 'ghost';
  const gradient =
    variant === 'red'
      ? Gradients.red
      : variant === 'blueRed'
        ? Gradients.blueRed
        : Gradients.blue;

  const inner = (
    <View style={styles.btnInner}>
      {loading ? (
        <ActivityIndicator color={isGhost ? Colors.blue : '#04121A'} />
      ) : (
        <>
          {icon ? (
            <Ionicons
              name={icon}
              size={18}
              color={isGhost ? Colors.blue : '#04121A'}
              style={{ marginRight: 8 }}
            />
          ) : null}
          <Text
            style={[
              styles.btnText,
              isGhost && { color: Colors.blue },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </View>
  );

  if (isGhost) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.btn, styles.ghostBtn, (disabled || loading) && styles.btnDisabled, style]}
      >
        {inner}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[(disabled || loading) && styles.btnDisabled, style]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.btn, glow(gradient[0], 10)]}
      >
        {inner}
      </LinearGradient>
    </Pressable>
  );
};

/** Empty / placeholder state. */
export const EmptyState: React.FC<{
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}> = ({ icon = 'document-text-outline', title, subtitle }) => (
  <View style={styles.empty}>
    <View style={styles.emptyIcon}>
      <Ionicons name={icon} size={28} color={Colors.blue} />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
  </View>
);

/**
 * Long AI output rendered in a bounded, independently-scrollable, selectable box.
 * Keeps the surrounding form/controls visible while letting users scroll long
 * letters/explanations on small mobile screens.
 */
export const ScrollableText: React.FC<{
  text: string;
  textStyle?: TextStyle;
  /** Fraction of screen height the box may occupy before it scrolls. */
  maxHeightRatio?: number;
}> = ({ text, textStyle, maxHeightRatio = 0.42 }) => (
  <ScrollView
    style={{ maxHeight: Math.round(SCREEN_HEIGHT * maxHeightRatio) }}
    nestedScrollEnabled
    showsVerticalScrollIndicator
    keyboardShouldPersistTaps="handled"
    contentContainerStyle={{ paddingRight: 2 }}
  >
    <Text selectable style={textStyle}>
      {text}
    </Text>
  </ScrollView>
);

/** Small rounded pill / chip. */
export const Chip: React.FC<{
  label: string;
  active?: boolean;
  onPress?: () => void;
  color?: string;
}> = ({ label, active, onPress, color = Colors.blue }) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.chip,
      active && { borderColor: color, backgroundColor: 'rgba(0,212,255,0.10)' },
    ]}
  >
    <Text style={[styles.chipText, active && { color }]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  // On web/large screens, keep the app a phone-width column so it stays mobile-like.
  screenFrame:
    Platform.OS === 'web'
      ? { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' }
      : {},
  body: { flex: 1 },
  bodyContent: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 52,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  headerTitleWrap: { flex: 1, alignItems: 'center' },
  headerTitle: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
  headerSubtitle: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
  headerRight: { width: 36, alignItems: 'flex-end' },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  sectionTitle: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
  btn: {
    borderRadius: Radius.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostBtn: {
    backgroundColor: Colors.transparent,
    borderWidth: 1,
    borderColor: Colors.blue,
  },
  btnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#04121A', fontSize: FontSize.md, fontWeight: '800' },
  btnDisabled: { opacity: 0.5 },
  empty: { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.glassBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700', textAlign: 'center' },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 260,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  chipText: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
});
