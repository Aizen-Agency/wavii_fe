import axiosInstance from '@/utils/axios';
import { Resource } from '@/config/permissions';

export const permissionService = {
  // Fetch user permissions from API
  async fetchUserPermissions(): Promise<Resource[]> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return [];
    }

    try {
      const response = await axiosInstance.get('http://localhost:8080/api/rbac/roles/0/resources', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      throw error;
    }
  },

  // Store permissions in localStorage
  storePermissions(permissions: Resource[]): void {
    localStorage.setItem('userPermissions', JSON.stringify(permissions));
  },

  // Get permissions from localStorage
  getStoredPermissions(): Resource[] {
    const storedPermissions = localStorage.getItem('userPermissions');
    return storedPermissions ? JSON.parse(storedPermissions) : [];
  },

  // Clear permissions from localStorage (useful for logout)
  clearPermissions(): void {
    localStorage.removeItem('userPermissions');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}; 