import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, StatusBar, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AppLogo from '../../components/AppLogo';
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn';
import AuthInfoLinks from '../../components/AuthInfoLinks';
import { isValidNepalPhone, NEPAL_PHONE_ERROR } from '../../utils/phoneValidation';

const COUNTRY_CODES = [
  { code: '+977', flag: '🇳🇵', name: 'Nepal' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
];

export default function RegisterScreen({ navigation }) {
  const { register, isLoading } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const { signInWithGoogle, googleLoading, googleReady } = useGoogleSignIn();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (e) {
      const msg = e.message || 'Google sign-up failed';
      if (msg.toLowerCase().includes('cancelled')) return;
      setError(msg);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (countryCode.code === '+977' && !isValidNepalPhone(phone)) {
      setError(NEPAL_PHONE_ERROR);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!agreed) {
      setError('Please agree to the Terms & Conditions');
      return;
    }
    setError('');
    try {
      await register(name, email, `${countryCode.code}${phone}`, password);
    } catch (e) {
      setError(e.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? colors.background : '#1a56db'} />

      {/* Country Picker Modal */}
      <Modal visible={showCountryPicker} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCountryPicker(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Select Country Code</Text>
            {COUNTRY_CODES.map((item) => (
              <TouchableOpacity
                key={item.code}
                style={[styles.pickerItem, countryCode.code === item.code && styles.pickerItemActive]}
                onPress={() => { setCountryCode(item); setShowCountryPicker(false); }}
              >
                <Text style={styles.pickerFlag}>{item.flag}</Text>
                <Text style={[styles.pickerName, { color: isDark ? colors.text : '#374151' }]}>{item.name}</Text>
                <Text style={[styles.pickerCode, { color: colors.primary }]}>{item.code}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

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
          <Text style={styles.logoTagline}>Create your account</Text>
        </LinearGradient>

        <View style={styles.formArea}>
          <Text style={styles.heading}>SIGNUP</Text>
          <Text style={styles.subheading}>Join thousands of happy customers</Text>

          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Full Name */}
          <View style={styles.fieldCard}>
            <View style={styles.labelRow}>
              <View style={styles.labelAccent} />
              <Text style={styles.fieldLabel}>Full Name</Text>
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter Full Name"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email */}
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

          {/* Phone */}
          <View style={styles.fieldCard}>
            <View style={styles.labelRow}>
              <View style={styles.labelAccent} />
              <Text style={styles.fieldLabel}>Phone No.</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TouchableOpacity style={styles.countryPicker} onPress={() => setShowCountryPicker(true)}>
                <Text style={styles.countryFlag}>{countryCode.flag}</Text>
                <Text style={[styles.countryCodeText, { color: isDark ? colors.text : '#374151' }]}>{countryCode.code}</Text>
                <Ionicons name="chevron-down" size={14} color="#9ca3af" />
              </TouchableOpacity>
              <View style={[styles.phoneDivider, { backgroundColor: isDark ? colors.border : '#e5e7eb' }]} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter Phone No."
                placeholderTextColor="#9ca3af"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldCard}>
            <View style={styles.labelRow}>
              <View style={styles.labelAccent} />
              <Text style={styles.fieldLabel}>Password</Text>
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Create a strong password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldCard}>
            <View style={styles.labelRow}>
              <View style={styles.labelAccent} />
              <Text style={styles.fieldLabel}>Confirm Password</Text>
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Confirm Password"
                placeholderTextColor="#9ca3af"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPass}
              />
              <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)} style={styles.eyeBtn}>
                <Ionicons name={showConfirmPass ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms */}
          <TouchableOpacity style={styles.termsRow} onPress={() => setAgreed(!agreed)}>
            <View style={[styles.checkbox, agreed && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
              {agreed && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={[styles.termsText, { color: isDark ? colors.textSecondary : '#6b7280' }]}>
              I agree to the{' '}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Terms & Conditions</Text>
              {' '}and{' '}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading || googleLoading}
            activeOpacity={0.85}
            style={[styles.registerBtn, (isLoading || googleLoading) && styles.btnDisabled]}
          >
            <Text style={styles.registerBtnText}>{isLoading ? 'Creating Account…' : 'Sign Up'}</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
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
            <Text style={styles.bottomText}>Already Member? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.bottomLink}>Sign In</Text>
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
    paddingBottom: 32,
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

  formArea: { paddingHorizontal: 20, paddingTop: 24 },
  heading: { fontSize: 26, fontWeight: '800', color: isDark ? COLORS.text : '#111827', marginBottom: 4 },
  subheading: { fontSize: 13, color: isDark ? COLORS.textSecondary : '#6b7280', marginBottom: 20 },

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

  countryPicker: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingRight: 8, paddingVertical: 10 },
  countryFlag: { fontSize: 20 },
  countryCodeText: { fontSize: 14, fontWeight: '600' },
  phoneDivider: { width: 1, height: 24, marginHorizontal: 8 },

  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 24, marginTop: 4 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginTop: 1,
  },
  termsText: { flex: 1, fontSize: 13, lineHeight: 20 },

  registerBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginBottom: 20,
  },
  registerBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
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

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  pickerSheet: {
    backgroundColor: isDark ? COLORS.surface : '#fff',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 40,
  },
  pickerTitle: { fontSize: 16, fontWeight: '700', color: isDark ? COLORS.text : '#111827', marginBottom: 16 },
  pickerItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 10 },
  pickerItemActive: { backgroundColor: isDark ? COLORS.primaryLight : '#eff6ff' },
  pickerFlag: { fontSize: 24 },
  pickerName: { flex: 1, fontSize: 15 },
  pickerCode: { fontSize: 15, fontWeight: '600' },
});
