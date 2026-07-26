import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../lib/theme';
import { OnboardingFindCourts, OnboardingFindPlayers, OnboardingPlay } from './ui/Illustrations';
import { Button } from './ui/Button';

const { width } = Dimensions.get('window');

const slides = [
  {
    illustration: OnboardingFindCourts,
    title: 'Troba pistes',
    description: 'Descobreix totes les pistes de bàsquet de Badalona, del Pont del Petroli al Gorg.',
  },
  {
    illustration: OnboardingFindPlayers,
    title: 'Troba jugadors',
    description: 'Uneix-te a la comunitat i troba jugadors del teu nivell al teu barri.',
  },
  {
    illustration: OnboardingPlay,
    title: 'Juga!',
    description: 'Organitza partits, uneix-te a pachangas i gaudeix del bàsquet urbà.',
  },
];

export interface OnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ visible, onComplete }: OnboardingModalProps) {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!visible) return null;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setCurrentSlide(0);
      onComplete();
    }
  };

  const handleSkip = () => {
    setCurrentSlide(0);
    onComplete();
  };

  const SlideIllustration = slides[currentSlide].illustration;

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          zIndex: 9999,
          backgroundColor: colors.surfaceElevated,
        },
      ]}
    >
      {/* Skip Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: spacing[8],
          right: spacing[4],
          padding: spacing[4],
          zIndex: 10,
        }}
        onPress={handleSkip}
        accessibilityLabel="Saltar onboarding"
      >
        <Text
          style={{
            color: colors.textMuted,
            fontSize: typography.fontSizes.bodyMedium,
            fontWeight: typography.fontWeights.medium,
          }}
        >
          Saltar
        </Text>
      </TouchableOpacity>

      {/* Illustration */}
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          marginTop: spacing[16],
        }}
      >
        <SlideIllustration size={width * 0.7} />
      </View>

      {/* Content */}
      <View style={{ padding: spacing[8], alignItems: 'center' }}>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: typography.fontSizes.displaySmall,
            fontWeight: typography.fontWeights.bold,
            marginBottom: spacing[3],
            textAlign: 'center',
          }}
        >
          {slides[currentSlide].title}
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSizes.bodyLarge,
            textAlign: 'center',
            lineHeight: typography.lineHeights.bodyLarge,
          }}
        >
          {slides[currentSlide].description}
        </Text>
      </View>

      {/* Pagination */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: spacing[3],
          marginBottom: spacing[6],
        }}
      >
        {slides.map((_, index) => (
          <View
            key={index}
            style={{
              width: currentSlide === index ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: currentSlide === index ? colors.secondary : colors.border,
            }}
          />
        ))}
      </View>

      {/* Action Button */}
      <View style={{ paddingHorizontal: spacing[8], paddingBottom: spacing[8] }}>
        <Button
          title={currentSlide === slides.length - 1 ? 'Començar a jugar!' : 'Següent'}
          variant="primary"
          size="lg"
          onPress={handleNext}
          fullWidth
        />
      </View>
    </View>
  );
}
