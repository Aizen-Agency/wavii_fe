import { createContext, useContext, ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Resource } from '@/config/permissions';

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