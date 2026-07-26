/* eslint-disable no-undef */
jest.mock('./lib/supabase', () => {
  const mockSignIn = jest.fn();
  const mockSignUp = jest.fn();
  const mockSignOut = jest.fn();
  const mockGetSession = jest.fn().mockResolvedValue({ data: { session: null } });
  const mockOnAuthStateChange = jest.fn().mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } },
  });

  return {
    supabase: {
      auth: {
        signInWithPassword: mockSignIn,
        signUp: mockSignUp,
        signOut: mockSignOut,
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
      },
    },
    __mocks: { mockSignIn, mockSignUp, mockSignOut, mockGetSession, mockOnAuthStateChange },
  };
});

jest.mock('expo-router', () => {
  const replace = jest.fn();
  return {
    useRouter: () => ({ replace }),
    useSegments: () => ['(auth)'],
    Link: ({ children }) => children,
    Slot: () => null,
    __mocks: { replace },
  };
});

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'ca' }],
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));
