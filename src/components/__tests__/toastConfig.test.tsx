import React from 'react';
import { render } from '@testing-library/react-native';
import toastConfig from '../toastConfig';
import { BaseToastProps } from 'react-native-toast-message';

// Mock the theme imports since they come from external files
jest.mock('../../theme/Theme', () => ({
  colors: {
    SuccessToast: '#4CAF50',
    ErrorToast: '#F44336',
    background: '#FFFFFF',
  },
  fonts: {
    semiBold: 'Arial-SemiBold',
  },
}));

describe('toastConfig', () => {
  // Sample props to test with
  const mockProps: BaseToastProps = {
    text1: 'Test Title',
    text2: 'Test Subtitle',
  };

  describe('success toast', () => {
    it('should render success toast with correct props', () => {
      const SuccessToast = toastConfig.success;
      const { getByText } = render(<SuccessToast {...mockProps} />);
      
      // Check if the text is rendered
      expect(getByText('Test Title')).toBeTruthy();
      expect(getByText('Test Subtitle')).toBeTruthy();
    });

    it('should render success toast component', () => {
      const SuccessToast = toastConfig.success;
      const { getByText } = render(<SuccessToast {...mockProps} />);
      
      // Check if the text content is rendered (which means the component works)
      expect(getByText('Test Title')).toBeTruthy();
    });

    it('should handle props correctly', () => {
      const customProps: BaseToastProps = {
        text1: 'Custom Success Message',
        text2: 'Custom Success Subtitle',
      };

      const SuccessToast = toastConfig.success;
      const { getByText } = render(<SuccessToast {...customProps} />);
      
      expect(getByText('Custom Success Message')).toBeTruthy();
      expect(getByText('Custom Success Subtitle')).toBeTruthy();
    });
  });

  describe('error toast', () => {
    it('should render error toast with correct props', () => {
      const ErrorToast = toastConfig.error;
      const { getByText } = render(<ErrorToast {...mockProps} />);
      
      expect(getByText('Test Title')).toBeTruthy();
    });

    it('should handle error toast without text2', () => {
      const propsWithoutText2: BaseToastProps = {
        text1: 'Error Message',
      };

      const ErrorToast = toastConfig.error;
      const { getByText, queryByText } = render(<ErrorToast {...propsWithoutText2} />);
      
      expect(getByText('Error Message')).toBeTruthy();
      // Since text2 is not provided, it shouldn't appear
      expect(queryByText('Test Subtitle')).toBeNull();
    });
  });

  describe('info toast', () => {
    it('should render info toast with correct props', () => {
      const InfoToast = toastConfig.info;
      const { getByText } = render(<InfoToast {...mockProps} />);
      
      expect(getByText('Test Title')).toBeTruthy();
      expect(getByText('Test Subtitle')).toBeTruthy();
    });

    it('should handle long text correctly', () => {
      const longTextProps: BaseToastProps = {
        text1: 'This is a very long title that should wrap to multiple lines and still be displayed correctly',
        text2: 'This is also a long subtitle for testing purposes',
      };

      const InfoToast = toastConfig.info;
      const { getByText } = render(<InfoToast {...longTextProps} />);
      
      expect(getByText(longTextProps.text1!)).toBeTruthy();
      expect(getByText(longTextProps.text2!)).toBeTruthy();
    });
  });

  describe('toastConfig structure', () => {
    it('should have all required toast types', () => {
      // Test that the config object has the expected structure
      expect(toastConfig).toHaveProperty('success');
      expect(toastConfig).toHaveProperty('error');
      expect(toastConfig).toHaveProperty('info');
    });

    it('should have functions as values for each toast type', () => {
      expect(typeof toastConfig.success).toBe('function');
      expect(typeof toastConfig.error).toBe('function');
      expect(typeof toastConfig.info).toBe('function');
    });

    it('should return valid React components', () => {
      const SuccessComponent = toastConfig.success(mockProps);
      const ErrorComponent = toastConfig.error(mockProps);
      const InfoComponent = toastConfig.info(mockProps);

      // Check that they return valid React elements
      expect(React.isValidElement(SuccessComponent)).toBe(true);
      expect(React.isValidElement(ErrorComponent)).toBe(true);
      expect(React.isValidElement(InfoComponent)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty props gracefully', () => {
      const emptyProps: BaseToastProps = {};

      const SuccessToast = toastConfig.success;
      
      // Should not crash even with minimal props
      expect(() => {
        render(<SuccessToast {...emptyProps} />);
      }).not.toThrow();
    });

    it('should handle undefined text1 and text2', () => {
      const undefinedTextProps: BaseToastProps = {
        text1: undefined,
        text2: undefined,
      };

      const SuccessToast = toastConfig.success;
      
      expect(() => {
        render(<SuccessToast {...undefinedTextProps} />);
      }).not.toThrow();
    });
  });
});