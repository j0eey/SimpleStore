export const loginApi = async (email: string, password: string) => {
    if (email === 'eurisko@gmail.com' && password === 'academy2025') {
      return { success: true };
    } else {
      throw new Error('Invalid credentials');
    }
  };
  
  export const signupApi = async (data: any) => {
    return { success: true };
  };
  