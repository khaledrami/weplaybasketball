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

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signInWithEmail, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMsg(null);
    if (!email || !password) {
      setErrorMsg(t('auth.fill_all'));
      return;
    }
    try {
      const error = await signInWithEmail(email, password);
      if (error) {
        setErrorMsg(error);
      }
    } catch (e: any) {
      setErrorMsg(e?.message ?? t('common.error'));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1200&h=1600&fit=crop' }}
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

            <Text style={styles.title}>{t('app_name')}</Text>
            <Text style={styles.subtitle}>{t('auth.login')}</Text>

            {errorMsg ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder={t('auth.email')}
                value={email}
                onChangeText={(text) => { setEmail(text); setErrorMsg(null); }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                returnKeyType="next"
              />
              <TextInput
                style={styles.input}
                placeholder={t('auth.password')}
                value={password}
                onChangeText={(text) => { setPassword(text); setErrorMsg(null); }}
                secureTextEntry
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />

              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? t('common.loading') : t('auth.login')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.googleButton]}>
                <Text style={styles.googleButtonText}>{t('auth.google')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.appleButton]}>
                <Text style={styles.appleButtonText}>{t('auth.apple')}</Text>
              </TouchableOpacity>
            </View>

            <Link href="/(auth)/register" asChild>
              <TouchableOpacity style={styles.linkButton}>
                <Text style={styles.linkText}>{t('auth.no_account')}</Text>
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
    marginBottom: 6,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 36,
    color: 'rgba(255,255,255,0.85)',
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
  googleButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  appleButton: {
    backgroundColor: '#FFFFFF',
  },
  appleButtonText: {
    color: '#1D3557',
    fontSize: 16,
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