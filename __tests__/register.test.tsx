import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import RegisterScreen from '../app/(auth)/register';

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

const getRegisterButton = (getAllByText: Function) =>
  getAllByText('Registrar-se').slice(-1)[0];

describe('RegisterScreen', () => {
  it('renders all inputs and register button', () => {
    const { getByPlaceholderText, getAllByText } = render(<RegisterScreen />);

    expect(getByPlaceholderText('Correu electrònic')).toBeTruthy();
    expect(getByPlaceholderText('Contrasenya')).toBeTruthy();
    expect(getAllByText('Registrar-se').length).toBeGreaterThanOrEqual(1);
  });

  it('renders link to login screen', () => {
    const { getByText } = render(<RegisterScreen />);
    expect(getByText('Ja tens compte? Inicia sessió')).toBeTruthy();
  });

  it('shows inline error when fields are empty', async () => {
    const { getAllByText, getByText } = render(<RegisterScreen />);
    await act(async () => {
      fireEvent.press(getRegisterButton(getAllByText));
    });

    expect(getByText('Omple tots els camps')).toBeTruthy();
    expect(__mocks.mockSignUp).not.toHaveBeenCalled();
  });

  it('shows inline error when passwords do not match', async () => {
    const { getByPlaceholderText, getAllByText, getByText } = render(<RegisterScreen />);
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Correu electrònic'), 'user@test.com');
      fireEvent.changeText(getByPlaceholderText('Contrasenya'), 'password123');
      fireEvent.changeText(getByPlaceholderText('Confirmar contrasenya'), 'different123');
    });
    await act(async () => {
      fireEvent.press(getRegisterButton(getAllByText));
    });

    expect(getByText('Les contrasenyes no coincideixen')).toBeTruthy();
    expect(__mocks.mockSignUp).not.toHaveBeenCalled();
  });

  it('shows inline error when password is less than 6 characters', async () => {
    const { getByPlaceholderText, getAllByText, getByText } = render(<RegisterScreen />);
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Correu electrònic'), 'user@test.com');
      fireEvent.changeText(getByPlaceholderText('Contrasenya'), '12345');
      fireEvent.changeText(getByPlaceholderText('Confirmar contrasenya'), '12345');
    });
    await act(async () => {
      fireEvent.press(getRegisterButton(getAllByText));
    });

    expect(getByText('La contrasenya ha de tenir almenys 6 caràcters')).toBeTruthy();
    expect(__mocks.mockSignUp).not.toHaveBeenCalled();
  });

  it('calls signUpWithEmail with correct data on valid input', async () => {
    __mocks.mockSignUp.mockResolvedValue({ error: null });

    const { getByPlaceholderText, getAllByText } = render(<RegisterScreen />);
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Correu electrònic'), 'newuser@test.com');
      fireEvent.changeText(getByPlaceholderText('Contrasenya'), 'securepass123');
      fireEvent.changeText(getByPlaceholderText('Confirmar contrasenya'), 'securepass123');
    });
    await act(async () => {
      fireEvent.press(getRegisterButton(getAllByText));
    });

    expect(__mocks.mockSignUp).toHaveBeenCalledWith({
      email: 'newuser@test.com',
      password: 'securepass123',
    });
  });

  it('shows success message on successful registration', async () => {
    __mocks.mockSignUp.mockResolvedValue({ error: null });

    const { getByPlaceholderText, getAllByText, getByText } = render(<RegisterScreen />);
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Correu electrònic'), 'newuser@test.com');
      fireEvent.changeText(getByPlaceholderText('Contrasenya'), 'securepass123');
      fireEvent.changeText(getByPlaceholderText('Confirmar contrasenya'), 'securepass123');
    });
    await act(async () => {
      fireEvent.press(getRegisterButton(getAllByText));
    });

    await waitFor(() => {
      expect(getByText('Revisa el teu correu per confirmar el compte')).toBeTruthy();
    });
  });

  it('shows inline error on registration failure', async () => {
    __mocks.mockSignUp.mockResolvedValue({
      error: { message: 'User already registered' },
    });

    const { getByPlaceholderText, getAllByText, getByText } = render(<RegisterScreen />);
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Correu electrònic'), 'existing@test.com');
      fireEvent.changeText(getByPlaceholderText('Contrasenya'), 'securepass123');
      fireEvent.changeText(getByPlaceholderText('Confirmar contrasenya'), 'securepass123');
    });
    await act(async () => {
      fireEvent.press(getRegisterButton(getAllByText));
    });

    await waitFor(() => {
      expect(getByText('User already registered')).toBeTruthy();
    });
  });

  it('shows loading state while registering', async () => {
    let resolveSignUp: (value: any) => void;
    __mocks.mockSignUp.mockImplementation(
      () => new Promise((resolve) => { resolveSignUp = resolve; })
    );

    const { getByPlaceholderText, getAllByText, queryByText } = render(<RegisterScreen />);
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Correu electrònic'), 'newuser@test.com');
      fireEvent.changeText(getByPlaceholderText('Contrasenya'), 'securepass123');
      fireEvent.changeText(getByPlaceholderText('Confirmar contrasenya'), 'securepass123');
    });

    await act(async () => {
      fireEvent.press(getRegisterButton(getAllByText));
    });

    expect(queryByText('Carregant...')).toBeTruthy();

    await act(async () => {
      resolveSignUp!({ error: null });
    });
  });

  it('accepts password with exactly 6 characters', async () => {
    __mocks.mockSignUp.mockResolvedValue({ error: null });

    const { getByPlaceholderText, getAllByText } = render(<RegisterScreen />);
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Correu electrònic'), 'user@test.com');
      fireEvent.changeText(getByPlaceholderText('Contrasenya'), '123456');
      fireEvent.changeText(getByPlaceholderText('Confirmar contrasenya'), '123456');
    });
    await act(async () => {
      fireEvent.press(getRegisterButton(getAllByText));
    });

    expect(__mocks.mockSignUp).toHaveBeenCalled();
  });
});
