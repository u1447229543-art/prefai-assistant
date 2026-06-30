import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { useApp } from '../context/AppContext';
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { TabNavigator } from './TabNavigator';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { JourneyStepScreen } from '../screens/JourneyStepScreen';
import { EligibilityScreen } from '../screens/EligibilityScreen';
import { DocumentPreviewScreen } from '../screens/DocumentPreviewScreen';
import { DocumentExplainScreen } from '../screens/DocumentExplainScreen';
import { TranslationScreen } from '../screens/TranslationScreen';
import { AIReplyScreen } from '../screens/AIReplyScreen';
import { FormAssistScreen } from '../screens/FormAssistScreen';
import { DeadlineTrackerScreen } from '../screens/DeadlineTrackerScreen';
import { PDFGeneratorScreen } from '../screens/PDFGeneratorScreen';
import { GuidesScreen } from '../screens/GuidesScreen';
import { SubscriptionScreen } from '../screens/SubscriptionScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme: Theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.background,
    card: Colors.card,
    border: Colors.border,
    text: Colors.white,
    primary: Colors.blue,
    notification: Colors.red,
  },
};

export const RootNavigator: React.FC = () => {
  const { ready, onboarded, isAuthenticated } = useApp();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (!ready || !splashDone) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
        {!onboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="JourneyStep" component={JourneyStepScreen} />
            <Stack.Screen name="Eligibility" component={EligibilityScreen} />
            <Stack.Screen name="DocumentPreview" component={DocumentPreviewScreen} />
            <Stack.Screen name="DocumentExplain" component={DocumentExplainScreen} />
            <Stack.Screen name="Translation" component={TranslationScreen} />
            <Stack.Screen name="AIReply" component={AIReplyScreen} />
            <Stack.Screen name="FormAssist" component={FormAssistScreen} />
            <Stack.Screen name="DeadlineTracker" component={DeadlineTrackerScreen} />
            <Stack.Screen name="PDFGenerator" component={PDFGeneratorScreen} />
            <Stack.Screen name="Guides" component={GuidesScreen} />
            <Stack.Screen
              name="Subscription"
              component={SubscriptionScreen}
              options={{ presentation: 'modal' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
