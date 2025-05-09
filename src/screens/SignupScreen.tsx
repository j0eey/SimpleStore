import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../contexts/AuthContext';
import { fonts, colors } from '../theme/Theme';

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits'),
});

type SignupFormData = z.infer<typeof signupSchema>;

const SignupScreen = ({ navigation }: any) => {
  const { signup } = useAuth();
  const { control, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    const isSuccess = data.email !== '' && data.password !== '';
    if (isSuccess) {
      signup();
      navigation.navigate('Verification');
    } else {
      console.error('Signup failed');
    }
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <View style={styles.form}>
        {/* Name */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="Full Name"
              value={value}
              onChangeText={onChange}
              style={styles.input}
            />
          )}
        />
        {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

        {/* Email */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="Email"
              value={value}
              onChangeText={onChange}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

        {/* Password */}
        <View style={styles.passwordContainer}>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Password"
                value={value}
                onChangeText={onChange}
                style={styles.passwordInput}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            )}
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={togglePasswordVisibility}
          >
            <Text style={styles.eyeButtonText}>
              {showPassword ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

        {/* Phone */}
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="Phone Number"
              value={value}
              onChangeText={onChange}
              style={styles.input}
              keyboardType="phone-pad"
            />
          )}
        />
        {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        {/* Link to Login */}
        <Text style={styles.text}>
          Already have an account?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
            Login
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightHeader,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: fonts.Bold,
  },
  form: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeButton: {
    padding: 10,
  },
  eyeButtonText: {
    fontSize: 20,
  },
  error: {
    color: 'red',
    marginBottom: 8,
    marginLeft: 4,
    fontSize: 14,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: colors.lightHeader,
    fontSize: 18,
    fontWeight: '600',
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
    fontFamily: fonts.italic,
  },
  text: {
    textAlign: 'center',
    color: colors.darkHeader,
    marginTop: 20,
    fontSize: 16,
    fontFamily: fonts.light,
  },
});