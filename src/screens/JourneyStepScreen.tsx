import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing, glow } from '../constants/colors';
import { Screen, Body, Header, Card, NeonButton } from '../components/ui';
import { ChatBubble } from '../components/ChatBubble';
import { useApp } from '../context/AppContext';
import { getJourney, getJourneyStep } from '../constants/journeys';
import { askAboutStep, ChatMessage, isStepAiConfigured } from '../services/openai';
import { promptUpgrade } from '../utils/quotaPrompt';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type StepRoute = RouteProp<RootStackParamList, 'JourneyStep'>;

interface NominatimResult {
  place_id: number;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
}

type OrgType =
  | 'spada'
  | 'guda'
  | 'caf'
  | 'cpam'
  | 'prefecture'
  | 'ofii'
  | 'ofpra'
  | 'francetravail'
  | 'bank'
  | 'doctor'
  | 'university'
  | 'exam'
  | 'other';

/**
 * Decides whether a step involves visiting a physical place, what type of
 * organization it is, and the best French search term for the map.
 * Returns null for online-only / at-home steps.
 */
function locationSearch(step: {
  organization: string;
  whereToGo: string;
  title: string;
}): { type: OrgType; term: string; label: string } | null {
  const where = step.whereToGo.toLowerCase();
  // Only offer "Find near me" when there's a real-world place to visit.
  const physical =
    /office|branch|préfecture|prefecture|guichet|guda|spada|platform|centre|center|\blocal\b|in person|en personne|doctor|médecin|bank|banque|university|université|campus/.test(
      where
    );
  if (!physical) return null;

  const hay = `${step.organization} ${step.whereToGo} ${step.title}`.toLowerCase();
  // Order matters: more specific matches first.
  const map: [RegExp, OrgType, string, string][] = [
    [/spada/, 'spada', 'SPADA demandeur asile', 'SPADA'],
    [/guda|guichet unique/, 'guda', 'GUDA préfecture', 'GUDA (préfecture)'],
    [/cpam|assurance maladie|ameli/, 'cpam', 'Caisse Primaire Assurance Maladie', 'CPAM'],
    [/\bcaf\b|allocations familiales/, 'caf', 'Caisse Allocations Familiales', 'CAF'],
    [/ofii/, 'ofii', 'OFII Office Français Immigration', 'OFII'],
    [/ofpra/, 'ofpra', 'OFPRA', 'OFPRA'],
    [/préfecture|prefecture/, 'prefecture', 'préfecture', 'Préfecture'],
    [/france travail|pôle emploi|pole emploi/, 'francetravail', 'France Travail', 'France Travail'],
    [/bank|banque/, 'bank', 'banque', 'Banks'],
    [/doctor|médecin|generaliste|généraliste/, 'doctor', 'médecin généraliste', 'Doctors (médecin traitant)'],
    [/université|university|campus/, 'university', 'université', 'University'],
    [/test centre|language|langue|tcf|delf/, 'exam', 'centre examen TCF', 'French test centre'],
  ];
  for (const [re, type, term, label] of map) {
    if (re.test(hay)) return { type, term, label };
  }
  return { type: 'other', term: step.organization, label: step.organization };
}

/** Normalize a city name for fallback lookups (lowercase, no accents). */
function cityKey(city: string): string {
  return city
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

interface FallbackPlace {
  name: string;
  address: string;
}

/**
 * Hardcoded, real public addresses for major French cities, used only when the
 * live Nominatim lookup is unavailable or returns nothing. Préfectures are the
 * most stable; for other organizations we fall back to a map search.
 */
const FALLBACK_PLACES: Partial<Record<OrgType, Record<string, FallbackPlace>>> = {
  prefecture: {
    paris: { name: 'Préfecture de Police de Paris', address: '1 Rue de Lutèce, 75004 Paris' },
    lyon: { name: 'Préfecture du Rhône', address: '106 Rue Pierre Corneille, 69003 Lyon' },
    marseille: { name: 'Préfecture des Bouches-du-Rhône', address: 'Place Félix Baret, 13006 Marseille' },
    bordeaux: { name: 'Préfecture de la Gironde', address: '2 Esplanade Charles de Gaulle, 33000 Bordeaux' },
    toulouse: { name: 'Préfecture de la Haute-Garonne', address: '1 Place Saint-Étienne, 31000 Toulouse' },
    nice: { name: 'Préfecture des Alpes-Maritimes', address: '147 Route de Grenoble, 06200 Nice' },
    lille: { name: 'Préfecture du Nord', address: '12 Rue Jean sans Peur, 59000 Lille' },
    strasbourg: { name: 'Préfecture du Bas-Rhin', address: '5 Place de la République, 67073 Strasbourg' },
  },
  caf: {
    paris: { name: 'CAF de Paris', address: '50 Rue du Faubourg Poissonnière, 75484 Paris' },
    lyon: { name: 'CAF du Rhône', address: '67 Boulevard Vivier Merle, 69409 Lyon' },
    marseille: { name: 'CAF des Bouches-du-Rhône', address: '215 Chemin de Gibbes, 13014 Marseille' },
    bordeaux: { name: 'CAF de la Gironde', address: 'Rue du Docteur Gabriel Péri, 33078 Bordeaux' },
    toulouse: { name: 'CAF de la Haute-Garonne', address: '24 Rue Riquet, 31046 Toulouse' },
    nice: { name: 'CAF des Alpes-Maritimes', address: '4 Rue Robert Latouche, 06200 Nice' },
    lille: { name: 'CAF du Nord', address: '160 Rue Brûle Maison, 59000 Lille' },
    strasbourg: { name: 'CAF du Bas-Rhin', address: '18 Rue de Berne, 67000 Strasbourg' },
  },
  cpam: {
    paris: { name: 'CPAM de Paris', address: '21 Rue Georges Auric, 75019 Paris' },
    lyon: { name: 'CPAM du Rhône', address: '276 Cours Émile Zola, 69100 Villeurbanne (Lyon)' },
    marseille: { name: 'CPAM des Bouches-du-Rhône', address: '56 Chemin Joseph Aiguier, 13009 Marseille' },
    bordeaux: { name: 'CPAM de la Gironde', address: 'Place de l’Europe, 33000 Bordeaux' },
    toulouse: { name: 'CPAM de la Haute-Garonne', address: '3 Boulevard du Professeur Léopold Escande, 31000 Toulouse' },
    nice: { name: 'CPAM des Alpes-Maritimes', address: '48 Avenue du Roi Robert Comte de Provence, 06100 Nice' },
    lille: { name: 'CPAM de Lille-Douai', address: '2 Rue d’Iéna, 59000 Lille' },
    strasbourg: { name: 'CPAM du Bas-Rhin', address: '16 Rue de Lausanne, 67000 Strasbourg' },
  },
};

export const JourneyStepScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<StepRoute>();
  const params = route.params;
  const { journey, toggleJourneyStep, language, t, consumeAiRequest } = useApp();

  const journeyId = params?.journeyId;
  const stepId = params?.stepId;
  const journeyData = journeyId ? getJourney(journeyId) : null;
  const step = journeyId && stepId ? getJourneyStep(journeyId, stepId) : undefined;

  const index = journeyData && stepId ? journeyData.steps.findIndex((s) => s.id === stepId) : -1;
  const done = step ? journey.completedStepIds.includes(step.id) : false;
  const accent = journeyData?.accent ?? Colors.blue;

  // Interactive "what to bring" checklist (local — what the user has ready).
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  // Mini AI chat state.
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  // "Find near me" (OpenStreetMap Nominatim) state.
  const loc = step ? locationSearch(step) : null;
  const [locOpen, setLocOpen] = useState(false);
  const [city, setCity] = useState('');
  const [locResults, setLocResults] = useState<NominatimResult[]>([]);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [searchedCity, setSearchedCity] = useState('');

  const stepContext = useMemo(() => {
    if (!step || !journeyData) return '';
    return [
      `Journey: ${journeyData.title}`,
      `Step ${index + 1} of ${journeyData.steps.length}: ${step.title}`,
      `Organization: ${step.organization}`,
      `Purpose: ${step.purpose}`,
      `Where to go: ${step.whereToGo}`,
      `Official source: ${step.officialUrl}`,
      `Required documents: ${step.documents.join(', ')}`,
      `Instructions: ${step.instructions.join(' ')}`,
    ].join('\n');
  }, [step, journeyData, index]);

  if (!journeyId || !stepId || !step || !journeyData) {
    return (
      <Screen>
        <Header title={t('stepLabel')} onBack={() => navigation.goBack()} />
        <Body>
          <Text style={styles.purpose}>
            {!journeyId || !stepId ? t('journeyMissingParams') : t('stepNotFound')}
          </Text>
        </Body>
      </Screen>
    );
  }

  const openUrl = (url: string) => {
    if (url) Linking.openURL(url).catch(() => {});
  };

  const openDirections = (address: string) => {
    openUrl(`https://www.google.com/maps/search/${encodeURIComponent(address)}`);
  };

  const searchLocations = async () => {
    const c = city.trim();
    if (!c || !loc || locLoading) return;
    setLocLoading(true);
    setLocError(null);
    setLocResults([]);
    setSearchedCity(c);
    try {
      // Search term + city only — `countrycodes=fr` already restricts to France.
      const q = encodeURIComponent(`${loc.term} ${c}`);
      const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5&countrycodes=fr&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'PrefAI-Assistant/1.0',
          'Accept-Language': 'fr',
        },
      });
      if (!res.ok) throw new Error('search failed');
      const data: NominatimResult[] = await res.json();
      setLocResults(Array.isArray(data) ? data : []);
    } catch {
      // Network/CORS error — leave results empty so the fallback list shows.
      setLocError('live');
    } finally {
      setLocLoading(false);
    }
  };

  // Hardcoded fallback when the live map service returns nothing / fails.
  const fallbackPlace: FallbackPlace | null = (() => {
    if (!loc || !searchedCity) return null;
    const type = loc.type === 'guda' ? 'prefecture' : loc.type;
    return FALLBACK_PLACES[type as OrgType]?.[cityKey(searchedCity)] ?? null;
  })();

  const send = async () => {
    const text = input.trim();
    if (!text || thinking) return;
    const allowed = await consumeAiRequest();
    if (!allowed) {
      promptUpgrade(t, 'upgradeAiDailyMsg', () => navigation.navigate('Subscription'));
      return;
    }
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setThinking(true);
    try {
      const reply = await askAboutStep(stepContext, next, language);
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages([
        ...next,
        {
          role: 'assistant',
          content:
            e instanceof Error ? e.message : t('aiSomethingWrong'),
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const suggestions = [
    'What if I don’t have proof of address?',
    t('howLongQuestion'),
    'What if my documents aren’t in French?',
  ];

  return (
    <Screen edges={['top', 'left', 'right']}>
      <Header title={`${t('stepLabel')} ${index + 1}`} onBack={() => navigation.goBack()} />
      <Body>
        {/* 1. HEADER ---------------------------------------------------- */}
        <Card style={[styles.heroCard, { borderColor: accent }, glow(accent, 8)]}>
          <View style={styles.heroTop}>
            <View style={[styles.stepBadge, { borderColor: accent }]}>
              <Text style={[styles.stepBadgeText, { color: accent }]}>{index + 1}</Text>
            </View>
            {done ? (
              <View style={styles.donePill}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                <Text style={styles.donePillText}>{t('completedLabel')}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.heroTitle}>{step.title}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="business-outline" size={13} color={accent} />
              <Text style={styles.badgeText}>{step.organization}</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="time-outline" size={13} color={accent} />
              <Text style={styles.badgeText}>{step.duration}</Text>
            </View>
          </View>

          {step.officialUrl ? (
            <Pressable onPress={() => openUrl(step.officialUrl)} style={styles.linkRow} hitSlop={6}>
              <Ionicons name="globe-outline" size={15} color={Colors.blue} />
              <Text style={styles.linkText} numberOfLines={1}>
                Official website
              </Text>
              <Ionicons name="open-outline" size={14} color={Colors.blue} />
            </Pressable>
          ) : null}
        </Card>

        {/* 2. PURPOSE --------------------------------------------------- */}
        <SectionLabel icon="information-circle-outline" text={t('whyThisMatters')} color={accent} />
        <Card style={styles.block}>
          <Text style={styles.purpose}>{step.purpose}</Text>
        </Card>

        {/* 3. STEP BY STEP --------------------------------------------- */}
        <SectionLabel icon="list-outline" text={t('stepByStep')} color={accent} />
        <Card style={styles.block}>
          {step.instructions.map((line, i) => (
            <View key={i} style={styles.instructionRow}>
              <View style={[styles.instructionNum, { backgroundColor: accent }]}>
                <Text style={styles.instructionNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{line}</Text>
            </View>
          ))}
        </Card>

        {/* 4. WHAT TO BRING (checklist) -------------------------------- */}
        <SectionLabel icon="checkbox-outline" text={t('whatToBring')} color={accent} />
        <Card style={styles.block}>
          <Text style={styles.checklistHint}>Tick off what you already have ready.</Text>
          {step.documents.map((doc) => {
            const isChecked = !!checked[doc];
            return (
              <Pressable
                key={doc}
                onPress={() => setChecked((c) => ({ ...c, [doc]: !c[doc] }))}
                style={styles.checkRow}
              >
                <View style={[styles.checkbox, isChecked && styles.checkboxOn]}>
                  {isChecked ? <Ionicons name="checkmark" size={14} color="#04121A" /> : null}
                </View>
                <Text style={[styles.checkText, isChecked && styles.checkTextOn]}>{doc}</Text>
              </Pressable>
            );
          })}
          <View style={styles.whereRow}>
            <Ionicons name="location-outline" size={15} color={Colors.blue} />
            <Text style={styles.whereText}>{step.whereToGo}</Text>
          </View>
        </Card>

        {/* FIND NEAR ME (OpenStreetMap Nominatim) ---------------------- */}
        {loc ? (
          <>
            <SectionLabel icon="navigate-outline" text={t('findNearYou')} color={Colors.blue} />
            <Card style={styles.block}>
              {!locOpen ? (
                <Pressable style={styles.findBtn} onPress={() => setLocOpen(true)}>
                  <Ionicons name="location" size={18} color="#04121A" />
                  <Text style={styles.findBtnText}>Find near me</Text>
                </Pressable>
              ) : (
                <>
                  <Text style={styles.findHint}>Enter your city in France</Text>
                  <View style={styles.cityRow}>
                    <TextInput
                      value={city}
                      onChangeText={setCity}
                      placeholder="e.g. Lyon, Paris, Marseille"
                      placeholderTextColor={Colors.textMuted}
                      style={styles.cityInput}
                      autoCapitalize="words"
                      returnKeyType="search"
                      onSubmitEditing={searchLocations}
                    />
                    <Pressable
                      onPress={searchLocations}
                      disabled={locLoading || !city.trim()}
                      style={[styles.cityBtn, (locLoading || !city.trim()) && { opacity: 0.4 }]}
                    >
                      {locLoading ? (
                        <ActivityIndicator size="small" color="#04121A" />
                      ) : (
                        <Ionicons name="search" size={18} color="#04121A" />
                      )}
                    </Pressable>
                  </View>

                  {locResults.length > 0 ? (
                    <>
                      {locResults.map((r) => {
                        const name = r.name || r.display_name.split(',')[0];
                        return (
                          <View key={r.place_id} style={styles.resultCard}>
                            <View style={styles.resultHead}>
                              <Ionicons name="business" size={15} color={Colors.blue} />
                              <Text style={styles.resultName} numberOfLines={2}>
                                {name}
                              </Text>
                            </View>
                            <Text style={styles.resultAddr}>{r.display_name}</Text>
                            <Pressable
                              style={styles.dirBtn}
                              onPress={() => openDirections(r.display_name)}
                            >
                              <Ionicons name="map-outline" size={15} color={Colors.blue} />
                              <Text style={styles.dirBtnText}>Get directions</Text>
                            </Pressable>
                          </View>
                        );
                      })}
                      <Text style={styles.osmCredit}>Results from OpenStreetMap</Text>
                    </>
                  ) : searchedCity && !locLoading ? (
                    <>
                      <Text style={styles.noResults}>
                        {locError
                          ? `Couldn't reach the live map service. Here's general info for ${searchedCity}:`
                          : `No exact matches in ${searchedCity}. Here's general info:`}
                      </Text>

                      {fallbackPlace ? (
                        <View style={styles.resultCard}>
                          <View style={styles.resultHead}>
                            <Ionicons name="business" size={15} color={Colors.blue} />
                            <Text style={styles.resultName} numberOfLines={2}>
                              {fallbackPlace.name}
                            </Text>
                          </View>
                          <Text style={styles.resultAddr}>{fallbackPlace.address}</Text>
                          <Pressable
                            style={styles.dirBtn}
                            onPress={() => openDirections(fallbackPlace.address)}
                          >
                            <Ionicons name="map-outline" size={15} color={Colors.blue} />
                            <Text style={styles.dirBtnText}>Get directions</Text>
                          </Pressable>
                        </View>
                      ) : null}

                      <View style={styles.resultCard}>
                        <View style={styles.resultHead}>
                          <Ionicons name="map" size={15} color={Colors.blue} />
                          <Text style={styles.resultName} numberOfLines={2}>
                            Find {loc.label} in {searchedCity}
                          </Text>
                        </View>
                        <Text style={styles.resultAddr}>
                          Open the map to see every {loc.label} location near {searchedCity}.
                        </Text>
                        <Pressable
                          style={styles.dirBtn}
                          onPress={() => openDirections(`${loc.term} ${searchedCity} France`)}
                        >
                          <Ionicons name="open-outline" size={15} color={Colors.blue} />
                          <Text style={styles.dirBtnText}>Open in Google Maps</Text>
                        </Pressable>
                      </View>
                    </>
                  ) : null}
                </>
              )}
            </Card>
          </>
        ) : null}

        {/* 5. COMMON MISTAKES ------------------------------------------ */}
        <SectionLabel icon="warning-outline" text={t('commonMistakesLabel')} color={Colors.warning} />
        <Card style={styles.block}>
          {step.commonMistakes.map((m, i) => (
            <View key={i} style={styles.mistakeRow}>
              <Ionicons name="alert-circle" size={15} color={Colors.warning} style={{ marginTop: 1 }} />
              <Text style={styles.mistakeText}>{m}</Text>
            </View>
          ))}
        </Card>

        {/* 6. WHAT HAPPENS NEXT ---------------------------------------- */}
        <SectionLabel icon="arrow-forward-circle-outline" text={t('whatHappensNext')} color={Colors.success} />
        <Card style={[styles.block, styles.nextCard]}>
          <Ionicons name="flag-outline" size={16} color={Colors.success} />
          <Text style={styles.nextText}>{step.whatNext}</Text>
        </Card>

        {/* 7. AI ASSISTANT --------------------------------------------- */}
        {isStepAiConfigured() ? (
          <>
            <SectionLabel icon="sparkles-outline" text={t('askAiAboutStep')} color={Colors.blue} />
            <Card style={styles.block}>
              {!chatOpen ? (
                <>
                  <Text style={styles.aiIntro}>
                    Get answers specific to this step — like what to do if a document is missing.
                  </Text>
                  <NeonButton
                    title={t('askAiBtn')}
                    icon="chatbubbles-outline"
                    onPress={() => setChatOpen(true)}
                  />
                </>
              ) : (
                <>
                  {messages.length === 0 ? (
                    <View>
                      <Text style={styles.aiIntro}>Tap a question or type your own:</Text>
                      {suggestions.map((q) => (
                        <Pressable
                          key={q}
                          style={styles.suggestion}
                          onPress={() => {
                            setInput(q);
                          }}
                        >
                          <Ionicons name="help-circle-outline" size={15} color={Colors.blue} />
                          <Text style={styles.suggestionText}>{q}</Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.chatLog}>
                      {messages.map((m, i) => (
                        <ChatBubble key={i} role={m.role as 'user' | 'assistant'} text={m.content} />
                      ))}
                      {thinking ? <ChatBubble role="assistant" text="" pending /> : null}
                    </View>
                  )}

                  <View style={styles.inputRow}>
                    <TextInput
                      value={input}
                      onChangeText={setInput}
                      placeholder="Type your question…"
                      placeholderTextColor={Colors.textMuted}
                      style={styles.input}
                      multiline
                      onSubmitEditing={send}
                    />
                    <Pressable
                      onPress={send}
                      disabled={thinking || !input.trim()}
                      style={[styles.sendBtn, (thinking || !input.trim()) && { opacity: 0.4 }]}
                    >
                      {thinking ? (
                        <ActivityIndicator size="small" color="#04121A" />
                      ) : (
                        <Ionicons name="arrow-up" size={18} color="#04121A" />
                      )}
                    </Pressable>
                  </View>
                </>
              )}
            </Card>
          </>
        ) : null}

        {/* 8. OFFICIAL SOURCE ------------------------------------------ */}
        {step.officialUrl ? (
          <NeonButton
            title={t('openOfficialSite')}
            icon="open-outline"
            variant="ghost"
            onPress={() => openUrl(step.officialUrl)}
            style={{ marginTop: Spacing.sm }}
          />
        ) : null}

        {/* 9. MARK AS COMPLETED ---------------------------------------- */}
        <Pressable
          onPress={() => toggleJourneyStep(step.id)}
          style={[styles.completeBtn, done && styles.completeBtnDone]}
        >
          <Ionicons
            name={done ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={20}
            color={done ? '#04121A' : Colors.success}
          />
          <Text style={[styles.completeText, done && styles.completeTextDone]}>
            {done ? t('completedTapUndo') : t('markAsCompleted')}
          </Text>
        </Pressable>
      </Body>
    </Screen>
  );
};

const SectionLabel: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  color: string;
}> = ({ icon, text, color }) => (
  <View style={styles.sectionLabel}>
    <Ionicons name={icon} size={16} color={color} />
    <Text style={styles.sectionLabelText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  // Hero / header
  heroCard: { marginBottom: Spacing.sm },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardElevated,
  },
  stepBadgeText: { fontSize: FontSize.md, fontWeight: '800' },
  donePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4 as unknown as number,
    backgroundColor: 'rgba(46,230,166,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  donePillText: { color: Colors.success, fontSize: FontSize.xs, fontWeight: '700' },
  heroTitle: { color: Colors.white, fontSize: FontSize.xl, fontWeight: '800', marginTop: Spacing.sm },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 as unknown as number, marginTop: Spacing.sm },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5 as unknown as number,
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: { color: Colors.textPrimary, fontSize: FontSize.xs, fontWeight: '600' },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6 as unknown as number,
    marginTop: Spacing.md,
  },
  linkText: { color: Colors.blue, fontSize: FontSize.sm, fontWeight: '700', flex: 1 },

  // Section label
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7 as unknown as number,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionLabelText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '800' },

  block: { marginBottom: Spacing.xs },
  purpose: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 21 },

  // Instructions
  instructionRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  instructionNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    marginTop: 1,
  },
  instructionNumText: { color: '#04121A', fontSize: FontSize.xs, fontWeight: '800' },
  instructionText: { color: Colors.textPrimary, fontSize: FontSize.sm, lineHeight: 21, flex: 1 },

  // Checklist
  checklistHint: { color: Colors.textMuted, fontSize: FontSize.xs, marginBottom: Spacing.sm },
  checkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  checkboxOn: { backgroundColor: Colors.success, borderColor: Colors.success },
  checkText: { color: Colors.textPrimary, fontSize: FontSize.sm, flex: 1 },
  checkTextOn: { color: Colors.textSecondary, textDecorationLine: 'line-through' },
  whereRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7 as unknown as number,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  whereText: { color: Colors.textSecondary, fontSize: FontSize.sm, flex: 1 },

  // Find near me
  findBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8 as unknown as number,
    backgroundColor: Colors.blue,
    borderRadius: Radius.md,
    paddingVertical: 12,
  },
  findBtnText: { color: '#04121A', fontSize: FontSize.md, fontWeight: '800' },
  findHint: { color: Colors.textSecondary, fontSize: FontSize.sm, marginBottom: Spacing.sm },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cityInput: {
    flex: 1,
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
    fontSize: FontSize.sm,
  },
  cityBtn: {
    width: 46,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locError: { color: Colors.warning, fontSize: FontSize.sm, marginTop: Spacing.sm },
  noResults: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: Spacing.md, lineHeight: 20 },
  resultCard: {
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
  },
  resultHead: { flexDirection: 'row', alignItems: 'center', gap: 7 as unknown as number },
  resultName: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '700', flex: 1 },
  resultAddr: { color: Colors.textSecondary, fontSize: FontSize.xs, lineHeight: 18, marginTop: 5 },
  dirBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6 as unknown as number,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.blue,
    borderRadius: Radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  dirBtnText: { color: Colors.blue, fontSize: FontSize.xs, fontWeight: '700' },
  osmCredit: { color: Colors.textMuted, fontSize: 10, marginTop: Spacing.sm, textAlign: 'right' },

  // Mistakes
  mistakeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 as unknown as number, marginBottom: Spacing.sm },
  mistakeText: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20, flex: 1 },

  // What next
  nextCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 as unknown as number },
  nextText: { color: Colors.textPrimary, fontSize: FontSize.sm, lineHeight: 21, flex: 1 },

  // AI
  aiIntro: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.sm },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8 as unknown as number,
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
    marginBottom: 8,
  },
  suggestionText: { color: Colors.textPrimary, fontSize: FontSize.sm, flex: 1 },
  chatLog: { marginBottom: Spacing.sm },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  input: {
    flex: 1,
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: FontSize.sm,
    maxHeight: 110,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Complete
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8 as unknown as number,
    borderWidth: 1.5,
    borderColor: Colors.success,
    borderRadius: Radius.md,
    paddingVertical: 14,
    marginTop: Spacing.lg,
  },
  completeBtnDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  completeText: { color: Colors.success, fontSize: FontSize.md, fontWeight: '800' },
  completeTextDone: { color: '#04121A' },
});
