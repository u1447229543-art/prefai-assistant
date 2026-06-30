import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors, glow } from '../constants/colors';
import { MAX_CONTENT_WIDTH } from '../constants/responsive';
import { useApp } from '../context/AppContext';
import { HomeScreen } from '../screens/HomeScreen';
import { JourneyScreen } from '../screens/JourneyScreen';
import { DocumentVaultScreen } from '../screens/DocumentVaultScreen';
import { AIScreen } from '../screens/AIScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import type { MainTabParamList } from './types';
import type { TranslationKey } from '../i18n/translations';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Journey: { active: 'map', inactive: 'map-outline' },
  Documents: { active: 'folder', inactive: 'folder-outline' },
  AI: { active: 'sparkles', inactive: 'sparkles-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

const TAB_LABELS: Record<keyof MainTabParamList, TranslationKey> = {
  Home: 'tabHome',
  Journey: 'tabJourney',
  Documents: 'tabDocuments',
  AI: 'tabAI',
  Profile: 'tabProfile',
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
        tabBarLabel: t(TAB_LABELS[route.name]),
        title: t(TAB_LABELS[route.name]),
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
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Journey" component={JourneyScreen} />
      <Tab.Screen name="Documents" component={DocumentVaultScreen} />
      <Tab.Screen name="AI" component={AIScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
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
