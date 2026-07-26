import React from 'react';
import Svg, { Circle, Path, Rect, Line, G, Text } from 'react-native-svg';

export const SplashIllustration = React.memo(function SplashIllustration({ size = 300 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 300 300">
      {/* Sky */}
      <Rect x="0" y="0" width="300" height="180" fill="#4DB8E8" />
      
      {/* Sea */}
      <Rect x="0" y="180" width="300" height="120" fill="#006DAB" />
      
      {/* Pont del Petroli */}
      <Path d="M50 180 Q75 140 100 160 Q125 180 150 170" stroke="#1C1C2E" strokeWidth="3" fill="none" />
      <Rect x="45" y="130" width="10" height="50" fill="#1C1C2E" />
      <Rect x="90" y="140" width="10" height="40" fill="#1C1C2E" />
      <Rect x="140" y="145" width="10" height="35" fill="#1C1C2E" />
      
      {/* Sun */}
      <Circle cx="250" cy="50" r="30" fill="#F4A261" />
      <Path d="M220 50 L230 50 M270 50 L280 50 M250 20 L250 30 M250 70 L250 80" stroke="#F4A261" strokeWidth="2" />
      
      {/* Basketball hoop */}
      <Path d="M180 160 L200 160" stroke="#1C1C2E" strokeWidth="4" />
      <Rect x="200" y="155" width="30" height="5" fill="#E76F51" />
      <Rect x="205" y="140" width="20" height="20" fill="#DEE2E6" fillOpacity="0.5" />
      
      {/* Basketball */}
      <Circle cx="215" cy="130" r="15" fill="#E76F51" />
      <Path d="M205 130 L225 130" stroke="#1C1C2E" strokeWidth="1" />
      <Path d="M215 120 L215 140" stroke="#1C1C2E" strokeWidth="1" />
      
      {/* Players silhouette */}
      <Circle cx="120" cy="200" r="8" fill="#1C1C2E" />
      <Path d="M120 208 L120 220" stroke="#1C1C2E" strokeWidth="3" />
      <Path d="M110 215 L130 215" stroke="#1C1C2E" strokeWidth="3" />
      <Path d="M120 215 L120 235" stroke="#1C1C2E" strokeWidth="3" />
      
      <Circle cx="160" cy="210" r="7" fill="#1C1C2E" />
      <Path d="M160 217 L160 225" stroke="#1C1C2E" strokeWidth="3" />
      <Path d="M150 220 L170 220" stroke="#1C1C2E" strokeWidth="3" />
      <Path d="M160 220 L160 240" stroke="#1C1C2E" strokeWidth="3" />
      
      {/* Waves */}
      <Path d="M20 190 Q30 185 40 190 Q50 185 60 190" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
      <Path d="M80 195 Q90 190 100 195 Q110 190 120 195" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
      <Path d="M150 192 Q160 187 170 192 Q180 187 190 192" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
      
      {/* Court lines */}
      <Path d="M30 250 L270 250" stroke="#27AE60" strokeWidth="2" strokeDasharray="5 5" />
      <Path d="M50 260 L250 260" stroke="#27AE60" strokeWidth="2" />
      <Circle cx="150" cy="280" r="40" stroke="#27AE60" strokeWidth="2" fill="none" />
      
    </Svg>
  );
});

export const HeroIllustration = React.memo(function HeroIllustration({ size = 300 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 300 300">
      {/* Sky */}
      <Rect x="0" y="0" width="300" height="180" fill="#4DB8E8" />
      {/* Sea */}
      <Rect x="0" y="180" width="300" height="120" fill="#006DAB" />
      {/* Pont del Petroli */}
      <Path d="M50 180 Q75 140 100 160 Q125 180 150 170" stroke="#1C1C2E" strokeWidth="3" fill="none" />
      <Rect x="45" y="130" width="10" height="50" fill="#1C1C2E" />
      <Rect x="90" y="140" width="10" height="40" fill="#1C1C2E" />
      <Rect x="140" y="145" width="10" height="35" fill="#1C1C2E" />
      {/* Sun */}
      <Circle cx="250" cy="50" r="30" fill="#F4A261" />
      <Path d="M220 50 L230 50 M270 50 L280 50 M250 20 L250 30 M250 70 L250 80" stroke="#F4A261" strokeWidth="2" />
      {/* Basketball hoop */}
      <Path d="M180 160 L200 160" stroke="#1C1C2E" strokeWidth="4" />
      <Rect x="200" y="155" width="30" height="5" fill="#E76F51" />
      <Rect x="205" y="140" width="20" height="20" fill="#DEE2E6" fillOpacity="0.5" />
      {/* Basketball */}
      <Circle cx="215" cy="130" r="15" fill="#E76F51" />
      <Path d="M205 130 L225 130" stroke="#1C1C2E" strokeWidth="1" />
      <Path d="M215 120 L215 140" stroke="#1C1C2E" strokeWidth="1" />
      {/* Players silhouette */}
      <Circle cx="120" cy="200" r="8" fill="#1C1C2E" />
      <Path d="M120 208 L120 220" stroke="#1C1C2E" strokeWidth="3" />
      <Path d="M110 215 L130 215" stroke="#1C1C2E" strokeWidth="3" />
      <Path d="M120 215 L120 235" stroke="#1C1C2E" strokeWidth="3" />
      <Circle cx="160" cy="210" r="7" fill="#1C1C2E" />
      <Path d="M160 217 L160 225" stroke="#1C1C2E" strokeWidth="3" />
      <Path d="M150 220 L170 220" stroke="#1C1C2E" strokeWidth="3" />
      <Path d="M160 220 L160 240" stroke="#1C1C2E" strokeWidth="3" />
      {/* Waves */}
      <Path d="M20 190 Q30 185 40 190 Q50 185 60 190" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
      <Path d="M80 195 Q90 190 100 195 Q110 190 120 195" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
      <Path d="M150 192 Q160 187 170 192 Q180 187 190 192" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
      {/* Court lines */}
      <Path d="M30 250 L270 250" stroke="#27AE60" strokeWidth="2" strokeDasharray="5 5" />
      <Path d="M50 260 L250 260" stroke="#27AE60" strokeWidth="2" />
      <Circle cx="150" cy="280" r="40" stroke="#27AE60" strokeWidth="2" fill="none" />
    </Svg>
  );
});

export const OnboardingFindCourts = React.memo(function OnboardingFindCourts({ size = 280 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 280 280">
      {/* Map background */}
      <Rect x="0" y="0" width="280" height="280" rx="20" fill="#F8F9FA" />
      
      {/* Grid lines */}
      <G stroke="#EDF2F7" strokeWidth="1">
        {Array.from({ length: 6 }).map((_, i) => (
          <React.Fragment key={i}>
            <Line x1="0" y1={40 + i * 40} x2="280" y2={40 + i * 40} />
            <Line x1={40 + i * 40} y1="0" x2={40 + i * 40} y2="280" />
          </React.Fragment>
        ))}
      </G>
      
      {/* Court markers */}
      <Circle cx="80" cy="80" r="12" fill="#27AE60" stroke="#FFFFFF" strokeWidth="2" />
      <Circle cx="80" cy="80" r="8" fill="none" stroke="#FFFFFF" strokeWidth="2" />
      <Path d="M78 78 L82 82 M82 78 L78 82" stroke="#FFFFFF" strokeWidth="2" />
      
      <Circle cx="200" cy="120" r="12" fill="#27AE60" stroke="#FFFFFF" strokeWidth="2" />
      <Circle cx="200" cy="120" r="8" fill="none" stroke="#FFFFFF" strokeWidth="2" />
      
      <Circle cx="120" cy="200" r="12" fill="#F39C12" stroke="#FFFFFF" strokeWidth="2" />
      <Circle cx="120" cy="200" r="6" fill="none" stroke="#FFFFFF" strokeWidth="2" />
      
      <Circle cx="220" cy="220" r="12" fill="#E74C3C" stroke="#FFFFFF" strokeWidth="2" />
      <Rect x="216" y="216" width="8" height="8" rx="2" fill="#FFFFFF" />
      
      {/* Location pin */}
      <Path d="M140 140 L140 160" stroke="#2D9CDB" strokeWidth="3" />
      <Circle cx="140" cy="140" r="15" fill="#2D9CDB" stroke="#FFFFFF" strokeWidth="3" />
      <Circle cx="140" cy="135" r="6" fill="#FFFFFF" />
      
      {/* Player markers */}
      <Circle cx="60" cy="180" r="8" fill="#E76F51" />
      <Path d="M55 175 L65 185" stroke="#FFFFFF" strokeWidth="2" />
      <Path d="M65 175 L55 185" stroke="#FFFFFF" strokeWidth="2" />
      
      <Circle cx="180" cy="60" r="8" fill="#E76F51" />
      <Path d="M175 55 L185 65" stroke="#FFFFFF" strokeWidth="2" />
      <Path d="M185 55 L175 65" stroke="#FFFFFF" strokeWidth="2" />
    </Svg>
  );
});

export const OnboardingFindPlayers = React.memo(function OnboardingFindPlayers({ size = 280 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 280 280">
      {/* Background */}
      <Rect x="0" y="0" width="280" height="280" rx="20" fill="#F8F9FA" />
      
      {/* Court outline */}
      <Rect x="30" y="30" width="220" height="220" rx="10" fill="#EDF2F7" />
      <Rect x="40" y="40" width="200" height="200" rx="8" fill="none" stroke="#27AE60" strokeWidth="2" />
      <Circle cx="140" cy="140" r="50" fill="none" stroke="#27AE60" strokeWidth="2" />
      <Path d="M90 140 L190 140" stroke="#27AE60" strokeWidth="2" />
      
      {/* Players connected */}
      <Circle cx="100" cy="100" r="20" fill="#006DAB" />
      <Circle cx="100" cy="95" r="8" fill="#4DB8E8" />
      <Path d="M100 103 L100 108" stroke="#4DB8E8" strokeWidth="3" />
      <Text x="100" y="115" textAnchor="middle" fontSize="8" fill="#FFFFFF">P1</Text>
      
      <Circle cx="180" cy="100" r="20" fill="#E76F51" />
      <Circle cx="180" cy="95" r="8" fill="#F4A261" />
      <Path d="M180 103 L180 108" stroke="#F4A261" strokeWidth="3" />
      <Text x="180" y="115" textAnchor="middle" fontSize="8" fill="#FFFFFF">P2</Text>
      
      <Circle cx="140" cy="180" r="20" fill="#27AE60" />
      <Circle cx="140" cy="175" r="8" fill="#58D68D" />
      <Path d="M140 183 L140 188" stroke="#58D68D" strokeWidth="3" />
      <Text x="140" y="195" textAnchor="middle" fontSize="8" fill="#FFFFFF">P3</Text>
      
      {/* Connection lines */}
      <Path d="M115 100 L165 100" stroke="#2D9CDB" strokeWidth="2" strokeDasharray="4 2" />
      <Path d="M110 115 L130 165" stroke="#2D9CDB" strokeWidth="2" strokeDasharray="4 2" />
      <Path d="M170 115 L150 165" stroke="#2D9CDB" strokeWidth="2" strokeDasharray="4 2" />
      
      {/* Plus icons */}
      <Circle cx="140" cy="50" r="12" fill="#2D9CDB" />
      <Path d="M140 44 L140 56" stroke="#FFFFFF" strokeWidth="2" />
      <Path d="M134 50 L146 50" stroke="#FFFFFF" strokeWidth="2" />
    </Svg>
  );
});

export const OnboardingPlay = React.memo(function OnboardingPlay({ size = 280 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 280 280">
      {/* Background */}
      <Rect x="0" y="0" width="280" height="280" rx="20" fill="#F8F9FA" />
      
      {/* Hoop */}
      <Path d="M120 60 L160 60" stroke="#1C1C2E" strokeWidth="4" />
      <Rect x="130" y="60" width="20" height="5" fill="#E76F51" />
      <Path d="M135 60 L135 85" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 2" />
      <Path d="M145 60 L145 85" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 2" />
      
      {/* Basketball going in */}
      <Circle cx="140" cy="90" r="18" fill="#E76F51" />
      <Path d="M126 90 L154 90" stroke="#1C1C2E" strokeWidth="1.5" />
      <Path d="M140 76 L140 104" stroke="#1C1C2E" strokeWidth="1.5" />
      <Path d="M128 78 L152 102" stroke="#1C1C2E" strokeWidth="1.5" />
      
      {/* Confetti */}
      <Circle cx="100" cy="70" r="4" fill="#27AE60" />
      <Circle cx="180" cy="80" r="5" fill="#F39C12" />
      <Circle cx="90" cy="110" r="3" fill="#2D9CDB" />
      <Circle cx="190" cy="120" r="4" fill="#E74C3C" />
      <Rect x="110" y="55" width="8" height="3" rx="1" fill="#F4A261" transform="rotate(15 110 55)" />
      <Rect x="170" y="65" width="6" height="4" rx="1" fill="#27AE60" transform="rotate(-20 170 65)" />
      
      {/* Player celebrating */}
      <Circle cx="100" cy="180" r="15" fill="#006DAB" />
      <Circle cx="100" cy="172" r="6" fill="#4DB8E8" />
      <Path d="M85 165 L115 165" stroke="#4DB8E8" strokeWidth="3" strokeLinecap="round" />
      <Path d="M85 180 L70 160" stroke="#006DAB" strokeWidth="4" strokeLinecap="round" />
      <Path d="M115 180 L130 160" stroke="#006DAB" strokeWidth="4" strokeLinecap="round" />
      <Path d="M95 195 L90 230" stroke="#006DAB" strokeWidth="4" strokeLinecap="round" />
      <Path d="M105 195 L110 230" stroke="#006DAB" strokeWidth="4" strokeLinecap="round" />
      
      {/* Stars */}
      <Path d="M70 70 L72 75 L78 76 L74 80 L75 86 L70 83 L65 86 L66 80 L62 76 L68 75 Z" fill="#F39C12" />
      <Path d="M210 100 L212 105 L218 106 L214 110 L215 116 L210 113 L205 116 L206 110 L202 106 L208 105 Z" fill="#F39C12" />
      
      {/* Text */}
      <Text x="140" y="240" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#E76F51" fontFamily="SpaceGrotesk_700Bold">
        A pista!
      </Text>
      <Text x="140" y="258" textAnchor="middle" fontSize="12" fill="#6C757D" fontFamily="Inter_400Regular">
        Let's play basketball!
      </Text>
    </Svg>
  );
});

export const EmptyStateIllustration = React.memo(function EmptyStateIllustration({ type, size = 200 }: { type: 'no-matches' | 'no-friends' | 'no-courts'; size?: number }) {
  const renderNoMatches = () => (
    <G>
      <Circle cx={size/2} cy={size/2 - 20} r={40} fill="#EDF2F7" />
      <Path d={`M${size/2-25} ${size/2-45} L${size/2+25} ${size/2+5}`} stroke="#DEE2E6" strokeWidth="3" />
      <Circle cx={size/2} cy={size/2 - 20} r={15} fill="#E76F51" />
      <Path d={`M${size/2-8} ${size/2-20} L${size/2+8} ${size/2-20}`} stroke="#FFFFFF" strokeWidth="2" />
      <Path d={`M${size/2} ${size/2-28} L${size/2} ${size/2-12}`} stroke="#FFFFFF" strokeWidth="2" />
      <Text x={size/2} y={size/2 + 45} textAnchor="middle" fontSize="14" fill="#6C757D" fontFamily="Inter_400Regular">
        No hi ha partits
      </Text>
      <Text x={size/2} y={size/2 + 60} textAnchor="middle" fontSize="10" fill="#ADB5BD" fontFamily="Inter_400Regular">
        Crea el primer partit!
      </Text>
    </G>
  );

  const renderNoFriends = () => (
    <G>
      <Circle cx={size/2 - 15} cy={size/2 - 20} r={20} fill="#006DAB" opacity="0.3" />
      <Circle cx={size/2 + 15} cy={size/2 - 20} r={20} fill="#E76F51" opacity="0.3" />
      <Circle cx={size/2 - 15} cy={size/2 - 20} r={20} fill="#EDF2F7" />
      <Circle cx={size/2 + 15} cy={size/2 - 20} r={20} fill="#EDF2F7" />
      <Path d={`M${size/2-5} ${size/2+10} Q${size/2} ${size/2+20} ${size/2+5} ${size/2+10}`} stroke="#DEE2E6" strokeWidth="2" fill="none" />
      <Text x={size/2} y={size/2 + 45} textAnchor="middle" fontSize="14" fill="#6C757D" fontFamily="Inter_400Regular">
        Encara no tens amics
      </Text>
      <Text x={size/2} y={size/2 + 60} textAnchor="middle" fontSize="10" fill="#ADB5BD" fontFamily="Inter_400Regular">
        Cerca jugadors propers
      </Text>
    </G>
  );

  const renderNoCourts = () => (
    <G>
      <Rect x={size/2 - 40} y={size/2 - 50} width="80" height="60" rx="8" fill="#EDF2F7" />
      <Circle cx={size/2 - 20} cy={size/2 - 35} r="8" fill="#27AE60" opacity="0.5" />
      <Circle cx={size/2 + 10} cy={size/2 - 25} r="8" fill="#F39C12" opacity="0.5" />
      <Circle cx={size/2 + 25} cy={size/2 - 40} r="8" fill="#E74C3C" opacity="0.5" />
      <Path d={`M${size/2-20} ${size/2-10} L${size/2+20} ${size/2-10}`} stroke="#DEE2E6" strokeWidth="2" />
      <Text x={size/2} y={size/2 + 30} textAnchor="middle" fontSize="14" fill="#6C757D" fontFamily="Inter_400Regular">
        No s'han trobat pistes
      </Text>
      <Text x={size/2} y={size/2 + 45} textAnchor="middle" fontSize="10" fill="#ADB5BD" fontFamily="Inter_400Regular">
        Prova a canviar els filtres
      </Text>
    </G>
  );

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {type === 'no-matches' && renderNoMatches()}
      {type === 'no-friends' && renderNoFriends()}
      {type === 'no-courts' && renderNoCourts()}
    </Svg>
  );
});

export default {
  SplashIllustration,
  OnboardingFindCourts,
  OnboardingFindPlayers,
  OnboardingPlay,
  EmptyStateIllustration,
};