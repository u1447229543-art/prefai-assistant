import type { NavigatorScreenParams } from '@react-navigation/native';
import type { StoredDocument } from '../services/storage';
import type { JourneyId } from '../constants/journeys';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  EditProfile: undefined;
  JourneyStep: { journeyId: JourneyId; stepId: string };
  Eligibility: undefined;
  DocumentPreview: { document: StoredDocument };
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
  Journey: undefined;
  Documents: undefined;
  AI: undefined;
  Profile: undefined;
};
