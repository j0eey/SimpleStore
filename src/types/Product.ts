
export type Product = {
  location: {
    name: string;
    longitude: number;
    latitude: number;
  };
  _id: string;
  title: string;
  description: string;
  price: number;
  images: Array<{
    url: string;
    _id: string;
    fullUrl: string;
  }>;
  user: {
    _id: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export interface ApiResponse {
  success: boolean;
  data: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    totalItems: number;
    limit: number;
  };
}

export interface ProductImage {
  url: string;
  _id: string;
}


export interface ProductDeepLink {
  id: string;
  title?: string;
  price?: string;
  image?: string;
};

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

export interface OneSignalNotificationPayload {
  app_id: string;
  included_segments: string[];
  headings: { en: string };
  contents: { en: string };
  data: Record<string, any>;
  buttons?: Array<{ id: string; text: string }>;
  big_picture?: string;
  ios_attachments?: Record<string, string>;
}

export interface OneSignalApiResponse {
  id?: string;
  errors?: any;
  [key: string]: any;
}

export interface NotificationResult {
  success: boolean;
  notificationId?: string;
  productId?: string;
  productTitle?: string;
  error?: any;
}



