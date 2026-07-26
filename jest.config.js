module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|react-native-url-polyfill|@supabase/.*|react-native-maps|lucide-react|date-fns|i18n-js|asyncstorage)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/mocks\\.ts$'],
  moduleNameMapper: {
    '^test-renderer$': 'react-test-renderer',
  },
};
