import Config from 'react-native-config';
import oneSignalApi from '../api/oneSignalApi';
import { ProductNotificationData, NotificationResult } from "../types/Product";


class OneSignalService {
  private appId = Config.ONESIGNAL_APP_ID;

  /**
   * Send push notification to all users when a new product is added
   */
  async showProductAddedNotification(product: ProductNotificationData): Promise<NotificationResult> {
    try {
      const notificationPayload = {
        app_id: this.appId,
        included_segments: ['All'], // Send to all subscribed users
        headings: { en: 'New Product Added! 🎉' },
        contents: { en: `${product.title} - $${product.price} in ${product.location.name}` },
        data: {
          productId: product._id,
          productTitle: product.title,
          type: 'product_added',
          price: product.price.toString(),
          location: product.location.name,
        },
        buttons: [
          { id: 'view_product', text: 'View Product' },
          { id: 'dismiss', text: 'Dismiss' },
        ],
        big_picture: product.images.length > 0 ? product.images[0].fullUrl : undefined,
        ios_attachments: product.images.length > 0 ? {
          product_image: product.images[0].fullUrl
        } : undefined,
      };

      const result = await oneSignalApi.sendNotification(notificationPayload);

      if (result.id && result.id !== '') {
        return { 
          success: true, 
          notificationId: result.id,
          productId: product._id,
          productTitle: product.title
        };
      } else {
        return { success: false, error: result };
      }
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

export default new OneSignalService();