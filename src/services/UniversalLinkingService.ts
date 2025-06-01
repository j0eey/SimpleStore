import { Linking } from 'react-native';
import { NavigationContainerRef } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { ProductDeepLink } from '../types/Product';
import { getLoginProductErrorMessage } from '../utils/getErrorMessage';
import Config from 'react-native-config';

export const API_BASE_URL = Config.API_BASE_URL;

class UniversalLinkingService {
  private navigationRef: NavigationContainerRef<any> | null = null;
  private handledUrls = new Set<string>();
  private urlListener: { remove: () => void } | null = null;
  private pendingUrl: string | null = null;
  private pendingUrlTimestamp: number | null = null;
  private permanentlyHandledUrls = new Set<string>();
  private isLoggingOut = false;
  private readonly PENDING_URL_TIMEOUT = 5 * 60 * 1000;

  // React Navigation linking configuration - only API URLs
  public linking = {
    prefixes: [API_BASE_URL],
    config: {
      initialRouteName: 'Home' as const,
      screens: {
        Home: 'home',
        ProductDetails: {
          path: 'api/products/:id',
          parse: {
            id: (id: string) => id,
          },
        },
      },
    },
  };

  setNavigationRef(ref: NavigationContainerRef<any>) {
    this.navigationRef = ref;
  }

  async initialize(isAuthenticated: boolean) {
    const initialUrl = await Linking.getInitialURL();

    if (initialUrl && !this.permanentlyHandledUrls.has(initialUrl)) {
      this.handleUniversalLink(initialUrl, isAuthenticated);
    }

    this.urlListener = Linking.addEventListener('url', (event) => {
      this.handleUniversalLink(event.url, isAuthenticated);
    });

    return this.urlListener;
  }

  removeListener() {
    if (this.urlListener) {
      this.urlListener.remove();
      this.urlListener = null;
    }
  }

  reset() {
    this.handledUrls.clear();
    this.pendingUrl = null;
    this.pendingUrlTimestamp = null;
    this.isLoggingOut = false;
  }

  onLogout() {
    this.pendingUrl = null;
    this.pendingUrlTimestamp = null;
    this.isLoggingOut = true;
    this.handledUrls.clear();
  }

  private isPendingUrlValid(): boolean {
    if (!this.pendingUrl || !this.pendingUrlTimestamp) {
      return false;
    }
    
    const now = Date.now();
    return (now - this.pendingUrlTimestamp) < this.PENDING_URL_TIMEOUT;
  }

  private clearPendingUrl() {
    this.pendingUrl = null;
    this.pendingUrlTimestamp = null;
  }

  private async navigateWithCallback(routeName: string, params: any): Promise<void> {
    if (!this.navigationRef) {
      return;
    }

    try {
      this.navigationRef.navigate(routeName, params);
      
      setTimeout(() => {
        const currentRoute = this.navigationRef?.getCurrentRoute();
        if (currentRoute?.name === routeName) {
          this.clearPendingUrl();
        }
      }, 100);
    } catch (error) {
    }
  }

  updateAuthenticationState(isAuthenticated: boolean) {
    if (!isAuthenticated) {
      if (this.isLoggingOut) {
        this.clearPendingUrl();
      }
    } else {
      this.isLoggingOut = false;
      
      if (this.pendingUrl && this.isPendingUrlValid()) {
        this.handleUniversalLink(this.pendingUrl, isAuthenticated);
      } else {
        this.clearPendingUrl();
      }
    }
  }

  private isValidProductIdFormat(productId: string): boolean {
    if (!productId || productId.trim() === '') {
      return false;
    }
    
    if (productId.length < 3 || productId.length > 50) {
      return false;
    }
    
    const invalidPatterns = [
      /^0+$/, 
      /^null$/i,
      /^undefined$/i, 
      /^test$/i, 
      /[<>]/g,
    ];
    
    return !invalidPatterns.some(pattern => pattern.test(productId));
  }

  private parseProductUrl(url: string): string | null {
    try {
      if (!url.startsWith(API_BASE_URL)) {
        return null;
      }

      // Extract path by removing the API base URL
      const path = url.replace(API_BASE_URL, '');
      const pathParts = path.split('/').filter(Boolean);
      
      // Check if it's a product API path: /api/products/{id}
      if (pathParts.length === 3 && pathParts[0] === 'api' && pathParts[1] === 'products' && pathParts[2]) {
        return pathParts[2];
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  private handleUniversalLink(url: string, isAuthenticated: boolean) {
    if (this.handledUrls.has(url)) {
      return;
    }

    if (!this.navigationRef) {
      return;
    }

    if (!this.navigationRef.isReady()) {
      setTimeout(() => this.handleUniversalLink(url, isAuthenticated), 100);
      return;
    }

    const productId = this.parseProductUrl(url);

    if (productId) {
      if (!this.isValidProductIdFormat(productId)) {
        Toast.show({
          type: 'error',
          text1: 'Invalid Product Link',
          text2: 'This product link appears to be malformed.',
        });
        return;
      }

      if (!isAuthenticated) {
        this.pendingUrl = url;
        this.pendingUrlTimestamp = Date.now();
        
        if (this.isLoggingOut) {
          return;
        }
        
        if (!this.permanentlyHandledUrls.has(url)) {
          const errorMessage = getLoginProductErrorMessage();
          Toast.show({
            type: 'error',
            text1: errorMessage,
          });
          this.permanentlyHandledUrls.add(url);
        }
        return;
      }

      this.handledUrls.add(url);
      this.permanentlyHandledUrls.add(url);

      this.navigateWithCallback('ProductDetails', {
        id: productId,
      });
    }
  }

  generateProductShareUrl(productId: string): string {
    return `${API_BASE_URL}/api/products/${productId}`;
  }

  generateShareContent(product: ProductDeepLink): {
    title: string;
    message: string;
    url: string;
  } {
    const url = this.generateProductShareUrl(product.id);
    return {
      title: product.title || '',
      message: `${product.title}\nI discovered an amazing product on SimpleStore, come check it out!: ${url}`,
      url,
    };
  }

  getLinkingConfig() {
    return this.linking;
  }

  public clearPendingUrlManually() {
    this.clearPendingUrl();
  }

  public clearPermanentlyHandledUrls() {
    this.permanentlyHandledUrls.clear();
  }

  public getProductApiUrl(productId: string): string {
    return `${API_BASE_URL}/api/products/${productId}`;
  }
}

export default new UniversalLinkingService();