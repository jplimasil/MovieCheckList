import { User } from 'firebase/auth';
import { setAuthenticated } from '../services/authService';

export const handleAuthSuccess = async (userId: string): Promise<void> => {
  // Save the user ID to localStorage for fallback use
  localStorage.setItem('currentUserId', userId);
  
  // Update the authentication state
  await setAuthenticated(true);
  console.log("Autenticação bem-sucedida, redirecionando...");
  
  // Dispatch a custom event to notify other parts of the application
  window.dispatchEvent(new Event('authChange'));
};

export const formatAuthError = (error: any): string => {
  return error.message || 'Ocorreu um erro durante a autenticação.';
};
