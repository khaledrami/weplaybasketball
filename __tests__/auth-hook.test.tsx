import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from '../lib/auth';

const { __mocks } = require('../lib/supabase');

beforeEach(() => {
  jest.clearAllMocks();
  __mocks.mockSignIn.mockReset();
  __mocks.mockSignUp.mockReset();
  __mocks.mockSignOut.mockReset();
  __mocks.mockGetSession.mockResolvedValue({ data: { session: null } });
  __mocks.mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } },
  });
});

describe('useAuth hook', () => {
  it('initializes with no user and not loading', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('fetches session on mount', () => {
    renderHook(() => useAuth());
    expect(__mocks.mockGetSession).toHaveBeenCalledTimes(1);
  });

  it('subscribes to auth state changes on mount', () => {
    renderHook(() => useAuth());
    expect(__mocks.mockOnAuthStateChange).toHaveBeenCalledTimes(1);
  });

  it('signInWithEmail returns null on success', async () => {
    __mocks.mockSignIn.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());

    let errorMsg: string | null = null;
    await act(async () => {
      errorMsg = await result.current.signInWithEmail('user@test.com', 'pass123');
    });

    expect(errorMsg).toBeNull();
    expect(__mocks.mockSignIn).toHaveBeenCalledWith({
      email: 'user@test.com',
      password: 'pass123',
    });
  });

  it('signInWithEmail returns error message on failure', async () => {
    __mocks.mockSignIn.mockResolvedValue({
      error: { message: 'Invalid credentials' },
    });

    const { result } = renderHook(() => useAuth());

    let errorMsg: string | null = null;
    await act(async () => {
      errorMsg = await result.current.signInWithEmail('wrong@test.com', 'wrong');
    });

    expect(errorMsg).toBe('Invalid credentials');
  });

  it('signInWithEmail sets loading to true during call', async () => {
    let resolveSignIn: (value: any) => void;
    __mocks.mockSignIn.mockImplementation(
      () => new Promise((resolve) => { resolveSignIn = resolve; })
    );

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.signInWithEmail('user@test.com', 'pass123');
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveSignIn!({ error: null });
    });

    expect(result.current.loading).toBe(false);
  });

  it('signUpWithEmail returns null on success', async () => {
    __mocks.mockSignUp.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());

    let errorMsg: string | null = null;
    await act(async () => {
      errorMsg = await result.current.signUpWithEmail('new@test.com', 'pass123');
    });

    expect(errorMsg).toBeNull();
    expect(__mocks.mockSignUp).toHaveBeenCalledWith({
      email: 'new@test.com',
      password: 'pass123',
    });
  });

  it('signUpWithEmail returns error message on failure', async () => {
    __mocks.mockSignUp.mockResolvedValue({
      error: { message: 'User already exists' },
    });

    const { result } = renderHook(() => useAuth());

    let errorMsg: string | null = null;
    await act(async () => {
      errorMsg = await result.current.signUpWithEmail('existing@test.com', 'pass123');
    });

    expect(errorMsg).toBe('User already exists');
  });

  it('signOut calls supabase.auth.signOut', async () => {
    __mocks.mockSignOut.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(__mocks.mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('cleans up auth subscription on unmount', () => {
    const mockUnsubscribe = jest.fn();
    __mocks.mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });

    const { unmount } = renderHook(() => useAuth());
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('sets user from initial session', async () => {
    const mockUser = { id: 'user-123', email: 'test@test.com' };
    __mocks.mockGetSession.mockResolvedValue({
      data: { session: { user: mockUser } },
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {});

    expect(result.current.user).toEqual(mockUser);
  });

  it('updates user when auth state changes', async () => {
    let authCallback: ((event: string, session: any) => void) | undefined;
    __mocks.mockOnAuthStateChange.mockImplementation((cb: any) => {
      authCallback = cb;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {});

    const mockUser = { id: 'user-456', email: 'new@test.com' };
    await act(async () => {
      authCallback!('SIGNED_IN', { user: mockUser });
    });

    expect(result.current.user).toEqual(mockUser);
  });
});
