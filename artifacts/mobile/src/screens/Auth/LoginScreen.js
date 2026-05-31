import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Animated, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AppLogo from '../../components/AppLogo';
import { USE_NATIVE_DRIVER } from '../../utils/animation';
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn';
import AuthInfoLinks from '../../components/AuthInfoLinks';

export default function LoginScreen({ navigation }) {
  const { login, isLoading } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const { signInWithGoogle, googleLoading, googleReady } = useGoogleSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start();
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (e) {
      const msg = e.message || 'Google sign-in failed';
      if (msg.toLowerCase().includes('cancelled') || msg.toLowerCase().includes('popup')) return;
      if (msg.includes('unauthorized-domain') || msg.includes('auth/unauthorized-domain')) {
        setError('Google sign-in is blocked on this preview domain.\nUse Email/Password login instead.');
      } else {
        setError(msg);
      }
      shake();
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      shake();
      return;
    }
    setError('');
    try {
      await login(email, password);
    } catch (e) {
      setError(e.message || 'Invalid credentials. Please try again.');
      shake();
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? colors.background : '#f0f2f8'} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo hero area */}
        <LinearGradient colors={isDark ? [colors.surface, colors.background] : ['#1a56db', '#3b82f6']} style={styles.logoArea}>
          <View style={styles.logoBox}>
            <AppLogo size="hero" />
          </View>
          <Text style={styles.logoTagline}>Home Services Nepal</Text>
        </LinearGradient>

        <View style={styles.formArea}>
          <Text style={styles.heading}>LOGIN</Text>
          <Text style={styles.subheading}>Welcome back! Sign in to continue</Text>

          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            {!!error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.fieldCard}>
              <View style={styles.labelRow}>
                <View style={styles.labelAccent} />
                <Text style={styles.fieldLabel}>Email</Text>
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter Email"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            <View style={styles.fieldCard}>
              <View style={styles.labelRow}>
                <View style={styles.labelAccent} />
                <Text style={styles.fieldLabel}>Password</Text>
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Enter Password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  autoComplete="password"
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading || googleLoading}
            activeOpacity={0.85}
            style={[styles.loginBtn, (isLoading || googleLoading) && styles.btnDisabled]}
          >
            <Text style={styles.loginBtnText}>{isLoading ? 'Signing in…' : 'Login'}</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.googleBtn, (!googleReady || googleLoading) && styles.btnDisabled]}
            onPress={handleGoogle}
            disabled={!googleReady || googleLoading || isLoading}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-google" size={20} color="#EA4335" />
            <Text style={styles.googleBtnText}>
              {googleLoading ? 'Connecting…' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Not Member? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.bottomLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <AuthInfoLinks navigation={navigation} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (COLORS, isDark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDark ? COLORS.background : '#f0f2f8' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  logoArea: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  logoBox: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.18)',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  logoTagline: {
    fontSize: 14,
    color: isDark ? COLORS.textSecondary : 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  formArea: { paddingHorizontal: 20, paddingTop: 28 },

  heading: { fontSize: 26, fontWeight: '800', color: isDark ? COLORS.text : '#111827', marginBottom: 4 },
  subheading: { fontSize: 13, color: isDark ? COLORS.textSecondary : '#6b7280', marginBottom: 24 },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: isDark ? '#450a0a' : '#fef2f2',
    borderRadius: 12, padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: isDark ? COLORS.danger : '#fecaca',
  },
  errorText: { color: COLORS.danger, fontSize: 13, flex: 1 },

  fieldCard: {
    backgroundColor: isDark ? COLORS.surface : '#ffffff',
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    ...(Platform.OS !== 'web' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.06,
      shadowRadius: 6,
      elevation: 2,
    } : {}),
  },
  labelRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: isDark ? COLORS.surfaceAlt : '#f3f4f6',
    paddingVertical: 10, paddingHorizontal: 14,
  },
  labelAccent: { width: 4, height: 18, borderRadius: 2, backgroundColor: COLORS.primary, marginRight: 10 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: isDark ? COLORS.text : '#374151' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: isDark ? COLORS.surface : '#ffffff',
    paddingHorizontal: 14, paddingVertical: 2,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 13, fontSize: 15, color: isDark ? COLORS.text : '#1f2937' },
  eyeBtn: { padding: 6 },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24, marginTop: 2 },
  forgotText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },

  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginBottom: 20,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: isDark ? COLORS.border : '#e5e7eb' },
  dividerText: { color: COLORS.textSecondary, fontSize: 13 },

  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: isDark ? COLORS.surface : '#fff',
    borderWidth: 1.5, borderColor: isDark ? COLORS.border : '#e5e7eb',
    borderRadius: 14, paddingVertical: 14, marginBottom: 28,
  },
  googleBtnText: { fontSize: 15, fontWeight: '600', color: isDark ? COLORS.text : '#374151' },

  bottomRow: { flexDirection: 'row', justifyContent: 'center' },
  bottomText: { color: isDark ? COLORS.textSecondary : '#6b7280', fontSize: 14 },
  bottomLink: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});
