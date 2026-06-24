import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  EditProfile: undefined;
  DocumentExplain: undefined;
  Translation: undefined;
  AIReply: undefined;
  FormAssist: undefined;
  DeadlineTracker: undefined;
  PDFGenerator: undefined;
  Guides: undefined;
  Subscription: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  DocumentVault: undefined;
  Chat: undefined;
  Profile: undefined;
};
