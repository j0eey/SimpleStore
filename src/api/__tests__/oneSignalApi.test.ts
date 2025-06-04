import oneSignalApi from '../oneSignalApi';
import { OneSignalNotificationPayload, OneSignalApiResponse } from '../../types/Product';

// Mock react-native-config
jest.mock('react-native-config', () => ({
  ONESIGNAL_REST_API_KEY: 'test-rest-api-key-12345',
}));

// Mock global fetch
const mockFetch = jest.fn();
(globalThis as any).fetch = mockFetch;

describe('OneSignalApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockNotificationPayload: OneSignalNotificationPayload = {
    app_id: 'test-app-id',
    included_segments: ['All'],
    headings: { en: 'Test Notification' },
    contents: { en: 'This is a test notification' },
    data: {
      productId: 'product-123',
      productTitle: 'Test Product',
      type: 'product_added',
      price: '99.99',
      location: 'New York, NY',
    },
    buttons: [
      { id: 'view_product', text: 'View Product' },
      { id: 'dismiss', text: 'Dismiss' },
    ],
    big_picture: 'https://example.com/image.jpg',
    ios_attachments: {
      product_image: 'https://example.com/image.jpg',
    },
  };

  const mockSuccessResponse: OneSignalApiResponse = {
    id: 'notification-id-123',
    recipients: 150,
    external_id: null,
  };

  // SNAPSHOT TESTS - for request payloads and response structures
  describe('Request Payload Snapshots', () => {
    beforeEach(() => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockSuccessResponse),
      };
      mockFetch.mockResolvedValue(mockResponse);
    });

    it('should match snapshot for standard notification payload', async () => {
      await oneSignalApi.sendNotification(mockNotificationPayload);
      
      const sentPayload = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(sentPayload).toMatchSnapshot('standard-notification-payload');
    });

    it('should match snapshot for minimal notification payload', async () => {
      const minimalPayload: OneSignalNotificationPayload = {
        app_id: 'test-app-id',
        included_segments: ['All'],
        headings: { en: 'Simple Notification' },
        contents: { en: 'Simple content' },
        data: {
          type: 'minimal_notification',
        },
      };

      await oneSignalApi.sendNotification(minimalPayload);
      
      const sentPayload = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(sentPayload).toMatchSnapshot('minimal-notification-payload');
    });

    it('should match snapshot for notification with custom data', async () => {
      const customDataPayload = {
        ...mockNotificationPayload,
        data: {
          customField1: 'value1',
          customField2: 'value2',
          userId: '12345',
          actionType: 'custom_action',
        },
      };

      await oneSignalApi.sendNotification(customDataPayload);
      
      const sentPayload = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(sentPayload).toMatchSnapshot('custom-data-notification-payload');
    });

    it('should match snapshot for notification without optional fields', async () => {
      const noOptionalPayload = {
        ...mockNotificationPayload,
        buttons: undefined,
        big_picture: undefined,
        ios_attachments: undefined,
      };

      await oneSignalApi.sendNotification(noOptionalPayload);
      
      const sentPayload = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(sentPayload).toMatchSnapshot('no-optional-fields-payload');
    });

    it('should match snapshot for notification with special characters', async () => {
      const specialCharsPayload = {
        ...mockNotificationPayload,
        headings: { en: 'Test 🎉 Special chars: & < > " \' \\' },
        contents: { en: 'Content with émojis 😀 and spëcial chârs' },
      };

      await oneSignalApi.sendNotification(specialCharsPayload);
      
      const sentPayload = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(sentPayload).toMatchSnapshot('special-characters-payload');
    });

    it('should match snapshot for request headers and config', async () => {
      await oneSignalApi.sendNotification(mockNotificationPayload);
      
      const requestConfig = mockFetch.mock.calls[0][1];
      const requestSnapshot = {
        method: requestConfig.method,
        headers: requestConfig.headers,
        url: mockFetch.mock.calls[0][0],
      };
      
      expect(requestSnapshot).toMatchSnapshot('request-configuration');
    });
  });

  describe('Response Structure Snapshots', () => {
    it('should match snapshot for successful response', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockSuccessResponse),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await oneSignalApi.sendNotification(mockNotificationPayload);
      expect(result).toMatchSnapshot('success-response');
    });

    it('should match snapshot for response with additional fields', async () => {
      const extendedResponse = {
        id: 'notification-id-123',
        recipients: 150,
        external_id: 'external-123',
        errors: null,
        warnings: [],
      };

      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(extendedResponse),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await oneSignalApi.sendNotification(mockNotificationPayload);
      expect(result).toMatchSnapshot('extended-response');
    });

    it('should match snapshot for response with errors', async () => {
      const errorResponse = {
        id: '',
        recipients: 0,
        errors: ['Invalid API key', 'Missing required field'],
      };

      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(errorResponse),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await oneSignalApi.sendNotification(mockNotificationPayload);
      expect(result).toMatchSnapshot('error-response');
    });
  });

  // UNIT TESTS - for behavior, error handling, and functionality
  describe('API Behavior Tests', () => {
    describe('Successful Requests', () => {
      it('should send notification successfully', async () => {
        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(mockSuccessResponse),
        };
        mockFetch.mockResolvedValue(mockResponse);

        const result = await oneSignalApi.sendNotification(mockNotificationPayload);

        expect(mockFetch).toHaveBeenCalledWith('https://api.onesignal.com/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Key test-rest-api-key-12345',
          },
          body: JSON.stringify(mockNotificationPayload),
        });

        expect(result).toEqual(mockSuccessResponse);
      });

      it('should use correct OneSignal API endpoint', async () => {
        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(mockSuccessResponse),
        };
        mockFetch.mockResolvedValue(mockResponse);

        await oneSignalApi.sendNotification(mockNotificationPayload);

        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.onesignal.com/notifications',
          expect.any(Object)
        );
      });

      it('should include correct headers', async () => {
        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(mockSuccessResponse),
        };
        mockFetch.mockResolvedValue(mockResponse);

        await oneSignalApi.sendNotification(mockNotificationPayload);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Key test-rest-api-key-12345',
            },
          })
        );
      });
    });

    describe('Error Handling', () => {
      it('should throw error for 400 Bad Request', async () => {
        const mockResponse = {
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: jest.fn(),
        };
        mockFetch.mockResolvedValue(mockResponse);

        await expect(oneSignalApi.sendNotification(mockNotificationPayload))
          .rejects.toThrow('OneSignal API error: 400 Bad Request');

        expect(mockResponse.json).not.toHaveBeenCalled();
      });

      it('should throw error for 401 Unauthorized', async () => {
        const mockResponse = {
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: jest.fn(),
        };
        mockFetch.mockResolvedValue(mockResponse);

        await expect(oneSignalApi.sendNotification(mockNotificationPayload))
          .rejects.toThrow('OneSignal API error: 401 Unauthorized');
      });

      it('should throw error for 429 Rate Limited', async () => {
        const mockResponse = {
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          json: jest.fn(),
        };
        mockFetch.mockResolvedValue(mockResponse);

        await expect(oneSignalApi.sendNotification(mockNotificationPayload))
          .rejects.toThrow('OneSignal API error: 429 Too Many Requests');
      });

      it('should throw error for 500 Internal Server Error', async () => {
        const mockResponse = {
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: jest.fn(),
        };
        mockFetch.mockResolvedValue(mockResponse);

        await expect(oneSignalApi.sendNotification(mockNotificationPayload))
          .rejects.toThrow('OneSignal API error: 500 Internal Server Error');
      });

      it('should handle network errors', async () => {
        const networkError = new Error('Network request failed');
        mockFetch.mockRejectedValue(networkError);

        await expect(oneSignalApi.sendNotification(mockNotificationPayload))
          .rejects.toThrow('Network request failed');
      });

      it('should handle JSON parsing errors', async () => {
        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        };
        mockFetch.mockResolvedValue(mockResponse);

        await expect(oneSignalApi.sendNotification(mockNotificationPayload))
          .rejects.toThrow('Invalid JSON');
      });

      it('should handle timeout errors', async () => {
        const timeoutError = new Error('Request timeout');
        mockFetch.mockRejectedValue(timeoutError);

        await expect(oneSignalApi.sendNotification(mockNotificationPayload))
          .rejects.toThrow('Request timeout');
      });
    });

    describe('Configuration and Validation', () => {
      it('should use REST API key from config', async () => {
        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(mockSuccessResponse),
        };
        mockFetch.mockResolvedValue(mockResponse);

        await oneSignalApi.sendNotification(mockNotificationPayload);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Key test-rest-api-key-12345',
            }),
          })
        );
      });

      it('should use POST method', async () => {
        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(mockSuccessResponse),
        };
        mockFetch.mockResolvedValue(mockResponse);

        await oneSignalApi.sendNotification(mockNotificationPayload);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            method: 'POST',
          })
        );
      });

      it('should handle very large payload', async () => {
        const largePayload = {
          ...mockNotificationPayload,
          contents: { 
            en: 'A'.repeat(1000), // Very long content
          },
          data: {
            ...mockNotificationPayload.data,
            largeField: 'B'.repeat(2000),
          },
        };

        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(mockSuccessResponse),
        };
        mockFetch.mockResolvedValue(mockResponse);

        const result = await oneSignalApi.sendNotification(largePayload);

        expect(result).toEqual(mockSuccessResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.onesignal.com/notifications',
          expect.objectContaining({
            body: expect.stringContaining('A'.repeat(100)), // Check partial content
          })
        );
      });
    });
  });
});