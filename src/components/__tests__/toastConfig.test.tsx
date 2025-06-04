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

describe('toastConfig - Snapshots', () => {
  // Sample props to test with
  const mockProps: BaseToastProps = {
    text1: 'Test Title',
    text2: 'Test Subtitle',
  };

  describe('success toast snapshots', () => {
    it('should match snapshot with basic props', () => {
      const SuccessToast = toastConfig.success;
      const { toJSON } = render(<SuccessToast {...mockProps} />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot with custom props', () => {
      const customProps: BaseToastProps = {
        text1: 'Custom Success Message',
        text2: 'Custom Success Subtitle',
      };

      const SuccessToast = toastConfig.success;
      const { toJSON } = render(<SuccessToast {...customProps} />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot with only text1', () => {
      const propsWithoutText2: BaseToastProps = {
        text1: 'Success Message Only',
      };

      const SuccessToast = toastConfig.success;
      const { toJSON } = render(<SuccessToast {...propsWithoutText2} />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('error toast snapshots', () => {
    it('should match snapshot with basic props', () => {
      const ErrorToast = toastConfig.error;
      const { toJSON } = render(<ErrorToast {...mockProps} />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot without text2', () => {
      const propsWithoutText2: BaseToastProps = {
        text1: 'Error Message',
      };

      const ErrorToast = toastConfig.error;
      const { toJSON } = render(<ErrorToast {...propsWithoutText2} />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('info toast snapshots', () => {
    it('should match snapshot with basic props', () => {
      const InfoToast = toastConfig.info;
      const { toJSON } = render(<InfoToast {...mockProps} />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot with long text', () => {
      const longTextProps: BaseToastProps = {
        text1: 'This is a very long title that should wrap to multiple lines and still be displayed correctly',
        text2: 'This is also a long subtitle for testing purposes',
      };

      const InfoToast = toastConfig.info;
      const { toJSON } = render(<InfoToast {...longTextProps} />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('edge cases snapshots', () => {
    it('should match snapshot with empty props', () => {
      const emptyProps: BaseToastProps = {};
      const SuccessToast = toastConfig.success;
      const { toJSON } = render(<SuccessToast {...emptyProps} />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot with undefined text props', () => {
      const undefinedTextProps: BaseToastProps = {
        text1: undefined,
        text2: undefined,
      };

      const SuccessToast = toastConfig.success;
      const { toJSON } = render(<SuccessToast {...undefinedTextProps} />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for all toast types with same props', () => {
      const testProps: BaseToastProps = {
        text1: 'Comparison Test',
        text2: 'All toast types',
      };

      // Snapshot all three types for comparison
      const SuccessToast = toastConfig.success;
      const ErrorToast = toastConfig.error;
      const InfoToast = toastConfig.info;

      const successResult = render(<SuccessToast {...testProps} />);
      const errorResult = render(<ErrorToast {...testProps} />);
      const infoResult = render(<InfoToast {...testProps} />);

      expect(successResult.toJSON()).toMatchSnapshot('success-toast');
      expect(errorResult.toJSON()).toMatchSnapshot('error-toast');
      expect(infoResult.toJSON()).toMatchSnapshot('info-toast');
    });
  });

  // Keep these unit tests as they test behavior, not rendering
  describe('toastConfig structure - Unit Tests', () => {
    it('should have all required toast types', () => {
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

      expect(React.isValidElement(SuccessComponent)).toBe(true);
      expect(React.isValidElement(ErrorComponent)).toBe(true);
      expect(React.isValidElement(InfoComponent)).toBe(true);
    });

    it('should not crash with empty or undefined props', () => {
      const emptyProps: BaseToastProps = {};
      const undefinedTextProps: BaseToastProps = {
        text1: undefined,
        text2: undefined,
      };

      expect(() => {
        render(<toastConfig.success {...emptyProps} />);
        render(<toastConfig.error {...undefinedTextProps} />);
        render(<toastConfig.info {...emptyProps} />);
      }).not.toThrow();
    });
  });
});