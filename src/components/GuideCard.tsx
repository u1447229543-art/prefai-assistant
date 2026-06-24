import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';

export interface GuideCardProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent?: string;
  steps: number;
  onPress: () => void;
}

export const GuideCard: React.FC<GuideCardProps> = ({
  title,
  subtitle,
  icon,
  accent = Colors.blue,
  steps,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <LinearGradient
        colors={[`${accent}22`, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.iconWrap, { borderColor: accent }]}>
        <Ionicons name={icon} size={24} color={accent} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="list-outline" size={13} color={accent} />
          <Text style={[styles.steps, { color: accent }]}>{steps} steps</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, marginHorizontal: Spacing.md },
  title: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
  subtitle: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 3, lineHeight: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  steps: { fontSize: FontSize.xs, fontWeight: '700', marginLeft: 4 },
});
