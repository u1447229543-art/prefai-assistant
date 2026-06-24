import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';
import { Screen, Header } from '../components/ui';
import { ChatBubble } from '../components/ChatBubble';
import { useApp } from '../context/AppContext';
import * as storage from '../services/storage';
import { chat, ChatMessage } from '../services/openai';

const SUGGESTIONS = [
  'How do I apply for APL?',
  'What is a titre de séjour?',
  'CPAM rejected my reimbursement, what now?',
];

export const ChatScreen: React.FC = () => {
  const { language, t } = useApp();
  const [messages, setMessages] = useState<storage.StoredChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const listRef = useRef<FlatList<storage.StoredChatMessage>>(null);

  useEffect(() => {
    storage.loadChat().then(setMessages);
  }, []);

  const persist = (next: storage.StoredChatMessage[]) => {
    setMessages(next);
    storage.saveChat(next);
  };

  const scrollToEnd = () => setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || pending) return;

    const userMsg: storage.StoredChatMessage = {
      id: `m_${Date.now()}`,
      role: 'user',
      text: content,
      createdAt: new Date().toISOString(),
    };
    const next = [...messages, userMsg];
    persist(next);
    setInput('');
    setPending(true);
    scrollToEnd();

    try {
      const history: ChatMessage[] = next.slice(-10).map((m) => ({ role: m.role, content: m.text }));
      const reply = await chat(history, language);
      const aiMsg: storage.StoredChatMessage = {
        id: `m_${Date.now()}_a`,
        role: 'assistant',
        text: reply,
        createdAt: new Date().toISOString(),
      };
      persist([...next, aiMsg]);
    } catch (e) {
      persist([
        ...next,
        {
          id: `m_${Date.now()}_e`,
          role: 'assistant',
          text: t('error') + ': ' + String(e instanceof Error ? e.message : e),
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setPending(false);
      scrollToEnd();
    }
  };

  const clear = () => persist([]);

  const showWelcome = messages.length === 0;

  return (
    <Screen edges={['top', 'left', 'right']}>
      <Header
        title={t('chatTitle')}
        right={
          messages.length > 0 ? (
            <Pressable onPress={clear} hitSlop={10}>
              <Ionicons name="trash-outline" size={20} color={Colors.textMuted} />
            </Pressable>
          ) : undefined
        }
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {showWelcome ? (
          <View style={styles.welcome}>
            <View style={styles.welcomeIcon}>
              <Ionicons name="sparkles" size={28} color={Colors.blue} />
            </View>
            <Text style={styles.welcomeText}>{t('chatWelcome')}</Text>
            <View style={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <Pressable key={s} style={styles.suggestion} onPress={() => send(s)}>
                  <Text style={styles.suggestionText}>{s}</Text>
                  <Ionicons name="arrow-forward" size={14} color={Colors.blue} />
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={pending ? [...messages, PENDING_MSG] : messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => (
              <ChatBubble role={item.role} text={item.text} pending={item.id === PENDING_MSG.id} />
            )}
            contentContainerStyle={styles.list}
            onContentSizeChange={scrollToEnd}
            showsVerticalScrollIndicator={false}
          />
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder={t('chatPlaceholder')}
            placeholderTextColor={Colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            onSubmitEditing={() => send()}
          />
          <Pressable
            onPress={() => send()}
            disabled={!input.trim() || pending}
            style={[styles.sendBtn, (!input.trim() || pending) && styles.sendDisabled]}
          >
            <Ionicons name="arrow-up" size={20} color="#04121A" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const PENDING_MSG: storage.StoredChatMessage = {
  id: '__pending__',
  role: 'assistant',
  text: '',
  createdAt: '',
};

const styles = StyleSheet.create({
  welcome: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  welcomeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.glassBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  welcomeText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: Spacing.lg,
  },
  suggestions: { width: '100%', gap: Spacing.sm as unknown as number },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  suggestionText: { color: Colors.textPrimary, fontSize: FontSize.sm, flex: 1 },
  list: { padding: Spacing.md, paddingBottom: Spacing.lg },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    maxHeight: 120,
    fontSize: FontSize.md,
    marginRight: Spacing.sm,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.4 },
});
