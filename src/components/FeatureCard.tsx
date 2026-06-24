import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing, glow } from '../constants/colors';

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  /** Accent color for the icon glow. */
  accent?: string;
  onPress: () => void;
  /** Render as a wide row instead of a square tile. */
  wide?: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  accent = Colors.blue,
  onPress,
  wide,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        wide ? styles.wide : styles.tile,
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
    >
      <LinearGradient
        colors={[`${accent}26`, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.iconWrap, { borderColor: accent }, glow(accent, 8)]}>
        <Ionicons name={icon} size={22} color={accent} />
      </View>
      <View style={wide ? styles.wideText : undefined}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description} numberOfLines={wide ? 2 : 3}>
          {description}
        </Text>
      </View>
      {wide ? (
        <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  tile: {
    flex: 1,
    padding: Spacing.md,
    minHeight: 132,
    justifyContent: 'space-between',
  },
  wide: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  wideText: { flex: 1, marginLeft: Spacing.md },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '700',
    marginTop: Spacing.sm,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginTop: 4,
    lineHeight: 17,
  },
});
