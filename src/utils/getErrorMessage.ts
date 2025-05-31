export const getErrorMessage = (error: any): string => {
  if (error.response?.data) {
    const data = error.response.data;

    if (typeof data === 'string') return data;
    if (typeof data.message === 'string') return data.message;
    if (typeof data.error === 'string') return data.error;
    if (typeof data.error === 'object' && data.error !== null) {
      return typeof data.error.message === 'string'
        ? data.error.message
        : JSON.stringify(data.error);
    }
  }

  if (error.message && !error.message.includes('status code')) {
    return error.message;
  }

  return 'An unexpected server error occurred. Please try again later.';
};

export const getProductErrorMessage = (error?: any): string => {
  if (!error) {
    return 'Product not found or an unexpected error occurred.';
  }

  if (error.response?.data) {
    const data = error.response.data;

    if (typeof data === 'string') return data;
    if (typeof data.message === 'string') return data.message;
    if (typeof data.error === 'string') return data.error;
    if (typeof data.error === 'object' && data.error !== null) {
      return typeof data.error.message === 'string'
        ? data.error.message
        : JSON.stringify(data.error);
    }
  }

  if (error.message && !error.message.includes('status code')) {
    return error.message;
  }

  return 'Product not found or an unexpected error occurred. Please try again later.';
};


export const getLoginProductErrorMessage = (error?: any): string => {
  if (!error) {
    return 'Cannot reach this page, please Login first';
  }

  if (error.response?.data) {
    const data = error.response.data;

    if (typeof data === 'string') return data;
    if (typeof data.message === 'string') return data.message;
    if (typeof data.error === 'string') return data.error;
    if (typeof data.error === 'object' && data.error !== null) {
      return typeof data.error.message === 'string'
        ? data.error.message
        : JSON.stringify(data.error);
    }
  }

  if (error.message && !error.message.includes('status code')) {
    return error.message;
  }

  return 'Cannot reach this page, please Login first';
};
