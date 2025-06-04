import UniversalLinkingService from '../UniversalLinkingService';

// Mock react-native-config
jest.mock('react-native-config', () => ({
  API_BASE_URL: 'https://test-api.simplestore.com',
}));

// Mock react-native modules
jest.mock('react-native', () => ({
  Linking: {
    getInitialURL: jest.fn(),
    addEventListener: jest.fn(),
  },
}));

// Mock react-native-toast-message
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

// Mock getErrorMessage utility
jest.mock('../../utils/getErrorMessage', () => ({
  getLoginProductErrorMessage: jest.fn(() => 'Please login to view this product'),
}));

describe('UniversalLinkingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the service state before each test
    UniversalLinkingService.reset();
    UniversalLinkingService.clearPermanentlyHandledUrls();
  });

  // SNAPSHOT TESTS - for generated data structures and configurations
  describe('Configuration Snapshots', () => {
    it('should match snapshot for linking configuration', () => {
      const config = UniversalLinkingService.getLinkingConfig();
      expect(config).toMatchSnapshot('linking-configuration');
    });

    it('should match snapshot for various product URLs', () => {
      const productIds = [
        'ABC123',
        'product-456',
        '12345',
        'product-123_ABC',
        'PROD-789-XYZ',
      ];

      const urls = productIds.map(id => ({
        productId: id,
        shareUrl: UniversalLinkingService.generateProductShareUrl(id),
        apiUrl: UniversalLinkingService.getProductApiUrl(id),
      }));

      expect(urls).toMatchSnapshot('product-urls-collection');
    });

    it('should match snapshot for share content structures', () => {
      const testProducts = [
        { id: 'ABC123', title: 'Amazing Product' },
        { id: 'product-456', title: 'Special Product With Special Chars: & < > " \'' },
        { id: '12345', title: '' },
        { id: 'TEST-789', title: 'Very Long Product Title That Might Be Used In Real World Scenarios With Multiple Words And Description' },
        { id: 'SIMPLE', title: 'Simple' },
      ];

      const shareContents = testProducts.map(product => 
        UniversalLinkingService.generateShareContent(product)
      );

      expect(shareContents).toMatchSnapshot('share-content-structures');
    });

    it('should match snapshot for edge case URL generations', () => {
      const edgeCaseIds = [
        '', // empty
        'test-123_ABC!@#', // special characters
        'a'.repeat(50), // long ID
        '0000', // all zeros
        'product<script>', // potentially dangerous chars
      ];

      const edgeCaseResults = edgeCaseIds.map(id => ({
        input: id,
        shareUrl: UniversalLinkingService.generateProductShareUrl(id),
        apiUrl: UniversalLinkingService.getProductApiUrl(id),
      }));

      expect(edgeCaseResults).toMatchSnapshot('edge-case-url-generations');
    });
  });

  describe('URL Parsing Results Snapshots', () => {
    it('should match snapshot for valid URL parsing results', () => {
      const validUrls = [
        'https://test-api.simplestore.com/api/products/ABC123',
        'https://test-api.simplestore.com/api/products/product-456',
        'https://test-api.simplestore.com/api/products/ITEM_789',
        'https://test-api.simplestore.com/api/products/product-123_ABC',
      ];

      const parseResults = validUrls.map(url => ({
        url,
        productId: (UniversalLinkingService as any).parseProductUrl(url),
      }));

      expect(parseResults).toMatchSnapshot('valid-url-parsing-results');
    });

    it('should match snapshot for invalid URL parsing results', () => {
      const invalidUrls = [
        'https://other-domain.com/api/products/123',
        'https://test-api.simplestore.com/products/123',
        'https://test-api.simplestore.com/api/users/123',
        'https://test-api.simplestore.com/api/products/',
        'not-a-url',
        '',
        'https://test-api.simplestore.com/api/products/123/extra',
      ];

      const parseResults = invalidUrls.map(url => ({
        url,
        productId: (UniversalLinkingService as any).parseProductUrl(url),
      }));

      expect(parseResults).toMatchSnapshot('invalid-url-parsing-results');
    });
  });

  describe('Validation Results Snapshots', () => {
    it('should match snapshot for product ID validation results', () => {
      const testIds = [
        // Valid IDs
        'ABC123',
        'product-123',
        'item_456',
        '12345',
        'PROD-789-XYZ',
        'a1b2c3',
        // Invalid IDs
        '',
        '   ',
        'ab',
        '0000',
        'null',
        'NULL',
        'undefined',
        'UNDEFINED',
        'test',
        'TEST',
        'product<script>',
        'item>alert',
        'a'.repeat(51),
      ];

      const validationResults = testIds.map(id => ({
        productId: id,
        isValid: (UniversalLinkingService as any).isValidProductIdFormat(id),
      }));

      expect(validationResults).toMatchSnapshot('product-id-validation-results');
    });

    it('should match snapshot for null/undefined validation', () => {
      const nullUndefinedResults = [
        {
          input: null,
          isValid: (UniversalLinkingService as any).isValidProductIdFormat(null),
        },
        {
          input: undefined,
          isValid: (UniversalLinkingService as any).isValidProductIdFormat(undefined),
        },
      ];

      expect(nullUndefinedResults).toMatchSnapshot('null-undefined-validation');
    });
  });

  // UNIT TESTS - for behavior and functionality
  describe('URL Validation Behavior', () => {
    describe('isValidProductIdFormat', () => {
      it('should accept valid product IDs', () => {
        const validIds = [
          'ABC123',
          'product-123',
          'item_456',
          '12345',
          'PROD-789-XYZ',
          'a1b2c3',
        ];

        validIds.forEach(id => {
          const isValid = (UniversalLinkingService as any).isValidProductIdFormat(id);
          expect(isValid).toBe(true);
        });
      });

      it('should reject invalid product IDs', () => {
        const invalidIds = [
          '',
          '   ',
          'ab',
          '0000',
          'null',
          'NULL',
          'undefined',
          'UNDEFINED',
          'test',
          'TEST',
          'product<script>',
          'item>alert',
          'a'.repeat(51),
        ];

        invalidIds.forEach(id => {
          const isValid = (UniversalLinkingService as any).isValidProductIdFormat(id);
          expect(isValid).toBe(false);
        });
      });

      it('should handle null and undefined inputs', () => {
        const isValidNull = (UniversalLinkingService as any).isValidProductIdFormat(null);
        const isValidUndefined = (UniversalLinkingService as any).isValidProductIdFormat(undefined);
        
        expect(isValidNull).toBe(false);
        expect(isValidUndefined).toBe(false);
      });
    });

    describe('parseProductUrl', () => {
      it('should extract valid product IDs from URLs', () => {
        const testCases = [
          {
            url: 'https://test-api.simplestore.com/api/products/ABC123',
            expected: 'ABC123',
          },
          {
            url: 'https://test-api.simplestore.com/api/products/product-456',
            expected: 'product-456',
          },
          {
            url: 'https://test-api.simplestore.com/api/products/ITEM_789',
            expected: 'ITEM_789',
          },
        ];

        testCases.forEach(({ url, expected }) => {
          const result = (UniversalLinkingService as any).parseProductUrl(url);
          expect(result).toBe(expected);
        });
      });

      it('should return null for invalid URLs', () => {
        const invalidUrls = [
          'https://other-domain.com/api/products/123',
          'https://test-api.simplestore.com/products/123',
          'https://test-api.simplestore.com/api/users/123',
          'https://test-api.simplestore.com/api/products/',
          'https://test-api.simplestore.com/api/products',
          'not-a-url',
          '',
          'https://test-api.simplestore.com/api/products/123/extra',
        ];

        invalidUrls.forEach(url => {
          const result = (UniversalLinkingService as any).parseProductUrl(url);
          expect(result).toBeNull();
        });
      });

      it('should handle malformed URLs gracefully', () => {
        const malformedUrls = [
          'https://test-api.simplestore.com//api//products//123',
          'https://test-api.simplestore.com/api/products/123/',
          'https://test-api.simplestore.com/api/products/123?query=param',
        ];

        malformedUrls.forEach(url => {
          expect(() => {
            (UniversalLinkingService as any).parseProductUrl(url);
          }).not.toThrow();
        });
      });
    });
  });

  describe('URL Generation Behavior', () => {
    describe('generateProductShareUrl', () => {
      it('should generate correct product URLs', () => {
        const testCases = [
          { productId: 'ABC123', expected: 'https://test-api.simplestore.com/api/products/ABC123' },
          { productId: 'product-456', expected: 'https://test-api.simplestore.com/api/products/product-456' },
          { productId: '12345', expected: 'https://test-api.simplestore.com/api/products/12345' },
        ];

        testCases.forEach(({ productId, expected }) => {
          const result = UniversalLinkingService.generateProductShareUrl(productId);
          expect(result).toBe(expected);
        });
      });

      it('should handle special characters in product IDs', () => {
        const productId = 'product-123_ABC';
        const result = UniversalLinkingService.generateProductShareUrl(productId);
        expect(result).toBe('https://test-api.simplestore.com/api/products/product-123_ABC');
      });
    });

    describe('generateShareContent', () => {
      it('should generate correct share content', () => {
        const product = {
          id: 'ABC123',
          title: 'Amazing Product',
        };

        const result = UniversalLinkingService.generateShareContent(product);

        expect(result.title).toBe('Amazing Product');
        expect(result.url).toBe('https://test-api.simplestore.com/api/products/ABC123');
        expect(result.message).toContain('Amazing Product');
        expect(result.message).toContain('SimpleStore');
        expect(result.message).toContain(result.url);
      });

      it('should handle empty product title', () => {
        const product = {
          id: 'ABC123',
          title: '',
        };

        const result = UniversalLinkingService.generateShareContent(product);

        expect(result.title).toBe('');
        expect(result.url).toBe('https://test-api.simplestore.com/api/products/ABC123');
        expect(result.message).toContain(result.url);
      });

      it('should handle missing product title', () => {
        const product = {
          id: 'ABC123',
        } as any;

        const result = UniversalLinkingService.generateShareContent(product);

        expect(result.title).toBe('');
        expect(result.url).toBe('https://test-api.simplestore.com/api/products/ABC123');
      });
    });
  });

  describe('State Management Behavior', () => {
    describe('reset', () => {
      it('should clear all internal state', () => {
        // Set some state
        (UniversalLinkingService as any).pendingUrl = 'test-url';
        (UniversalLinkingService as any).pendingUrlTimestamp = Date.now();
        (UniversalLinkingService as any).isLoggingOut = true;
        (UniversalLinkingService as any).handledUrls.add('test-url');

        // Reset
        UniversalLinkingService.reset();

        // Check state is cleared
        expect((UniversalLinkingService as any).pendingUrl).toBeNull();
        expect((UniversalLinkingService as any).pendingUrlTimestamp).toBeNull();
        expect((UniversalLinkingService as any).isLoggingOut).toBe(false);
        expect((UniversalLinkingService as any).handledUrls.size).toBe(0);
      });
    });

    describe('onLogout', () => {
      it('should clear pending URL and set logout state', () => {
        // Set some state
        (UniversalLinkingService as any).pendingUrl = 'test-url';
        (UniversalLinkingService as any).pendingUrlTimestamp = Date.now();
        (UniversalLinkingService as any).handledUrls.add('test-url');

        // Trigger logout
        UniversalLinkingService.onLogout();

        // Check logout state
        expect((UniversalLinkingService as any).pendingUrl).toBeNull();
        expect((UniversalLinkingService as any).pendingUrlTimestamp).toBeNull();
        expect((UniversalLinkingService as any).isLoggingOut).toBe(true);
        expect((UniversalLinkingService as any).handledUrls.size).toBe(0);
      });
    });

    describe('clearPendingUrlManually', () => {
      it('should clear pending URL', () => {
        (UniversalLinkingService as any).pendingUrl = 'test-url';
        (UniversalLinkingService as any).pendingUrlTimestamp = Date.now();

        UniversalLinkingService.clearPendingUrlManually();

        expect((UniversalLinkingService as any).pendingUrl).toBeNull();
        expect((UniversalLinkingService as any).pendingUrlTimestamp).toBeNull();
      });
    });

    describe('clearPermanentlyHandledUrls', () => {
      it('should clear permanently handled URLs', () => {
        (UniversalLinkingService as any).permanentlyHandledUrls.add('test-url');
        
        UniversalLinkingService.clearPermanentlyHandledUrls();
        
        expect((UniversalLinkingService as any).permanentlyHandledUrls.size).toBe(0);
      });
    });
  });

  describe('URL Timeout Logic', () => {
    describe('isPendingUrlValid', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('should return false when no pending URL', () => {
        const isValid = (UniversalLinkingService as any).isPendingUrlValid();
        expect(isValid).toBe(false);
      });

      it('should return true for recent pending URL', () => {
        const now = Date.now();
        (UniversalLinkingService as any).pendingUrl = 'test-url';
        (UniversalLinkingService as any).pendingUrlTimestamp = now;

        jest.spyOn(Date, 'now').mockReturnValue(now + 1000);

        const isValid = (UniversalLinkingService as any).isPendingUrlValid();
        expect(isValid).toBe(true);
      });

      it('should return false for expired pending URL', () => {
        const now = Date.now();
        (UniversalLinkingService as any).pendingUrl = 'test-url';
        (UniversalLinkingService as any).pendingUrlTimestamp = now;

        const fiveMinutesPlusOne = 5 * 60 * 1000 + 1;
        jest.spyOn(Date, 'now').mockReturnValue(now + fiveMinutesPlusOne);

        const isValid = (UniversalLinkingService as any).isPendingUrlValid();
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty strings gracefully', () => {
      expect(() => {
        UniversalLinkingService.generateProductShareUrl('');
      }).not.toThrow();
    });

    it('should handle null/undefined inputs gracefully', () => {
      expect(() => {
        UniversalLinkingService.generateProductShareUrl(null as any);
        UniversalLinkingService.generateProductShareUrl(undefined as any);
      }).not.toThrow();
    });

    it('should handle special characters in URLs', () => {
      const productId = 'test-123_ABC!@#';
      const url = UniversalLinkingService.generateProductShareUrl(productId);
      expect(url).toContain(productId);
    });
  });

  describe('Configuration and Constants', () => {
    it('should return correct linking configuration', () => {
      const config = UniversalLinkingService.getLinkingConfig();

      expect(config.prefixes).toEqual(['https://test-api.simplestore.com']);
      expect(config.config.initialRouteName).toBe('Home');
      expect(config.config.screens.Home).toBe('home');
      expect(config.config.screens.ProductDetails.path).toBe('api/products/:id');
    });

    it('should expose API_BASE_URL', () => {
      const { API_BASE_URL } = require('../UniversalLinkingService');
      expect(API_BASE_URL).toBe('https://test-api.simplestore.com');
    });

    it('should have correct timeout constant', () => {
      const timeout = (UniversalLinkingService as any).PENDING_URL_TIMEOUT;
      expect(timeout).toBe(5 * 60 * 1000);
    });
  });
});