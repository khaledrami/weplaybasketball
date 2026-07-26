import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../lib/auth';
import { useTranslation } from '../../lib/i18n';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { signUpWithEmail, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegister = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!email || !password || !confirmPassword) {
      setErrorMsg(t('auth.fill_all'));
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg(t('auth.passwords_no_match'));
      return;
    }
    if (password.length < 6) {
      setErrorMsg(t('auth.password_short'));
      return;
    }
    try {
      const error = await signUpWithEmail(email, password);
      if (error) {
        setErrorMsg(error);
      } else {
        setSuccessMsg(t('auth.check_email'));
      }
    } catch (e: any) {
      setErrorMsg(e?.message ?? t('common.error'));
    }
  };

  const clearMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80' }}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            'rgba(29,53,87,0.95)',
            'rgba(29,53,87,0.75)',
            'rgba(231,111,81,0.35)',
            'rgba(244,162,97,0.15)',
          ]}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Ionicons name="basketball" size={72} color="#FFFFFF" />
            </View>

            <Text style={styles.title}>{t('auth.register')}</Text>

            {errorMsg ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {successMsg ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            ) : null}

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder={t('auth.email')}
                value={email}
                onChangeText={(text) => { setEmail(text); clearMessages(); }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                returnKeyType="next"
              />
              <TextInput
                style={styles.input}
                placeholder={t('auth.password')}
                value={password}
                onChangeText={(text) => { setPassword(text); clearMessages(); }}
                secureTextEntry
                autoComplete="new-password"
                returnKeyType="next"
              />
              <TextInput
                style={styles.input}
                placeholder={t('auth.confirm_password')}
                value={confirmPassword}
                onChangeText={(text) => { setConfirmPassword(text); clearMessages(); }}
                secureTextEntry
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />

              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? t('common.loading') : t('auth.register')}
                </Text>
              </TouchableOpacity>
            </View>

            <Link href="/(auth)/login" asChild>
              <TouchableOpacity style={styles.linkButton}>
                <Text style={styles.linkText}>{t('auth.has_account')}</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </LinearGradient>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1D3557',
  },
  background: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 32,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  errorBox: {
    backgroundColor: 'rgba(231,76,60,0.2)',
    borderWidth: 1,
    borderColor: '#E74C3C',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  errorText: {
    color: '#F5B7B1',
    fontSize: 14,
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: 'rgba(45,156,219,0.2)',
    borderWidth: 1,
    borderColor: '#2D9CDB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  successText: {
    color: '#A8E6FF',
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    gap: 14,
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 14,
    paddingHorizontal: 18,
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: '#FFFFFF',
  },
  button: {
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#E76F51',
    marginTop: 6,
    shadowColor: '#E76F51',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  linkButton: {
    marginTop: 28,
    alignItems: 'center',
  },
  linkText: {
    color: '#F4A261',
    fontSize: 16,
    fontWeight: '500',
  },
});