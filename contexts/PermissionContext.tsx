import { createContext, useContext, ReactNode, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Resource } from '@/config/permissions';
import { permissionService } from '@/services/permissionService';

interface PermissionContextType {
  userPermissions: Resource[];
  loading: boolean;
  error: string | null;
  checkPermission: (resourceId: number, permissionId: number) => boolean;
  refreshPermissions: () => Promise<void>;
  clearPermissions: () => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const permissions = usePermissions();

  // Add effect to refresh permissions when auth state changes
  useEffect(() => {
    const checkAuthAndRefresh = async () => {
      if (permissionService.isAuthenticated()) {
        await permissions.refreshPermissions();
      } else {
        permissions.clearPermissions();
      }
    };

    checkAuthAndRefresh();
  }, []);

  return (
    <PermissionContext.Provider value={permissions}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissionContext() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissionContext must be used within a PermissionProvider');
  }
  return context;
} 