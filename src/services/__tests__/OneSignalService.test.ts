import OneSignalService from '../OneSignalService';
import oneSignalApi from '../../api/oneSignalApi';
import { ProductNotificationData } from '../../types/Product';

// Mock react-native-config
jest.mock('react-native-config', () => ({
  ONESIGNAL_APP_ID: 'test-app-id-12345',
}));

// Mock oneSignalApi
jest.mock('../../api/oneSignalApi', () => ({
  sendNotification: jest.fn(),
}));

const mockOneSignalApi = oneSignalApi as jest.Mocked<typeof oneSignalApi>;

describe('OneSignalService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('showProductAddedNotification', () => {
    const mockProduct: ProductNotificationData = {
      _id: 'product-123',
      title: 'Amazing Product',
      price: 99.99,
      location: {
        name: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.0060,
      },
      images: [
        {
          url: 'image1.jpg',
          _id: 'img-1',
          fullUrl: 'https://example.com/image1.jpg',
        },
        {
          url: 'image2.jpg',
          _id: 'img-2',
          fullUrl: 'https://example.com/image2.jpg',
        },
      ],
    };

    // SNAPSHOT TESTS - for notification payload structures
    describe('Notification Payload Snapshots', () => {
      beforeEach(() => {
        const mockApiResponse = { id: 'test-id-123', recipients: 100 };
        mockOneSignalApi.sendNotification.mockResolvedValue(mockApiResponse);
      });

      it('should match snapshot for standard product notification payload', async () => {
        await OneSignalService.showProductAddedNotification(mockProduct);
        
        const sentPayload = mockOneSignalApi.sendNotification.mock.calls[0][0];
        expect(sentPayload).toMatchSnapshot('standard-product-notification');
      });

      it('should match snapshot for product without images', async () => {
        const productWithoutImages: ProductNotificationData = {
          ...mockProduct,
          images: [],
        };

        await OneSignalService.showProductAddedNotification(productWithoutImages);
        
        const sentPayload = mockOneSignalApi.sendNotification.mock.calls[0][0];
        expect(sentPayload).toMatchSnapshot('product-without-images');
      });

      it('should match snapshot for product with special characters', async () => {
        const specialProduct: ProductNotificationData = {
          ...mockProduct,
          title: 'Test & "Special" Product 🎉',
          location: {
            name: 'São Paulo, Brazil',
            latitude: -23.5505,
            longitude: -46.6333,
          },
        };

        await OneSignalService.showProductAddedNotification(specialProduct);
        
        const sentPayload = mockOneSignalApi.sendNotification.mock.calls[0][0];
        expect(sentPayload).toMatchSnapshot('product-with-special-characters');
      });

      it('should match snapshot for different price formats', async () => {
        const testProducts = [
          { ...mockProduct, price: 0 },
          { ...mockProduct, price: 10 },
          { ...mockProduct, price: 99.5 },
          { ...mockProduct, price: 1234.56 },
        ];

        const payloads = [];
        for (const product of testProducts) {
          await OneSignalService.showProductAddedNotification(product);
          payloads.push(mockOneSignalApi.sendNotification.mock.calls.pop()?.[0]);
        }

        expect(payloads).toMatchSnapshot('different-price-formats');
      });

      it('should match snapshot for single image product', async () => {
        const singleImageProduct: ProductNotificationData = {
          ...mockProduct,
          images: [{ 
            url: 'single.jpg',
            _id: 'img-single',
            fullUrl: 'https://example.com/single.jpg' 
          }],
        };

        await OneSignalService.showProductAddedNotification(singleImageProduct);
        
        const sentPayload = mockOneSignalApi.sendNotification.mock.calls[0][0];
        expect(sentPayload).toMatchSnapshot('single-image-product');
      });

      it('should match snapshot for edge case scenarios', async () => {
        const edgeCaseProducts = [
          // Empty title
          { ...mockProduct, title: '' },
          // Empty location
          { ...mockProduct, location: { name: '', latitude: 0, longitude: 0 } },
          // Very long title
          { ...mockProduct, title: 'This is a very long product title that exceeds normal length limits and should still be handled correctly by the notification system' },
          // Zero price
          { ...mockProduct, price: 0 },
        ];

        const payloads = [];
        for (const product of edgeCaseProducts) {
          await OneSignalService.showProductAddedNotification(product);
          payloads.push(mockOneSignalApi.sendNotification.mock.calls.pop()?.[0]);
        }

        expect(payloads).toMatchSnapshot('edge-case-scenarios');
      });
    });

    // SNAPSHOT TESTS - for service response structures
    describe('Service Response Snapshots', () => {
      it('should match snapshot for successful response', async () => {
        const mockApiResponse = {
          id: 'notification-id-123',
          recipients: 100,
        };
        mockOneSignalApi.sendNotification.mockResolvedValue(mockApiResponse);

        const result = await OneSignalService.showProductAddedNotification(mockProduct);
        expect(result).toMatchSnapshot('successful-service-response');
      });

      it('should match snapshot for failed responses', async () => {
        const failureScenarios = [
          // Empty ID
          { id: '', error: 'Invalid app ID' },
          // No ID
          { error: 'Authentication failed' },
        ];

        const results = [];
        for (const apiResponse of failureScenarios) {
          mockOneSignalApi.sendNotification.mockResolvedValue(apiResponse);
          const result = await OneSignalService.showProductAddedNotification(mockProduct);
          results.push(result);
        }

        expect(results).toMatchSnapshot('failed-service-responses');
      });

      it('should match snapshot for error handling scenarios', async () => {
        const errorScenarios = [
          new Error('Network request failed'),
          'Something went wrong',
          { code: 500, message: 'Server error' },
        ];

        const results = [];
        for (const error of errorScenarios) {
          mockOneSignalApi.sendNotification.mockRejectedValue(error);
          const result = await OneSignalService.showProductAddedNotification(mockProduct);
          results.push(result);
        }

        expect(results).toMatchSnapshot('error-handling-responses');
      });
    });

    // UNIT TESTS - for behavior and functionality
    describe('Service Behavior Tests', () => {
      describe('Successful Notifications', () => {
        it('should send notification successfully with all product data', async () => {
          const mockApiResponse = {
            id: 'notification-id-123',
            recipients: 100,
          };

          mockOneSignalApi.sendNotification.mockResolvedValue(mockApiResponse);

          const result = await OneSignalService.showProductAddedNotification(mockProduct);

          expect(result).toEqual({
            success: true,
            notificationId: 'notification-id-123',
            productId: 'product-123',
            productTitle: 'Amazing Product',
          });
        });

        it('should call oneSignalApi with correct payload structure', async () => {
          const mockApiResponse = { id: 'test-id' };
          mockOneSignalApi.sendNotification.mockResolvedValue(mockApiResponse);

          await OneSignalService.showProductAddedNotification(mockProduct);

          expect(mockOneSignalApi.sendNotification).toHaveBeenCalledWith({
            app_id: 'test-app-id-12345',
            included_segments: ['All'],
            headings: { en: 'New Product Added! 🎉' },
            contents: { en: 'Amazing Product - $99.99 in New York, NY' },
            data: {
              productId: 'product-123',
              productTitle: 'Amazing Product',
              type: 'product_added',
              price: '99.99',
              location: 'New York, NY',
            },
            buttons: [
              { id: 'view_product', text: 'View Product' },
              { id: 'dismiss', text: 'Dismiss' },
            ],
            big_picture: 'https://example.com/image1.jpg',
            ios_attachments: {
              product_image: 'https://example.com/image1.jpg'
            },
          });
        });

        it('should handle product with no images correctly', async () => {
          const productWithoutImages: ProductNotificationData = {
            ...mockProduct,
            images: [],
          };

          const mockApiResponse = { id: 'test-id' };
          mockOneSignalApi.sendNotification.mockResolvedValue(mockApiResponse);

          await OneSignalService.showProductAddedNotification(productWithoutImages);

          expect(mockOneSignalApi.sendNotification).toHaveBeenCalledWith(
            expect.objectContaining({
              big_picture: undefined,
              ios_attachments: undefined,
            })
          );
        });
      });

      describe('Failed Notifications', () => {
        it('should handle API failure with empty ID', async () => {
          const mockApiResponse = {
            id: '',
            error: 'Invalid app ID',
          };

          mockOneSignalApi.sendNotification.mockResolvedValue(mockApiResponse);

          const result = await OneSignalService.showProductAddedNotification(mockProduct);

          expect(result).toEqual({
            success: false,
            error: mockApiResponse,
          });
        });

        it('should handle network errors', async () => {
          const networkError = new Error('Network request failed');
          mockOneSignalApi.sendNotification.mockRejectedValue(networkError);

          const result = await OneSignalService.showProductAddedNotification(mockProduct);

          expect(result).toEqual({
            success: false,
            error: 'Network request failed',
          });
        });

        it('should handle non-Error exceptions', async () => {
          const stringError = 'Something went wrong';
          mockOneSignalApi.sendNotification.mockRejectedValue(stringError);

          const result = await OneSignalService.showProductAddedNotification(mockProduct);

          expect(result).toEqual({
            success: false,
            error: 'Something went wrong',
          });
        });
      });

      describe('Configuration and Payload Validation', () => {
        beforeEach(() => {
          const mockApiResponse = { id: 'test-id' };
          mockOneSignalApi.sendNotification.mockResolvedValue(mockApiResponse);
        });

        it('should include correct app_id from config', async () => {
          await OneSignalService.showProductAddedNotification(mockProduct);

          expect(mockOneSignalApi.sendNotification).toHaveBeenCalledWith(
            expect.objectContaining({
              app_id: 'test-app-id-12345',
            })
          );
        });

        it('should target all users with included_segments', async () => {
          await OneSignalService.showProductAddedNotification(mockProduct);

          expect(mockOneSignalApi.sendNotification).toHaveBeenCalledWith(
            expect.objectContaining({
              included_segments: ['All'],
            })
          );
        });

        it('should convert price to string in data', async () => {
          const productWithNumberPrice: ProductNotificationData = {
            ...mockProduct,
            price: 123.45,
          };

          await OneSignalService.showProductAddedNotification(productWithNumberPrice);

          expect(mockOneSignalApi.sendNotification).toHaveBeenCalledWith(
            expect.objectContaining({
              data: expect.objectContaining({
                price: '123.45', // Should be string
              }),
            })
          );
        });

        it('should include action buttons', async () => {
          await OneSignalService.showProductAddedNotification(mockProduct);

          expect(mockOneSignalApi.sendNotification).toHaveBeenCalledWith(
            expect.objectContaining({
              buttons: [
                { id: 'view_product', text: 'View Product' },
                { id: 'dismiss', text: 'Dismiss' },
              ],
            })
          );
        });
      });

      describe('Image Handling', () => {
        beforeEach(() => {
          const mockApiResponse = { id: 'test-id' };
          mockOneSignalApi.sendNotification.mockResolvedValue(mockApiResponse);
        });

        it('should use first image for big_picture and iOS attachments', async () => {
          await OneSignalService.showProductAddedNotification(mockProduct);

          expect(mockOneSignalApi.sendNotification).toHaveBeenCalledWith(
            expect.objectContaining({
              big_picture: 'https://example.com/image1.jpg',
              ios_attachments: {
                product_image: 'https://example.com/image1.jpg',
              },
            })
          );
        });

        it('should handle products with empty image array', async () => {
          const noImagesProduct: ProductNotificationData = {
            ...mockProduct,
            images: [],
          };

          await OneSignalService.showProductAddedNotification(noImagesProduct);

          expect(mockOneSignalApi.sendNotification).toHaveBeenCalledWith(
            expect.objectContaining({
              big_picture: undefined,
              ios_attachments: undefined,
            })
          );
        });
      });
    });
  });
});