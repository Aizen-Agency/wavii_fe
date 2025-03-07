import { Users, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useDispatch, useSelector } from "react-redux"
import { createSubAccount, fetchSubAccounts, updateSubAccount, deleteSubAccount } from "@/store/authSlice"
import { useState, useEffect } from "react"
import { AppDispatch, RootState } from "@/store/store"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SubAccount {
  id: string;
  email: string;
  company_name: string;
  available_credits: number;
  created_at: string;
}

export default function SubAccountsDashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const subaccounts = useSelector((state: RootState) => state.auth.subaccounts)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    password: "",
    email: "",
    company_name: "",
    available_credits: 0,
  })
  const [selectedAccount, setSelectedAccount] = useState<SubAccount | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    email: "",
    password: "",
    company_name: "",
    available_credits: 0,
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<SubAccount | null>(null);

  useEffect(() => {
    dispatch(fetchSubAccounts())
  }, [dispatch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(createSubAccount({
      ...formData,
      username: "  " // Always send two spaces as username
    }))
    setOpen(false)
    // Reset form
    setFormData({
      password: "",
      email: "",
      company_name: "",
      available_credits: 0,
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'available_credits' ? Number(value) : value
    }))
  }

  const handleManage = (account: SubAccount) => {
    setSelectedAccount(account);
    setEditForm({
      email: account.email,
      password: "", // Empty password by default
      company_name: account.company_name,
      available_credits: account.available_credits,
    });
    setManageOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    // Only include fields that have been changed
    const changes = Object.entries(editForm).reduce((acc, [key, value]) => {
      if (key === 'password' && value === '') return acc;
      if (value !== selectedAccount[key as keyof SubAccount]) {
        if (key === 'available_credits') {
          acc.available_credits = Number(value);
        } else {
          acc[key as 'email' | 'company_name' | 'password'] = value as string;
        }
      }
      return acc;
    }, {} as {
      email?: string;
      company_name?: string;
      available_credits?: number;
      password?: string;
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

  return (
    <div className="container mx-auto px-8 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Sub Accounts</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-500 hover:bg-purple-600">
              <UserPlus className="mr-2 h-4 w-4" />
              Create Sub Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Sub Account</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="available_credits">Available Credits</Label>
                <Input
                  id="available_credits"
                  name="available_credits"
                  type="number"
                  value={formData.available_credits}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-500 hover:bg-purple-600">
                  Create
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
          <Card key={account.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <span className="text-sm text-slate-500">
                Created: {new Date(account.created_at).toLocaleDateString()}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800">{account.company_name}</h3>
            <p className="text-sm text-slate-500 mt-1">{account.email}</p>
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm">
                <span className="text-slate-500">Credits: </span>
                <span className="font-medium">{account.available_credits}</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-purple-500 border-purple-500 hover:bg-purple-50"
                  onClick={() => handleManage(account)}
                >
                  Manage
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-500 border-red-500 hover:bg-red-50"
                  onClick={() => handleDelete(account)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage Sub Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="manage-email">Email</Label>
              <Input
                id="manage-email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manage-password">New Password (optional)</Label>
              <Input
                id="manage-password"
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm(prev => ({
                  ...prev,
                  password: e.target.value
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manage-company">Company Name</Label>
              <Input
                id="manage-company"
                value={editForm.company_name}
                onChange={(e) => setEditForm(prev => ({
                  ...prev,
                  company_name: e.target.value
                }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manage-credits">Available Credits</Label>
              <Input
                id="manage-credits"
                type="number"
                value={editForm.available_credits}
                onChange={(e) => setEditForm(prev => ({
                  ...prev,
                  available_credits: Number(e.target.value)
                }))}
                required
              />
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <Button type="button" variant="outline" onClick={() => setManageOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-500 hover:bg-purple-600">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Sub Account</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-slate-600">
              Are you sure you want to delete the sub account for{' '}
              <span className="font-semibold">{accountToDelete?.company_name}</span>?
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

