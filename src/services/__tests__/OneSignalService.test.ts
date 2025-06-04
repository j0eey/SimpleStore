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

      it('should handle different price formats', async () => {
        const testCases = [
          { price: 0, expected: '$0 in' },
          { price: 10, expected: '$10 in' },
          { price: 99.5, expected: '$99.5 in' },
          { price: 1234.56, expected: '$1234.56 in' },
        ];

        const mockApiResponse = { id: 'test-id' };
        mockOneSignalApi.sendNotification.mockResolvedValue(mockApiResponse);

        for (const testCase of testCases) {
          const product = { ...mockProduct, price: testCase.price };
          await OneSignalService.showProductAddedNotification(product);

          expect(mockOneSignalApi.sendNotification).toHaveBeenLastCalledWith(
            expect.objectContaining({
              contents: expect.objectContaining({
                en: expect.stringContaining(testCase.expected),
              }),
            })
          );
        }
      });

      it('should handle special characters in product title and location', async () => {
        const specialProduct: ProductNotificationData = {
          ...mockProduct,
          title: 'Test & "Special" Product 🎉',
          location: {
            name: 'São Paulo, Brazil',
            latitude: -23.5505,
            longitude: -46.6333,
          },
        };

        const mockApiResponse = { id: 'test-id' };
        mockOneSignalApi.sendNotification.mockResolvedValue(mockApiResponse);

        await OneSignalService.showProductAddedNotification(specialProduct);

        expect(mockOneSignalApi.sendNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            contents: {
              en: 'Test & "Special" Product 🎉 - $99.99 in São Paulo, Brazil',
            },
            data: expect.objectContaining({
              productTitle: 'Test & "Special" Product 🎉',
              location: 'São Paulo, Brazil',
            }),
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

      it('should handle API failure with no ID', async () => {
        const mockApiResponse = {
          error: 'Authentication failed',
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

      it('should handle object errors', async () => {
        const objectError = { code: 500, message: 'Server error' };
        mockOneSignalApi.sendNotification.mockRejectedValue(objectError);

        const result = await OneSignalService.showProductAddedNotification(mockProduct);

        expect(result).toEqual({
          success: false,
          error: '[object Object]', // JavaScript converts objects to this string
        });
      });
    });

    describe('Notification Payload Structure', () => {
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

      it('should have correct heading structure', async () => {
        await OneSignalService.showProductAddedNotification(mockProduct);

        expect(mockOneSignalApi.sendNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            headings: { en: 'New Product Added! 🎉' },
          })
        );
      });

      it('should include all required data fields', async () => {
        await OneSignalService.showProductAddedNotification(mockProduct);

        expect(mockOneSignalApi.sendNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            data: {
              productId: 'product-123',
              productTitle: 'Amazing Product',
              type: 'product_added',
              price: '99.99',
              location: 'New York, NY',
            },
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

      it('should handle single image correctly', async () => {
        const singleImageProduct: ProductNotificationData = {
          ...mockProduct,
          images: [{ 
            url: 'single.jpg',
            _id: 'img-single',
            fullUrl: 'https://example.com/single.jpg' 
          }],
        };

        await OneSignalService.showProductAddedNotification(singleImageProduct);

        expect(mockOneSignalApi.sendNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            big_picture: 'https://example.com/single.jpg',
            ios_attachments: {
              product_image: 'https://example.com/single.jpg',
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

    describe('Edge Cases', () => {
      beforeEach(() => {
        const mockApiResponse = { id: 'test-id' };
        mockOneSignalApi.sendNotification.mockResolvedValue(mockApiResponse);
      });

      it('should handle empty product title', async () => {
        const emptyTitleProduct: ProductNotificationData = {
          ...mockProduct,
          title: '',
        };

        await OneSignalService.showProductAddedNotification(emptyTitleProduct);

        expect(mockOneSignalApi.sendNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            contents: { en: ' - $99.99 in New York, NY' },
            data: expect.objectContaining({
              productTitle: '',
            }),
          })
        );
      });

      it('should handle empty location name', async () => {
        const emptyLocationProduct: ProductNotificationData = {
          ...mockProduct,
          location: { 
            name: '',
            latitude: 0,
            longitude: 0,
          },
        };

        await OneSignalService.showProductAddedNotification(emptyLocationProduct);

        expect(mockOneSignalApi.sendNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            contents: { en: 'Amazing Product - $99.99 in ' },
            data: expect.objectContaining({
              location: '',
            }),
          })
        );
      });

      it('should handle very long product titles', async () => {
        const longTitleProduct: ProductNotificationData = {
          ...mockProduct,
          title: 'This is a very long product title that exceeds normal length limits and should still be handled correctly by the notification system',
        };

        await OneSignalService.showProductAddedNotification(longTitleProduct);

        expect(mockOneSignalApi.sendNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              productTitle: longTitleProduct.title,
            }),
          })
        );
      });

      it('should handle zero price', async () => {
        const freeProd: ProductNotificationData = {
          ...mockProduct,
          price: 0,
        };

        await OneSignalService.showProductAddedNotification(freeProd);

        expect(mockOneSignalApi.sendNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            contents: { en: 'Amazing Product - $0 in New York, NY' },
            data: expect.objectContaining({
              price: '0',
            }),
          })
        );
      });
    });
  });
});