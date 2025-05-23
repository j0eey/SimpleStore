export const getSuccessMessage = (response: any): string => {
  if (!response) return 'Login Successful';

  if (typeof response === 'string') return response;

  if (response.data && typeof response.data.message === 'string') {
    return response.data.message;
  }

  if (typeof response.message === 'string') return response.message;

  return 'Login Successful';
};


export const getProductSuccessMessage = (response: any): string => {
  if (!response) return 'Product Upload Successful';

  if (typeof response === 'string') return response;

  if (response.data && typeof response.data.message === 'string') {
    return response.data.message;
  }

  if (typeof response.message === 'string') return response.message;

  return 'Product Upload Successful';
};
