import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors, glow } from '../constants/colors';
import { MAX_CONTENT_WIDTH } from '../constants/responsive';
import { useApp } from '../context/AppContext';
import { HomeScreen } from '../screens/HomeScreen';
import { DocumentVaultScreen } from '../screens/DocumentVaultScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  DocumentVault: { active: 'folder', inactive: 'folder-outline' },
  Chat: { active: 'chatbubble', inactive: 'chatbubble-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

export const TabNavigator: React.FC = () => {
  const { t } = useApp();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.blue,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: { paddingVertical: 6 },
        tabBarIcon: ({ focused, color, size }) => {
          const name = ICONS[route.name][focused ? 'active' : 'inactive'];
          return (
            <View style={focused ? [styles.activeIcon, glow(Colors.blue, 8)] : undefined}>
              <Ionicons name={name} size={size - 2} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('tabHome') }} />
      <Tab.Screen name="DocumentVault" component={DocumentVaultScreen} options={{ title: t('tabDocuments') }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ title: t('tabChat') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('tabProfile') }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.card,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 6,
    // Keep the tab bar phone-width and centered on web/large screens.
    ...(Platform.OS === 'web'
      ? { width: '100%' as const, maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' as const }
      : {}),
  },
  label: { fontSize: 11, fontWeight: '600' },
  activeIcon: {
    backgroundColor: Colors.glassBlue,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
});
