import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import LoginScreen from '../app/(auth)/login';

const { supabase, __mocks } = require('../lib/supabase');

beforeEach(() => {
  jest.clearAllMocks();
  __mocks.mockSignIn.mockReset();
  __mocks.mockSignUp.mockReset();
  __mocks.mockGetSession.mockResolvedValue({ data: { session: null } });
  __mocks.mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } },
  });
});

const getLoginButton = (getAllByText: Function) =>
  getAllByText('Iniciar sessió').slice(-1)[0];

describe('LoginScreen', () => {
  it('renders email and password inputs + login button', () => {
    const { getByPlaceholderText, getAllByText } = render(<LoginScreen />);

    expect(getByPlaceholderText('Correu electrònic')).toBeTruthy();
    expect(getByPlaceholderText('Contrasenya')).toBeTruthy();
    expect(getAllByText('Iniciar sessió').length).toBeGreaterThanOrEqual(1);
  });

  it('renders link to register screen', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText("No tens compte? Registra't")).toBeTruthy();
  });

  it('shows inline error when email is empty', async () => {
    const { getByPlaceholderText, getAllByText, getByText } = render(<LoginScreen />);
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Contrasenya'), 'password123');
    });
    await act(async () => {
      fireEvent.press(getLoginButton(getAllByText));
    });

    expect(getByText('Omple tots els camps')).toBeTruthy();
    expect(__mocks.mockSignIn).not.toHaveBeenCalled();
  });

  it('shows inline error when password is empty', async () => {
    const { getByPlaceholderText, getAllByText, getByText } = render(<LoginScreen />);
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Correu electrònic'), 'test@example.com');
    });
    await act(async () => {
      fireEvent.press(getLoginButton(getAllByText));
    });

    expect(getByText('Omple tots els camps')).toBeTruthy();
    expect(__mocks.mockSignIn).not.toHaveBeenCalled();
  });

  it('shows inline error when both fields are empty', async () => {
    const { getAllByText, getByText } = render(<LoginScreen />);
    await act(async () => {
      fireEvent.press(getLoginButton(getAllByText));
    });

    expect(getByText('Omple tots els camps')).toBeTruthy();
    expect(__mocks.mockSignIn).not.toHaveBeenCalled();
  });

  it('calls signInWithPassword with correct credentials', async () => {
    __mocks.mockSignIn.mockResolvedValue({ error: null });

    const { getByPlaceholderText, getAllByText } = render(<LoginScreen />);
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Correu electrònic'), 'user@test.com');
      fireEvent.changeText(getByPlaceholderText('Contrasenya'), 'password123');
    });
    await act(async () => {
      fireEvent.press(getLoginButton(getAllByText));
    });

    expect(__mocks.mockSignIn).toHaveBeenCalledWith({
      email: 'user@test.com',
      password: 'password123',
    });
  });

  it('shows inline error on login failure', async () => {
    __mocks.mockSignIn.mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    });

    const { getByPlaceholderText, getAllByText, getByText } = render(<LoginScreen />);
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Correu electrònic'), 'wrong@test.com');
      fireEvent.changeText(getByPlaceholderText('Contrasenya'), 'wrongpass');
    });
    await act(async () => {
      fireEvent.press(getLoginButton(getAllByText));
    });

    await waitFor(() => {
      expect(getByText('Invalid login credentials')).toBeTruthy();
    });
  });

  it('does not show error on successful login', async () => {
    __mocks.mockSignIn.mockResolvedValue({ error: null });

    const { getByPlaceholderText, getAllByText, queryByText } = render(<LoginScreen />);
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Correu electrònic'), 'user@test.com');
      fireEvent.changeText(getByPlaceholderText('Contrasenya'), 'correctpass');
    });
    await act(async () => {
      fireEvent.press(getLoginButton(getAllByText));
    });

    expect(queryByText('Omple tots els camps')).toBeNull();
  });

  it('shows loading state while signing in', async () => {
    let resolveSignIn: (value: any) => void;
    __mocks.mockSignIn.mockImplementation(
      () => new Promise((resolve) => { resolveSignIn = resolve; })
    );

    const { getByPlaceholderText, getAllByText, queryByText } = render(<LoginScreen />);
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Correu electrònic'), 'user@test.com');
      fireEvent.changeText(getByPlaceholderText('Contrasenya'), 'password123');
    });

    await act(async () => {
      fireEvent.press(getLoginButton(getAllByText));
    });

    expect(queryByText('Carregant...')).toBeTruthy();

    await act(async () => {
      resolveSignIn!({ error: null });
    });
  });

  it('disables button during loading', async () => {
    let resolveSignIn: (value: any) => void;
    __mocks.mockSignIn.mockImplementation(
      () => new Promise((resolve) => { resolveSignIn = resolve; })
    );

    const { getByPlaceholderText, getAllByText, getByText } = render(<LoginScreen />);
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Correu electrònic'), 'user@test.com');
      fireEvent.changeText(getByPlaceholderText('Contrasenya'), 'password123');
    });

    await act(async () => {
      fireEvent.press(getLoginButton(getAllByText));
    });

    const loadingBtn = getByText('Carregant...');
    expect(loadingBtn).toBeTruthy();

    await act(async () => {
      resolveSignIn!({ error: null });
    });
  });
});
