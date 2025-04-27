import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { permissionService } from '@/services/permissionService';
import { usePermissionContext } from '@/contexts/PermissionContext';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { refreshPermissions } = usePermissionContext();

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setLoading(true);
      setError(null);

      // Call your login API
      const response = await fetch('https://retell-demo-be-cfbda6d152df.herokuapp.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Store the access token
      localStorage.setItem('access_token', data.access_token);

      // Fetch and store permissions using the service directly
      try {
        const permissions = await permissionService.fetchUserPermissions();
        permissionService.storePermissions(permissions);
      } catch (permissionError) {
        console.error('Error fetching permissions:', permissionError);
        // Don't throw here, as the login was successful
        // Just log the error and continue
      }

      // Redirect to dashboard or home page
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear token and permissions
    localStorage.removeItem('access_token');
    permissionService.clearPermissions();
    
    // Redirect to login page
    router.push('/login');
  };

  return {
    login,
    logout,
    loading,
    error,
  };
} 