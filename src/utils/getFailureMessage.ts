export const getFailureMessage = (response: any): string => {
  if (!response) return 'Operation failed. Please try again!';

  if (typeof response === 'string') return response;

  if (response.data && typeof response.data.message === 'string') {
    return response.data.message;
  }

  if (typeof response.message === 'string') return response.message;

  return 'Operation failed. Please try again!';
};


export const getProductFailureMessage = (response: any): string => {
  if (!response) return 'Failed to fetch products. Please try again!';

  if (typeof response === 'string') return response;

  if (response.data && typeof response.data.message === 'string') {
    return response.data.message;
  }

  if (typeof response.message === 'string') return response.message;

  return 'Failed to fetch products. Please check your connection or try again later!';
};




export const getProductFailureCreationMessage = (response: any): string => {
  if (!response) return 'Failed to create your product. Please try again!';

  if (typeof response === 'string') return response;

  if (response.data && typeof response.data.message === 'string') {
    return response.data.message;
  }

  if (typeof response.message === 'string') return response.message;

  return 'Failed to create your product. Please check your connection or try again later!';
};


export const getProductDeleteFailureMessage = (response: any): string => {
  if (!response) return 'Failed to delete your product. Please try again!';

  if (typeof response === 'string') return response;

  if (response.data && typeof response.data.message === 'string') {
    return response.data.message;
  }

  if (typeof response.message === 'string') return response.message;

  return 'Failed to delete your product. Please check your connection or try again later!';
};


