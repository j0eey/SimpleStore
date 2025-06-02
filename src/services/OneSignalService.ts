import Config from 'react-native-config';
import { ProductNotificationData } from "../types/Product";

class OneSignalService {
  private appId = Config.ONESIGNAL_APP_ID;
  private restApiKey = Config.ONESIGNAL_REST_API_KEY;

  /**
   * Send push notification to all users when a new product is added
   */
  async showProductAddedNotification(product: ProductNotificationData) {
    try {
      const notificationData = {
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

      const response = await fetch('https://api.onesignal.com/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${this.restApiKey}`,
        },
        body: JSON.stringify(notificationData),
      });

      const result = await response.json();

      if (response.ok && result.id && result.id !== '') {
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
      return { success: false, error: String(error) };
    }
  }
}

export default new OneSignalService();