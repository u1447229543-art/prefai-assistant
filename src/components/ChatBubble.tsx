import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Gradients, Radius, Spacing } from '../constants/colors';

export interface ChatBubbleProps {
  role: 'user' | 'assistant';
  text: string;
  pending?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ role, text, pending }) => {
  const isUser = role === 'user';

  if (isUser) {
    return (
      <View style={[styles.row, styles.rowUser]}>
        <LinearGradient
          colors={Gradients.blue}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bubble, styles.userBubble]}
        >
          <Text style={styles.userText}>{text}</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.row, styles.rowAssistant]}>
      <View style={styles.avatar}>
        <Ionicons name="sparkles" size={14} color={Colors.blue} />
      </View>
      <View style={[styles.bubble, styles.assistantBubble]}>
        {pending ? (
          <View style={styles.typing}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotMid]} />
            <View style={styles.dot} />
          </View>
        ) : (
          <Text style={styles.assistantText}>{text}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: Spacing.md, maxWidth: '100%' },
  rowUser: { justifyContent: 'flex-end' },
  rowAssistant: { justifyContent: 'flex-start' },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.glassBlue,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
  },
  userBubble: { borderBottomRightRadius: 4 },
  assistantBubble: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  userText: { color: '#04121A', fontSize: FontSize.sm, fontWeight: '600', lineHeight: 20 },
  assistantText: { color: Colors.textPrimary, fontSize: FontSize.sm, lineHeight: 21 },
  typing: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.textMuted },
  dotMid: { marginHorizontal: 5, opacity: 0.7 },
});
