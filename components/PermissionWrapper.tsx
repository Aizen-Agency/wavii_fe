import { ReactNode } from 'react';
import { componentPermissions } from '@/config/permissions';
import { usePermissionContext } from '@/contexts/PermissionContext';

interface PermissionWrapperProps {
  componentName: string;
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode;
}

export default function PermissionWrapper({
  componentName,
  children,
  fallback = null,
  loadingFallback = null,
  errorFallback = null,
}: PermissionWrapperProps) {
  const { checkPermission, loading, error } = usePermissionContext();
  const componentPermission = componentPermissions[componentName];

  if (loading) {
    return <>{loadingFallback}</>;
  }

  if (error) {
    return <>{errorFallback}</>;
  }

  if (!componentPermission) {
    console.warn(`No permission configuration found for component: ${componentName}`);
    return <>{children}</>;
  }

  const hasAccess = checkPermission(
    componentPermission.resourceId,
    componentPermission.permissionId
  );

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
} 