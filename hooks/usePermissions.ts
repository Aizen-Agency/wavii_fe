import { useState, useEffect } from 'react';
import { Resource, hasPermission } from '@/config/permissions';
import { permissionService } from '@/services/permissionService';

export function usePermissions() {
  const [userPermissions, setUserPermissions] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setLoading(true);
        
        // If not authenticated, clear permissions and return
        if (!permissionService.isAuthenticated()) {
          permissionService.clearPermissions();
          setUserPermissions([]);
          setError(null);
          return;
        }

        // First try to get permissions from localStorage
        const storedPermissions = permissionService.getStoredPermissions();
        
        if (storedPermissions.length > 0) {
          setUserPermissions(storedPermissions);
        } else {
          // If no stored permissions, fetch from API
          const permissions = await permissionService.fetchUserPermissions();
          permissionService.storePermissions(permissions);
          setUserPermissions(permissions);
        }
        setError(null);
      } catch (err) {
        setError('Failed to load permissions');
        console.error('Error loading permissions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, []);

  const checkPermission = (resourceId: number, permissionId: number): boolean => {
    return hasPermission(userPermissions, resourceId, permissionId);
  };

  const refreshPermissions = async () => {
    try {
      setLoading(true);
      
      // If not authenticated, clear permissions and return
      if (!permissionService.isAuthenticated()) {
        permissionService.clearPermissions();
        setUserPermissions([]);
        setError(null);
        return;
      }

      const permissions = await permissionService.fetchUserPermissions();
      permissionService.storePermissions(permissions);
      setUserPermissions(permissions);
      setError(null);
    } catch (err) {
      setError('Failed to refresh permissions');
      console.error('Error refreshing permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearPermissions = () => {
    permissionService.clearPermissions();
    setUserPermissions([]);
  };

  return {
    userPermissions,
    loading,
    error,
    checkPermission,
    refreshPermissions,
    clearPermissions,
  };
} 