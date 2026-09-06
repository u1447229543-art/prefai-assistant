import React, { useCallback, useRef, useState } from 'react';
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';
import { Screen, Header } from '../components/ui';
import { ChatBubble } from '../components/ChatBubble';
import { useApp } from '../context/AppContext';
import * as storage from '../services/storage';
import { aiAskAnything, aiClearChatHistory, aiGetChatHistory, ApiError } from '../services/api';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SUGGESTIONS = [
  'How do I apply for APL?',
  'What is a titre de séjour?',
  'CPAM rejected my reimbursement, what now?',
];

export const ChatScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { language, t, user } = useApp();
  const [messages, setMessages] = useState<storage.StoredChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const listRef = useRef<FlatList<storage.StoredChatMessage>>(null);

  const mapServer = (list: { id: string; role: 'user' | 'assistant'; content: string; createdAt: string }[]) =>
    list.map((m) => ({
      id: m.id,
      role: m.role,
      text: m.content,
      createdAt: typeof m.createdAt === 'string' ? m.createdAt : new Date(m.createdAt).toISOString(),
    }));

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoadingHistory(true);
      (async () => {
        try {
          const { messages: remote } = await aiGetChatHistory();
          if (!active) return;
          const mapped = mapServer(remote);
          setMessages(mapped);
          await storage.saveChat(mapped);
        } catch {
          if (!active) return;
          const local = await storage.loadChat();
          setMessages(local);
        } finally {
          if (active) setLoadingHistory(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  const persistLocal = (next: storage.StoredChatMessage[]) => {
    setMessages(next);
    void storage.saveChat(next);
  };

  const scrollToEnd = () => setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || pending) return;

    const userMsg: storage.StoredChatMessage = {
      id: `local_${Date.now()}`,
      role: 'user',
      text: content,
      createdAt: new Date().toISOString(),
    };
    const optimistic = [...messages, userMsg];
    persistLocal(optimistic);
    setInput('');
    setPending(true);
    scrollToEnd();

    try {
      const { reply, messages: remote } = await aiAskAnything(content, language);
      const mapped = mapServer(remote);
      if (mapped.length > 0) {
        persistLocal(mapped);
      } else {
        persistLocal([
          ...optimistic,
          {
            id: `local_${Date.now()}_a`,
            role: 'assistant',
            text: reply,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (e) {
      let errText = String(e instanceof Error ? e.message : e);
      if (e instanceof ApiError && e.status === 401) {
        errText = t('errSessionExpired');
      }
      persistLocal([
        ...optimistic,
        {
          id: `local_${Date.now()}_e`,
          role: 'assistant',
          text: `${t('error')}: ${errText}`,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setPending(false);
      scrollToEnd();
    }
  };

  const clear = async () => {
    try {
      await aiClearChatHistory();
    } catch {
      // still clear local
    }
    persistLocal([]);
  };

  const showWelcome = !loadingHistory && messages.length === 0 && !pending;
  const statusHint =
    user?.status && user.status !== 'unknown'
      ? user.status.replace(/_/g, ' ')
      : null;

  return (
    <Screen edges={['top', 'left', 'right']}>
      <Header
        title={t('chatTitle')}
        subtitle={t('chatSubtitle')}
        onBack={() => navigation.goBack()}
        right={
          messages.length > 0 ? (
            <Pressable onPress={() => void clear()} hitSlop={10}>
              <Ionicons name="trash-outline" size={20} color={Colors.textMuted} />
            </Pressable>
          ) : undefined
        }
      />
      {statusHint ? (
        <Pressable style={styles.statusBar} onPress={() => navigation.navigate('EditProfile')}>
          <Ionicons name="person-outline" size={14} color={Colors.blue} />
          <Text style={styles.statusText}>
            {t('yourSituation')}: {statusHint}
          </Text>
          <Text style={styles.statusEdit}>{t('change')}</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.statusBar} onPress={() => navigation.navigate('EditProfile')}>
          <Ionicons name="person-add-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.statusMuted}>{t('setYourSituation')}</Text>
        </Pressable>
      )}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loadingHistory ? (
          <View style={styles.welcome}>
            <Text style={styles.loadingText}>{t('loading')}</Text>
          </View>
        ) : showWelcome ? (
          <View style={styles.welcome}>
            <View style={styles.welcomeIcon}>
              <Ionicons name="sparkles" size={28} color={Colors.blue} />
            </View>
            <Text style={styles.welcomeText}>{t('chatWelcome')}</Text>
            <View style={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <Pressable key={s} style={styles.suggestion} onPress={() => void send(s)}>
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
            editable={!pending}
            onSubmitEditing={() => void send()}
          />
          <Pressable
            onPress={() => void send()}
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
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  statusText: { color: Colors.blue, fontSize: FontSize.xs, fontWeight: '600', flex: 1, textTransform: 'capitalize' },
  statusMuted: { color: Colors.textMuted, fontSize: FontSize.xs, flex: 1 },
  statusEdit: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '700' },
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
  loadingText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  suggestions: { width: '100%' },
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
  suggestionText: { color: Colors.textPrimary, fontSize: FontSize.sm, flex: 1, marginRight: 8 },
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
