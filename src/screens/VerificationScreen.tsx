import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../contexts/AuthContext';

const verificationSchema = z.object({
  code: z.string().length(4, 'Code must be exactly 4 digits'),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

const VerificationScreen = () => {
  const { verify } = useAuth(); 

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
  });

  const onSubmit = (data: VerificationFormData) => {
    // console.log('Verifying code:', data.code);
    verify();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Verification Code</Text>

      {/* Input Field */}
      <Controller
        control={control}
        name="code"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="4-digit code"
            value={value}
            onChangeText={onChange}
            style={styles.input}
            keyboardType="numeric"
            maxLength={4}
          />
        )}
      />
      {errors.code && <Text style={styles.error}>{errors.code.message}</Text>}

      {/* Custom Styled Verify Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? 'Verifying...' : 'Verify'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default VerificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 8,
    marginLeft: 4,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});