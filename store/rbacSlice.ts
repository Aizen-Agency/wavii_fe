import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Resource {
  id: number;
  name: string;
  description: string;
  parent_resource_id: number | null;
  created_at: string;
  updated_at: string;
}

interface Permission {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface ResourcePermission {
  resource_id: number;
  resource_name: string;
  permissions: {
    permission_id: number;
    permission_name: string;
  }[];
}

interface User {
  user_id: number;
  email: string;
}

interface RBACState {
  resources: Resource[];
  permissions: Permission[];
  resourcePermissions: Record<number, number[]>; // Maps resourceId to array of permissionIds
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: RBACState = {
  resources: [],
  permissions: [],
  resourcePermissions: {},
  users: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchResources = createAsyncThunk(
  'rbac/fetchResources',
  async () => {
    const response = await axios.get('https://retell-demo-be-cfbda6d152df.herokuapp.com/agent-webhook/api/rbac/resources', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data;
  }
);

export const fetchPermissions = createAsyncThunk(
  'rbac/fetchPermissions',
  async () => {
    const response = await axios.get('https://retell-demo-be-cfbda6d152df.herokuapp.com/agent-webhook/api/rbac/permissions', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data;
  }
);

export const fetchResourcePermissions = createAsyncThunk(
  'rbac/fetchResourcePermissions',
  async (roleId: number) => {
    const response = await axios.get(`https://retell-demo-be-cfbda6d152df.herokuapp.com/agent-webhook/api/rbac/roles/${roleId}/resources`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data;
  }
);

export const assignPermission = createAsyncThunk(
  'rbac/assignPermission',
  async ({ roleId, resourceId, permissionId }: { roleId: number; resourceId: number; permissionId: number }) => {
    const response = await axios.post(
      `https://retell-demo-be-cfbda6d152df.herokuapp.com/agent-webhook/api/rbac/roles/${roleId}/resources/${resourceId}/permissions/${permissionId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      }
    );
    return { resourceId, permissionId };
  }
);

export const removePermission = createAsyncThunk(
  'rbac/removePermission',
  async ({ roleId, resourceId, permissionId }: { roleId: number; resourceId: number; permissionId: number }) => {
    const response = await axios.delete(
      `https://retell-demo-be-cfbda6d152df.herokuapp.com/agent-webhook/api/rbac/roles/${roleId}/resources/${resourceId}/permissions/${permissionId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      }
    );
    return { resourceId, permissionId };
  }
);

export const fetchRoleUsers = createAsyncThunk(
  'rbac/fetchRoleUsers',
  async (roleId: number) => {
    const response = await axios.get(`https://retell-demo-be-cfbda6d152df.herokuapp.com/agent-webhook/api/rbac/roles/${roleId}/users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data.users;
  }
);

export const assignUserToRole = createAsyncThunk(
  'rbac/assignUserToRole',
  async ({ roleId, email }: { roleId: number; email: string }) => {
    const response = await axios.post(
      `https://retell-demo-be-cfbda6d152df.herokuapp.com/agent-webhook/api/rbac/roles/${roleId}/assign-user`,
      { email },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      }
    );
    return response.data;
  }
);

export const removeUserFromRole = createAsyncThunk(
  'rbac/removeUserFromRole',
  async ({ userId, roleId }: { userId: number; roleId: number }) => {
    const response = await axios.delete(
      `https://retell-demo-be-cfbda6d152df.herokuapp.com/agent-webhook/api/rbac/users/${userId}/roles/${roleId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      }
    );
    return { userId, roleId };
  }
);

const rbacSlice = createSlice({
  name: 'rbac',
  initialState,
  reducers: {
    updateResourcePermissions: (state, action) => {
      const { resourceId, permissions } = action.payload;
      state.resourcePermissions[resourceId] = permissions;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Resources
      .addCase(fetchResources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.loading = false;
        state.resources = action.payload;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch resources';
      })
      // Fetch Permissions
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch permissions';
      })
      // Fetch Resource Permissions
      .addCase(fetchResourcePermissions.fulfilled, (state, action) => {
        const permissions = action.payload;
        permissions.forEach((perm: ResourcePermission) => {
          state.resourcePermissions[perm.resource_id] = perm.permissions.map(p => p.permission_id);
        });
      })
      // Assign Permission
      .addCase(assignPermission.fulfilled, (state, action) => {
        const { resourceId, permissionId } = action.payload;
        if (!state.resourcePermissions[resourceId]) {
          state.resourcePermissions[resourceId] = [];
        }
        if (!state.resourcePermissions[resourceId].includes(permissionId)) {
          state.resourcePermissions[resourceId].push(permissionId);
        }
      })
      // Remove Permission
      .addCase(removePermission.fulfilled, (state, action) => {
        const { resourceId, permissionId } = action.payload;
        if (state.resourcePermissions[resourceId]) {
          state.resourcePermissions[resourceId] = state.resourcePermissions[resourceId]
            .filter(id => id !== permissionId);
        }
      })
      // Fetch Role Users
      .addCase(fetchRoleUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoleUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchRoleUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      // Assign User to Role
      .addCase(assignUserToRole.fulfilled, (state, action) => {
        state.users.push({
          user_id: action.payload.user_id,
          email: action.payload.email
        });
      })
      // Remove User from Role
      .addCase(removeUserFromRole.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.user_id !== action.payload.userId);
      });
  },
});

export const { updateResourcePermissions } = rbacSlice.actions;
export default rbacSlice.reducer; 