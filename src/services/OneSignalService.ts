import { OneSignal } from 'react-native-onesignal';

export interface ProductNotificationData {
  _id: string;
  title: string;
  price: number;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  images: Array<{
    url: string;
    _id: string;
    fullUrl: string;
  }>;
}

class OneSignalService {
  private appId = '1a69ea62-a8dc-4df7-8000-1ba3c2f7fa55';
  private restApiKey = 'os_v2_app_dju6uyvi3rg7paaador4f572kwt4qynegw4uzdvubnzrvjb5frhldf2hdzfjakvyjoa7xxas4ykte4zlsfyhwiy253tj76tjaxmuj7q';

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