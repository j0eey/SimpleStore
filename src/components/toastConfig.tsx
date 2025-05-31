import React from 'react';
import { BaseToast, ErrorToast, BaseToastProps } from 'react-native-toast-message';
import { colors } from '../theme/Theme';
import { fonts } from '../theme/Theme';

const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        zIndex: 9999,
        elevation: 9999,
        borderLeftColor: colors.SuccessToast,
        backgroundColor: colors.SuccessToast,
        minHeight: 60,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1NumberOfLines={3}
      text1Style={{
        fontSize: 15,
        fontFamily: fonts.semiBold,
        color: colors.background,
        flexWrap: 'wrap',
      }}
      text2Style={{
        fontSize: 12,
        fontFamily: fonts.semiBold,
        color: colors.background,
        flexWrap: 'wrap',
      }}
    />
  ),
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      style={{
        zIndex: 9999,
        elevation: 9999,
        borderLeftColor: colors.ErrorToast,
        backgroundColor: colors.ErrorToast,
        minHeight: 60,
      }}
      text1NumberOfLines={3}
      text1Style={{
        fontSize: 15,
        fontFamily: fonts.semiBold,
        color: colors.background,
        flexWrap: 'wrap',
      }}
    />
  ),
  info: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        zIndex: 9999,
        elevation: 9999,
        borderLeftColor: '#2196F3', // You can use a custom color or add InfoToast to your theme
        backgroundColor: '#2196F3',
        minHeight: 60,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1NumberOfLines={3}
      text1Style={{
        fontSize: 15,
        fontFamily: fonts.semiBold,
        color: colors.background,
        flexWrap: 'wrap',
      }}
      text2Style={{
        fontSize: 12,
        fontFamily: fonts.semiBold,
        color: colors.background,
        flexWrap: 'wrap',
      }}
    />
  ),
};

export default toastConfig;
