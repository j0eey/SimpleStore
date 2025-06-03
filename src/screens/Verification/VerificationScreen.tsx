import React from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/types';
import { useVerification } from './useVerification';
import { MainContainer, VerificationTitle, VerificationForm } from './VerificationComponents';

type VerificationScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Verification'>;
};

const VerificationScreen = ({ navigation }: VerificationScreenProps) => {
  const {
    form,
    isSubmitting,
    cooldown,
    theme,
    handleResendOTP,
    onSubmit,
  } = useVerification(navigation);

  return (
    <MainContainer theme={theme}>
      <VerificationTitle theme={theme} />
      
      <VerificationForm
        control={form.control}
        errors={form.formState.errors}
        isSubmitting={isSubmitting}
        cooldown={cooldown}
        onSubmit={form.handleSubmit(onSubmit)}
        onResend={handleResendOTP}
        theme={theme}
      />
    </MainContainer>
  );
};

export default VerificationScreen;