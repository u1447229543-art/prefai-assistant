# PrefAI Assistant

An AI-powered mobile app that helps immigrants, expats, refugees and foreign residents in France understand and manage French administrative documents and procedures (CAF, CPAM, ANEF, Préfecture, Impôts, and more).

> PrefAI **helps you understand, translate and prepare** documents. It does **not** replace official government services.

Built with **React Native + Expo (TypeScript)**, a dark neon theme, and OpenAI `gpt-4o`.

## Features

| Feature | Description |
| --- | --- |
| Explain Document | Upload/paste a document → AI explains it in simple language with key points, deadlines & next steps |
| Translate | French ↔ 10 languages, context-aware administrative translation |
| AI Reply | Generate official French administrative responses (CAF, CPAM, Préfecture…) |
| Form Assist | Explains each form field, what to write and the required documents |
| Deadline Tracker | Extracts deadlines from documents, tracks them with urgency badges |
| Document Vault | Securely store passport, visa, CAF/CPAM docs & contracts by category |
| AI Chat | Conversational assistant for any French admin question |
| PDF Generator | Generate official letters and export them as PDF |
| Guides | Step-by-step CAF, CPAM, Préfecture & Impôts guides |

**Supported languages:** Georgian, English, Arabic, Russian, Bengali, Chinese (Mandarin), Hindi, Spanish, French, Portuguese.

## Getting started

```bash
npm install
cp .env.example .env   # set EXPO_PUBLIC_API_URL to your backend
npm run web            # or: npm run android / npm run ios
```

Without a backend URL (or when not logged in) AI features run in **demo mode** with placeholder responses, so the full UI is still navigable.

## Configuration

- `EXPO_PUBLIC_API_URL` – PrefAI backend on Railway (auth, journeys, documents, and **AI proxy** at `/api/ai/*`). Defaults to `http://localhost:3001` if empty.
- OpenAI is **not** configured in the mobile app. Set `OPENAI_API_KEY` on the backend (Railway environment variables), never in the client bundle.

Stripe subscriptions use the same backend URL; leave `EXPO_PUBLIC_API_URL` empty to run subscription flows in demo mode.

## Project structure

```
src/
  constants/   colors, languages, pricing, guides
  services/    openai, stripe, storage, documents, clipboard
  hooks/       useAuth, useSubscription
  context/     AppContext (auth + subscription + i18n)
  i18n/        UI translations
  components/  FeatureCard, DocumentCard, LanguageSelector, DeadlineCard,
               PricingCard, ChatBubble, GuideCard, ui primitives
  navigation/  RootNavigator (stack) + TabNavigator (bottom tabs)
  screens/     15 screens (Splash, Onboarding, Home, …, Auth)
```

## Pricing tiers

- **Free** – €0, 5 documents/month
- **Basic** – €9/month, 50 documents/month
- **Pro** – €19/month, unlimited

## Tech

React Native 0.85 · Expo SDK 56 · React Navigation 7 · expo-document-picker · expo-file-system · expo-print · expo-secure-store · AsyncStorage · expo-linear-gradient.
