export interface ComponentPermission {
  resourceId: number;
  permissionId: number;
}

export interface ComponentPermissions {
  [key: string]: ComponentPermission;
}

// Component permission mappings
export const componentPermissions: ComponentPermissions = {
  // Dashboard components
  'DashboardStats': {
    resourceId: 1, // dashboard
    permissionId: 2 // view
  },
  'DashboardCostBreakdown': {
    resourceId: 1, // dashboard
    permissionId: 2 // view
  },
  'DashboardDateRange': {
    resourceId: 1, // dashboard
    permissionId: 3 // edit
  },
  // Add more component mappings as needed
};

// Helper function to check if user has required permission
export const hasPermission = (
  userPermissions: any[],
  resourceId: number,
  permissionId: number
): boolean => {
  return userPermissions.some(
    (resource) =>
      resource.resource_id === resourceId &&
      resource.permissions.some(
        (permission: any) => permission.permission_id === permissionId
      )
  );
}; 