import Config from 'react-native-config';
import { OneSignalNotificationPayload, OneSignalApiResponse } from "../types/Product";


class OneSignalApi {
  private restApiKey = Config.ONESIGNAL_REST_API_KEY;
  private baseUrl = 'https://api.onesignal.com';

  /**
   * Send notification via OneSignal REST API
   */
  async sendNotification(payload: OneSignalNotificationPayload): Promise<OneSignalApiResponse> {
    const response = await fetch(`${this.baseUrl}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${this.restApiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`OneSignal API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }
}

export default new OneSignalApi();