import React from 'react';
import { View, Text, Platform } from 'react-native';

// Wrapper for react-native-svg that avoids crashes on Android with Expo SDK 54
// If Platform.OS === 'android', renders a placeholder instead of SVG

const isAndroid = Platform.OS === 'android';

export function SafeSvg({ children, width, height, viewBox, style }: any) {
  if (isAndroid) {
    return (
      <View style={[{ width, height, backgroundColor: '#4DB8E8', justifyContent: 'center', alignItems: 'center' }, style]}>
        <Text style={{ fontSize: 40 }}>🏀</Text>
      </View>
    );
  }
  const Svg = require('react-native-svg').default;
  return <Svg width={width} height={height} viewBox={viewBox} style={style}>{children}</Svg>;
}

export function SafeCircle(props: any) {
  if (isAndroid) return null;
  const { Circle } = require('react-native-svg');
  return <Circle {...props} />;
}

export function SafePath(props: any) {
  if (isAndroid) return null;
  const { Path } = require('react-native-svg');
  return <Path {...props} />;
}

export function SafeRect(props: any) {
  if (isAndroid) return null;
  const { Rect } = require('react-native-svg');
  return <Rect {...props} />;
}

export function SafeLine(props: any) {
  if (isAndroid) return null;
  const { Line } = require('react-native-svg');
  return <Line {...props} />;
}

export function SafeG(props: any) {
  if (isAndroid) return null;
  const { G } = require('react-native-svg');
  return <G {...props} />;
}

export function SafeText(props: any) {
  if (isAndroid) return null;
  const { Text } = require('react-native-svg');
  return <Text {...props} />;
}
