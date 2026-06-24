import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, Gradients, Radius, Spacing, glow } from '../constants/colors';

export const SplashScreen: React.FC = () => {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, scale]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fade, transform: [{ scale }], alignItems: 'center' }}>
        <View style={[styles.logo, glow(Colors.blue, 24)]}>
          <LinearGradient
            colors={Gradients.french}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <Text style={styles.logoText}>PA</Text>
          </LinearGradient>
        </View>

        <Text style={styles.title}>
          Pref<Text style={{ color: Colors.blue }}>AI</Text>
        </Text>
        <Text style={styles.subtitle}>Assistant</Text>

        <View style={styles.flagBar}>
          <View style={[styles.flagSegment, { backgroundColor: Colors.blue }]} />
          <View style={[styles.flagSegment, { backgroundColor: Colors.white }]} />
          <View style={[styles.flagSegment, { backgroundColor: Colors.red }]} />
        </View>

        <Text style={styles.tagline}>Your French bureaucracy assistant</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { borderRadius: Radius.xl, overflow: 'hidden' },
  logoGradient: {
    width: 96,
    height: 96,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#04121A', fontSize: 40, fontWeight: '900' },
  title: { color: Colors.white, fontSize: FontSize.display, fontWeight: '900', marginTop: Spacing.lg },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.xl,
    fontWeight: '300',
    letterSpacing: 4,
    marginTop: -2,
  },
  flagBar: {
    flexDirection: 'row',
    width: 120,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: Spacing.lg,
  },
  flagSegment: { flex: 1, height: '100%' },
  tagline: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: Spacing.md },
});
