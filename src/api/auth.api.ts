// Simulates a login API call
export const loginApi = async (email: string, password: string) => {
  // Checks if the provided credentials match the hardcoded values
  if (email === 'eurisko@gmail.com' && password === 'academy2025') {
    return { success: true }; // Successful login response
  } else {
    throw new Error('Invalid credentials'); // Throw error if credentials are wrong
  }
};

// Simulates a signup API call
export const signupApi = async (data: any) => {
  return { success: true }; // Always returns success for signup
};
