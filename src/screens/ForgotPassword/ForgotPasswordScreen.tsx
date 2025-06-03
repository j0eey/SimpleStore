import React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/types';
import { useForgotPassword } from './useForgotPassword';
import { MainContainer, FormHeader, EmailInput, SubmitButton, LoginLink} from './ForgotPasswordComponents';
import { FORGOT_PASSWORD_MESSAGES } from './constants';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

interface Props {
  navigation: ForgotPasswordScreenNavigationProp;
}

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  // Custom hook for all forgot password logic
  const {
    control,
    errors,
    loading,
    
    // Handlers
    onSubmit,
    handleLoginPress,
  } = useForgotPassword(navigation);

  return (
    <MainContainer>
      <FormHeader title={FORGOT_PASSWORD_MESSAGES.TITLE} />
      
      <EmailInput 
        control={control} 
        errors={errors} 
      />
      
      <SubmitButton 
        onPress={onSubmit} 
        loading={loading} 
      />
      
      <LoginLink onPress={handleLoginPress} />
    </MainContainer>
  );
};

export default ForgotPasswordScreen;