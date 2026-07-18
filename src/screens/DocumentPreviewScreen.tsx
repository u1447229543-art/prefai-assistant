import React from 'react';
import {
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/colors';
import { Screen, Header, NeonButton, Body } from '../components/ui';
import { formatBytes } from '../services/documents';
import { getCategoryMeta } from '../components/DocumentCard';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';

type PreviewRoute = RouteProp<RootStackParamList, 'DocumentPreview'>;

const isImage = (mime?: string, name?: string) =>
  (mime?.startsWith('image/') ?? false) || /\.(png|jpe?g|gif|webp|bmp|heic)$/i.test(name ?? '');
const isPdf = (mime?: string, name?: string) =>
  (mime?.includes('pdf') ?? false) || /\.pdf$/i.test(name ?? '');

export const DocumentPreviewScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useApp();
  const params = useRoute<PreviewRoute>().params;
  const document = params?.document;

  if (!document) {
    return (
      <Screen>
        <Header title={t('previewMissingDocument')} onBack={() => navigation.goBack()} />
        <Body>
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={40} color={Colors.red} />
            <Text style={styles.errorText}>{t('previewMissingDocumentMsg')}</Text>
          </View>
        </Body>
      </Screen>
    );
  }

  const meta = getCategoryMeta(document.category);
  const image = isImage(document.mimeType, document.name);
  const pdf = isPdf(document.mimeType, document.name);

  const openExternally = () => {
    if (document.uri) Linking.openURL(document.uri).catch(() => undefined);
  };

  const renderPreview = () => {
    if (!document.uri) {
      return <Info icon="cloud-offline-outline" text={t('previewNoFile')} />;
    }

    if (image) {
      return (
        <Image
          source={{ uri: document.uri }}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel={document.name}
        />
      );
    }

    // PDFs and other files embed directly in the browser on web.
    if (Platform.OS === 'web') {
      return React.createElement('iframe', {
        src: document.uri,
        style: {
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: 12,
          backgroundColor: '#fff',
        },
        title: document.name,
      });
    }

    // Native: PDFs/other open in the device viewer.
    return (
      <Info
        icon={pdf ? 'document-text-outline' : 'document-outline'}
        text={pdf ? t('pdfPreviewOpens') : t('filePreviewOpens')}
      />
    );
  };

  return (
    <Screen>
      <Header
        title={document.name}
        onBack={() => navigation.goBack()}
        right={
          document.uri ? (
            <Ionicons
              name="open-outline"
              size={22}
              color={Colors.blue}
              onPress={openExternally}
            />
          ) : undefined
        }
      />

      <View style={styles.metaRow}>
        <View style={[styles.metaIcon, { backgroundColor: `${meta.color}1F`, borderColor: meta.color }]}>
          <Ionicons name={meta.icon} size={18} color={meta.color} />
        </View>
        <View style={{ flex: 1, marginLeft: Spacing.sm }}>
          <Text style={styles.metaTitle}>{meta.label}</Text>
          <Text style={styles.metaSub}>
            {formatBytes(document.size)}
            {document.mimeType ? ` · ${document.mimeType}` : ''}
          </Text>
        </View>
      </View>

      <View style={styles.previewArea}>{renderPreview()}</View>

      {document.uri && Platform.OS !== 'web' && !image ? (
        <NeonButton
          title={pdf ? t('openPdf') : t('openFile')}
          onPress={openExternally}
          variant="blue"
          icon="open-outline"
          style={styles.openBtn}
        />
      ) : null}
    </Screen>
  );
};

const Info: React.FC<{ icon: keyof typeof Ionicons.glyphMap; text: string }> = ({ icon, text }) => (
  <View style={styles.info}>
    <Ionicons name={icon} size={48} color={Colors.textMuted} />
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  metaIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaTitle: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '700' },
  metaSub: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
  previewArea: {
    flex: 1,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  info: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  infoText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 20,
  },
  openBtn: { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  errorBox: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.md },
  errorText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
