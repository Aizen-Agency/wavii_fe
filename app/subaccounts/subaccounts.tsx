import { Users, UserPlus, ChevronDown, ChevronRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useDispatch, useSelector } from "react-redux"
import { fetchSubAccounts, updateSubAccount, deleteSubAccount, createSubAccount } from "@/store/authSlice"
import { fetchResources, fetchPermissions, assignPermission, removePermission, fetchResourcePermissions, fetchRoleUsers, assignUserToRole, removeUserFromRole } from "@/store/rbacSlice"
import type { Resource } from "@/store/rbacSlice"
import { useState, useEffect } from "react"
import { AppDispatch, RootState } from "@/store/store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SubAccount {
  id: number;
  name: string;  // This will be our "name"
  description: string;   // We'll need to add this field
  created_at: string;
}

export default function SubAccountsDashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const subaccounts = useSelector((state: RootState) => state.auth.subaccounts)
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
  });
  const [selectedAccount, setSelectedAccount] = useState<SubAccount | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<SubAccount | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const resources = useSelector((state: RootState) => state.rbac.resources);
  const permissions = useSelector((state: RootState) => state.rbac.permissions);
  const rbacLoading = useSelector((state: RootState) => state.rbac.loading);
  const resourcePermissions = useSelector((state: RootState) => state.rbac.resourcePermissions);
  const [expandedResources, setExpandedResources] = useState<Record<number, boolean>>({});
  const [newUserEmail, setNewUserEmail] = useState("");
  const users = useSelector((state: RootState) => state.rbac.users);
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [selectedAccountForUsers, setSelectedAccountForUsers] = useState<SubAccount | null>(null);

  useEffect(() => {
    dispatch(fetchSubAccounts())
    dispatch(fetchResources())
    dispatch(fetchPermissions())
  }, [dispatch])

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createSubAccount(createForm));
    setCreateOpen(false);
    setCreateForm({
      name: "",
      description: "",
    });
  };

  const handleManage = (account: SubAccount) => {
    setSelectedAccount(account);
    setEditForm({
      name: account.name,
      description: account.description,
    });
    setManageOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    const changes = Object.entries(editForm).reduce((acc, [key, value]) => {
      if (value !== selectedAccount[key as keyof SubAccount]) {
        acc[key as 'name' | 'description'] = value;
      }
      return acc;
    }, {} as {
      name?: string; 
      description?: string;
    });

    if (Object.keys(changes).length > 0) {
      dispatch(updateSubAccount({
        id: Number(selectedAccount.id),
        userData: changes
      }));
    }
    setManageOpen(false);
  };

  const handleDelete = (account: SubAccount) => {
    setAccountToDelete(account);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (accountToDelete) {
      dispatch(deleteSubAccount(Number(accountToDelete.id)));
    }
    setDeleteConfirmOpen(false);
    setAccountToDelete(null);
  };

  const handlePermissionChange = async (resourceId: number, permissionId: number, checked: boolean) => {
    if (!selectedAccount) return;
    
    try {
      // Update local state immediately
      const currentPermissions = resourcePermissions[resourceId] || [];
      let updatedPermissions: number[];

      if (checked) {
        // Check if parent resource has required permission
        const resource = resources.find(r => r.id === resourceId);
        if (resource?.parent_resource_id) {
          const parentResource = resources.find(r => r.id === resource.parent_resource_id);
          if (parentResource) {
            const parentPermissions = resourcePermissions[parentResource.id] || [];
            const hasParentPermission = parentPermissions.some(p => p >= permissionId);
            
            if (!hasParentPermission) {
              // Set parent resource permission first
              await dispatch(assignPermission({
                roleId: Number(selectedAccount.id),
                resourceId: parentResource.id,
                permissionId
              }));
            }
          }
        }

        // Set the selected permission
        await dispatch(assignPermission({
          roleId: Number(selectedAccount.id),
          resourceId,
          permissionId
        }));

        // Set all lower priority permissions (Rule 4)
        const lowerPermissions = permissions
          .filter(p => p.id < permissionId)
          .map(p => p.id);

        for (const lowerPermissionId of lowerPermissions) {
          await dispatch(assignPermission({
            roleId: Number(selectedAccount.id),
            resourceId,
            permissionId: lowerPermissionId
          }));
        }

        // Update local state for all affected permissions
        updatedPermissions = Array.from(new Set([...currentPermissions, permissionId, ...lowerPermissions]));
      } else {
        // Remove the selected permission
        await dispatch(removePermission({
          roleId: Number(selectedAccount.id),
          resourceId,
          permissionId
        }));

        // Remove all higher priority permissions (Rule 2)
        const higherPermissions = permissions
          .filter(p => p.id > permissionId)
          .map(p => p.id);

        for (const higherPermissionId of higherPermissions) {
          await dispatch(removePermission({
            roleId: Number(selectedAccount.id),
            resourceId,
            permissionId: higherPermissionId
          }));
        }

        // Update local state for all affected permissions
        updatedPermissions = currentPermissions.filter(p => p !== permissionId && !higherPermissions.includes(p));
      }

      // Update local state immediately
      dispatch({
        type: 'rbac/updateResourcePermissions',
        payload: {
          resourceId,
          permissions: updatedPermissions
        }
      });

      // Update all child and sub-child resources
      const updateChildResources = async (parentId: number) => {
        const childResources = resources.filter(r => r.parent_resource_id === parentId);
        for (const childResource of childResources) {
          const childPermissions = resourcePermissions[childResource.id] || [];
          const maxParentPermission = Math.max(...updatedPermissions);
          
          // Remove permissions that are higher than parent's max permission
          const validChildPermissions = childPermissions.filter(p => p <= maxParentPermission);
          
          // Update child resource permissions
          dispatch({
            type: 'rbac/updateResourcePermissions',
            payload: {
              resourceId: childResource.id,
              permissions: validChildPermissions
            }
          });

          // Update child permissions in the backend
          for (const permissionId of childPermissions) {
            if (permissionId > maxParentPermission) {
              await dispatch(removePermission({
                roleId: Number(selectedAccount.id),
                resourceId: childResource.id,
                permissionId
              }));
            }
          }

          // Recursively update sub-child resources
          await updateChildResources(childResource.id);
        }
      };

      // Start updating from the current resource
      await updateChildResources(resourceId);

      // Refresh permissions after changes
      await dispatch(fetchResourcePermissions(Number(selectedAccount.id)));
    } catch (error) {
      console.error('Failed to update permission:', error);
    }
  };

  const isResourceEnabled = (resourceId: number) => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource?.parent_resource_id) return true;

    const parentResource = resources.find(r => r.id === resource.parent_resource_id);
    if (!parentResource) return true;

    const parentPermissions = resourcePermissions[parentResource.id] || [];
    return parentPermissions.length > 0;
  };

  // const getMaxParentPermission = (resourceId: number): number => {
  //   const resource = resources.find(r => r.id === resourceId);
  //   if (!resource?.parent_resource_id) return Math.max(...permissions.map(p => p.id));

  //   const parentResource = resources.find(r => r.id === resource.parent_resource_id);
  //   if (!parentResource) return Math.max(...permissions.map(p => p.id));

  //   const parentPermissions = resourcePermissions[parentResource.id] || [];
  //   if (parentPermissions.length === 0) return 0;

  //   return Math.max(...parentPermissions);
  // };

  const isPermissionEnabled = (resourceId: number) => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource?.parent_resource_id) return true;

    const parentResource = resources.find(r => r.id === resource.parent_resource_id);
    if (!parentResource) return true;

    const parentPermissions = resourcePermissions[parentResource.id] || [];
    if (parentPermissions.length === 0) return false;

    return true;
  };

  const getResourceLevel = (resourceId: number): number => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource?.parent_resource_id) return 0;
    return 1 + getResourceLevel(resource.parent_resource_id);
  };

  const sortResourcesByLevel = (resources: Resource[]) => {
    return [...resources].sort((a, b) => getResourceLevel(a.id) - getResourceLevel(b.id));
  };

  const toggleResource = (resourceId: number) => {
    setExpandedResources(prev => ({
      ...prev,
      [resourceId]: !prev[resourceId]
    }));
  };

  useEffect(() => {
    if (selectedAccount) {
      dispatch(fetchResourcePermissions(Number(selectedAccount.id)));
      dispatch(fetchRoleUsers(Number(selectedAccount.id)));
    }
  }, [selectedAccount, dispatch]);

  const handleAddUser = async (roleId: number) => {
    if (!newUserEmail) return;

    try {
      await dispatch(assignUserToRole({
        roleId,
        email: newUserEmail
      }));
      setNewUserEmail("");
    } catch (error) {
      console.error('Failed to add user:', error);
    }
  };

  const handleRemoveUser = async (userId: number, roleId: number) => {
    if (!selectedAccount) return;

    try {
      await dispatch(removeUserFromRole({
        userId,
        roleId
      }));
    } catch (error) {
      console.error('Failed to remove user:', error);
    }
  };

  return (
    <div className="container mx-auto px-8 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Sub Accounts</h1>
        <Button 
          className="bg-purple-500 hover:bg-purple-600"
          onClick={() => setCreateOpen(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Create Sub Account
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Account Usage</h2>
          <Button variant="outline" className="text-purple-500 border-purple-500 hover:bg-purple-50">
            Upgrade Plan
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Sub Accounts */}
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 p-4 rounded-lg">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Sub Accounts</p>
              <p className="text-2xl font-bold">{subaccounts.length}/10</p>
            </div>
          </div>

          {/* Sub Account Usage */}
          <div className="flex flex-col justify-center md:items-end">
            <p className="text-lg font-medium text-slate-800">{subaccounts.length} of 10 accounts</p>
            <p className="text-sm text-slate-500">{10 - subaccounts.length} sub-accounts remaining on your current plan</p>
          </div>
        </div>
      </Card>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subaccounts.map((account: SubAccount) => (
          <Card key={account.id} className="p-6 hover:shadow-lg transition-shadow duration-200 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-4 rounded-xl">
                <Users 
                  className="h-6 w-6 text-purple-600 cursor-pointer hover:text-purple-700" 
                  onClick={() => {
                    setSelectedAccountForUsers(account);
                    setUsersModalOpen(true);
                    dispatch(fetchRoleUsers(Number(account.id)));
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Created {new Date(account.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">{account.name}</h3>
            <p className="text-sm text-slate-600 mb-6 line-clamp-2 min-h-[40px]">{account.description || 'No description available'}</p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                onClick={() => handleManage(account)}
              >
                Manage
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                onClick={() => handleDelete(account)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Sub Account Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Sub Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="create-company">Company Name</Label>
              <Input
                id="create-company"
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Input
                id="create-description"
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                required
              />
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-500 hover:bg-purple-600">
                Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manage Sub Account Dialog */}
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Sub Account</DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="flex-1 overflow-auto">
              <form onSubmit={handleUpdate} className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="manage-company" className="text-sm font-medium">Company Name</Label>
                    <Input
                      id="manage-company"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                      className="mt-1.5"
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="manage-description" className="text-sm font-medium">Description</Label>
                    <Input
                      id="manage-description"
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                      className="mt-1.5"
                      placeholder="Enter description"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1.5">
                      Provide a brief description of this sub account&apos;s purpose.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setManageOpen(false)}
                    className="px-4"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="permissions" className="flex-1 overflow-auto">
              <div className="space-y-6 mt-6">
                <div className="space-y-4">
                  {rbacLoading ? (
                    <div className="text-center py-4">Loading permissions...</div>
                  ) : (
                    sortResourcesByLevel(resources).map((resource) => {
                      const isEnabled = isResourceEnabled(resource.id);
                      const level = getResourceLevel(resource.id);
                      const hasPermissions = resourcePermissions[resource.id]?.length > 0;
                      const isExpanded = expandedResources[resource.id] || false;
                      
                      return (
                        <div 
                          key={resource.id} 
                          className={`border rounded-lg transition-all duration-200 ${
                            !isEnabled ? 'opacity-50' : ''
                          }`}
                          style={{ marginLeft: `${level * 20}px` }}
                        >
                          <div 
                            className={`p-4 cursor-pointer flex items-center justify-between ${
                              hasPermissions ? 'bg-purple-50' : ''
                            }`}
                            onClick={() => isEnabled && toggleResource(resource.id)}
                          >
                            <div>
                              <h4 className="font-medium">{resource.name}</h4>
                              <p className="text-sm text-slate-500">{resource.description}</p>
                              {resource.parent_resource_id && (
                                <p className="text-xs text-slate-400 mt-1">
                                  Requires permission on parent resource
                                </p>
                              )}
                            </div>
                            {isEnabled && (
                              <div className="flex items-center">
                                {hasPermissions && (
                                  <span className="text-xs text-purple-600 mr-2">
                                    {resourcePermissions[resource.id]?.length} permissions
                                  </span>
                                )}
                                {isExpanded ? (
                                  <ChevronDown className="h-5 w-5 text-slate-400" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-slate-400" />
                                )}
                              </div>
                            )}
                          </div>
                          
                          {isEnabled && isExpanded && (
                            <div className="p-4 border-t bg-white">
                              <div className="space-y-2">
                                {permissions.map((permission) => (
                                  <div key={permission.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${resource.id}-${permission.id}`}
                                      checked={resourcePermissions[resource.id]?.includes(permission.id) || false}
                                      onCheckedChange={(checked) => 
                                        handlePermissionChange(resource.id, permission.id, checked as boolean)
                                      }
                                      disabled={!isPermissionEnabled(resource.id)}
                                    />
                                    <label
                                      htmlFor={`${resource.id}-${permission.id}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      {permission.name}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="users" className="flex-1 overflow-auto">
              <div className="space-y-6 mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Users</h3>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="email"
                      placeholder="Enter user email"
                      className="w-64"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                    />
                    <Button
                      onClick={() => {
                        if (selectedAccount) {
                          handleAddUser(Number(selectedAccount.id));
                        }
                      }}
                      disabled={!newUserEmail}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {rbacLoading ? (
                    <div className="text-center py-4">Loading users...</div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="bg-slate-50 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                        <Users className="h-8 w-8 text-slate-400 mx-auto" />
                      </div>
                      <p className="text-slate-500 mb-4">No users assigned to this subaccount</p>
                      <Button
                        onClick={() => {
                          if (selectedAccount) {
                            handleAddUser(Number(selectedAccount.id));
                          }
                        }}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add First User
                      </Button>
                    </div>
                  ) : (
                    users.map((user) => (
                      <div
                        key={user.user_id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-purple-100 p-2 rounded-full">
                            <Users className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="font-medium">{user.email}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (selectedAccount) {
                              handleRemoveUser(user.user_id, Number(selectedAccount.id));
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Users Modal */}
      <Dialog open={usersModalOpen} onOpenChange={setUsersModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Users - {selectedAccountForUsers?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Users</h3>
              <div className="flex items-center space-x-2">
                <Input
                  type="email"
                  placeholder="Enter user email"
                  className="w-64"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
                <Button
                  onClick={() => {
                    if (selectedAccountForUsers) {
                      handleAddUser(Number(selectedAccountForUsers.id));
                    }
                  }}
                  disabled={!newUserEmail}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {rbacLoading ? (
                <div className="text-center py-4">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-slate-50 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                    <Users className="h-8 w-8 text-slate-400 mx-auto" />
                  </div>
                  <p className="text-slate-500 mb-4">No users assigned to this subaccount</p>
                  <Button
                    onClick={() => {
                      if (selectedAccountForUsers) {
                        handleAddUser(Number(selectedAccountForUsers.id));
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add First User
                  </Button>
                </div>
              ) : (
                users.map((user) => (
                  <div
                    key={user.user_id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <Users className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="font-medium">{user.email}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (selectedAccountForUsers) {
                          handleRemoveUser(user.user_id, Number(selectedAccountForUsers.id));
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Sub Account</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-slate-600">
              Are you sure you want to delete the sub account for{' '}
              <span className="font-semibold">{accountToDelete?.name}</span>?
              This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              className="bg-red-500 hover:bg-red-600"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

