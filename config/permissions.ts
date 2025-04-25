import { Phone } from "lucide-react";

export interface Permission {
  permission_id: number;
  permission_name: string;
}

export interface Resource {
  resource_id: number;
  resource_name: string;
  permissions: Permission[];
}

export interface ComponentPermission {
  resourceId: number;
  permissionId: number;
}

export interface ComponentPermissions {
  [key: string]: ComponentPermission;
}

// Default user permissions structure
export const defaultUserPermissions: Resource[] = [
  {
    resource_id: 1,
    resource_name: "dashboard",
    permissions: [
      { permission_id: 2, permission_name: "view" },
      { permission_id: 3, permission_name: "edit" }
    ]
  },
  {
    resource_id: 2,
    resource_name: "users",
    permissions: [
      { permission_id: 2, permission_name: "view" }
    ]
  }
];

// Component permission mappings
export const componentPermissions: ComponentPermissions = {
  CreateAgent: { resourceId: 6, permissionId: 4 },
  Agent: { resourceId: 6, permissionId: 2 },
  DeleteAgent: { resourceId: 6, permissionId: 6 },
  EditAgent: { resourceId: 6, permissionId: 7 },
  CreateDashboard: { resourceId: 1, permissionId: 4 },
  Dashboard: { resourceId: 1, permissionId: 2 },
  DeleteDashboard: { resourceId: 1, permissionId: 6 },
  EditDashboard: { resourceId: 1, permissionId: 7 },
  CreateUsers: { resourceId: 2, permissionId: 4 },
  Users: { resourceId: 2, permissionId: 2 },
  DeleteUsers: { resourceId: 2, permissionId: 6 },
  EditUsers: { resourceId: 2, permissionId: 7 },
  CreateRoles: { resourceId: 3, permissionId: 4 },
  Roles: { resourceId: 3, permissionId: 2 },
  DeleteRoles: { resourceId: 3, permissionId: 6 },
  EditRoles: { resourceId: 3, permissionId: 7 },
  CreateResources: { resourceId: 4, permissionId: 4 },
  Resources: { resourceId: 4, permissionId: 2 },
  DeleteResources: { resourceId: 4, permissionId: 6 },
  EditResources: { resourceId: 4, permissionId: 7 },
  CreatePermissions: { resourceId: 5, permissionId: 4 },
  Permissions: { resourceId: 5, permissionId: 2 },
  DeletePermissions: { resourceId: 5, permissionId: 6 },
  EditPermissions: { resourceId: 5, permissionId: 7 },
  CreateVoice: { resourceId: 7, permissionId: 4 },
  Voice: { resourceId: 7, permissionId: 2 },
  DeleteVoice: { resourceId: 7, permissionId: 6 },
  EditVoice: { resourceId: 7, permissionId: 7 },
  CreateCallLogs: { resourceId: 8, permissionId: 4 },
  CallLogs: { resourceId: 8, permissionId: 2 },
  DeleteCallLogs: { resourceId: 8, permissionId: 6 },
  EditCallLogs: { resourceId: 8, permissionId: 7 },
  CreateStats: { resourceId: 9, permissionId: 4 },
  Stats: { resourceId: 9, permissionId: 2 },
  DeleteStats: { resourceId: 9, permissionId: 6 },
  EditStats: { resourceId: 9, permissionId: 7 },
  CreateKnowledgeBase: { resourceId: 10, permissionId: 4 },
  KnowledgeBase: { resourceId: 10, permissionId: 2 },
  DeleteKnowledgeBase: { resourceId: 10, permissionId: 6 },
  EditKnowledgeBase: { resourceId: 10, permissionId: 7 },
  CreateBatchCall: { resourceId: 11, permissionId: 4 },
  BatchCall: { resourceId: 11, permissionId: 2 },
  DeleteBatchCall: { resourceId: 11, permissionId: 6 },
  EditBatchCall: { resourceId: 11, permissionId: 7 },
  CreateCalendar: { resourceId: 12, permissionId: 4 },
  Calendar: { resourceId: 12, permissionId: 2 },
  DeleteCalendar: { resourceId: 12, permissionId: 6 },
  EditCalendar: { resourceId: 12, permissionId: 7 },
  CreateSubaccount: { resourceId: 14, permissionId: 4 },
  Subaccount: { resourceId: 14, permissionId: 2 },
  DeleteSubaccount: { resourceId: 14, permissionId: 6 },
  EditSubaccount: { resourceId: 14, permissionId: 7 },
  CreateLogo: { resourceId: 15, permissionId: 4 },
  Logo: { resourceId: 15, permissionId: 2 },
  DeleteLogo: { resourceId: 15, permissionId: 6 },
  EditLogo: { resourceId: 15, permissionId: 7 },
  CreateBooking: { resourceId: 18, permissionId: 4 },
  Booking: { resourceId: 18, permissionId: 2 },
  DeleteBooking: { resourceId: 18, permissionId: 6 },
  EditBooking: { resourceId: 18, permissionId: 7 },
  CreateNumbers: { resourceId: 13, permissionId: 4 },
  Numbers: { resourceId: 13, permissionId: 2 },
  DeleteNumbers: { resourceId: 13, permissionId: 6 },
  EditNumbers: { resourceId: 13, permissionId: 7 },
  CreateSchedule: { resourceId: 17, permissionId: 4 },
  Schedule: { resourceId: 17, permissionId: 2 },
  DeleteSchedule: { resourceId: 17, permissionId: 6 },
  EditSchedule: { resourceId: 17, permissionId: 7 },
  CreateTwilio: { resourceId: 16, permissionId: 4 },
  DeleteTwilio: { resourceId: 16, permissionId: 6 },
  EditTwilio: { resourceId: 16, permissionId: 7 },
};

// Helper function to check if user has required permission
export const hasPermission = (
  userPermissions: Resource[],
  resourceId: number,
  permissionId: number
): boolean => {
  return userPermissions.some(
    (resource) =>
      resource.resource_id === resourceId &&
      resource.permissions.some(
        (permission) => permission.permission_id === permissionId
      )
  );
};

// Helper function to initialize user permissions in localStorage
export const initializeUserPermissions = () => {
  if (!localStorage.getItem('userPermissions')) {
    localStorage.setItem('userPermissions', JSON.stringify(defaultUserPermissions));
  }
}; 