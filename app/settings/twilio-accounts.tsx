"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/store/store"
import {
  fetchTwilioAccounts,
  addTwilioAccount,
  updateTwilioAccount,
  deleteTwilioAccount,
} from "@/store/twilioSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2 } from "lucide-react"
import LoadingOverlay from "@/components/loadingOverlay"
import PermissionWrapper from "@/components/PermissionWrapper"

interface TwilioAccount {
  id: number;
  account_sid: string;
  auth_token: string;
  friendly_name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface TwilioAccountFormData {
  account_sid: string;
  auth_token: string;
  friendly_name: string;
  is_default: boolean;
}

export default function TwilioAccounts() {
  const dispatch = useDispatch<AppDispatch>()
  const { accounts, status, error } = useSelector((state: RootState) => state.twilio)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<number | null>(null)
  const [formData, setFormData] = useState<TwilioAccountFormData>({
    account_sid: "",
    auth_token: "",
    friendly_name: "",
    is_default: false,
  })

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchTwilioAccounts())
    }
  }, [status, dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingAccount !== null) {
      await dispatch(
        updateTwilioAccount({
          id: editingAccount,
          ...formData,
        })
      )
    } else {
      await dispatch(addTwilioAccount(formData))
    }
    setIsAddDialogOpen(false)
    setEditingAccount(null)
    resetForm()
  }

  const handleEdit = (account: TwilioAccount) => {
    setFormData({
      account_sid: account.account_sid,
      auth_token: account.auth_token,
      friendly_name: account.friendly_name,
      is_default: account.is_default,
    })
    setEditingAccount(account.id)
    setIsAddDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this Twilio account?")) {
      await dispatch(deleteTwilioAccount(id))
    }
  }

  const resetForm = () => {
    setFormData({
      account_sid: "",
      auth_token: "",
      friendly_name: "",
      is_default: false,
    })
  }

  return (
    <div className="space-y-6">
      {status === "loading" && <LoadingOverlay />}
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Twilio Accounts</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <PermissionWrapper componentName="CreateTwilio">
            <Button
              onClick={() => {
                resetForm()
                setEditingAccount(null)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Twilio Account
            </Button>
            </PermissionWrapper>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? "Edit Twilio Account" : "Add New Twilio Account"}
              </DialogTitle>
              <DialogDescription>
                Enter your Twilio account details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="friendly_name">Account Name</Label>
                <Input
                  id="friendly_name"
                  value={formData.friendly_name}
                  onChange={(e) =>
                    setFormData({ ...formData, friendly_name: e.target.value })
                  }
                  placeholder="My Twilio Account"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_sid">Account SID</Label>
                <Input
                  id="account_sid"
                  value={formData.account_sid}
                  onChange={(e) =>
                    setFormData({ ...formData, account_sid: e.target.value })
                  }
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auth_token">Auth Token</Label>
                <Input
                  id="auth_token"
                  type="password"
                  value={formData.auth_token}
                  onChange={(e) =>
                    setFormData({ ...formData, auth_token: e.target.value })
                  }
                  placeholder="Your Twilio Auth Token"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_default: checked })
                  }
                />
                <Label htmlFor="is_default">Set as default account</Label>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingAccount ? "Update Account" : "Add Account"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{account.friendly_name}</span>
                {account.is_default && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Default
                  </span>
                )}
              </CardTitle>
              <CardDescription>SID: {account.account_sid}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end space-x-2">
                <PermissionWrapper componentName="EditTwilio">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(account)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                </PermissionWrapper>
                <PermissionWrapper componentName="DeleteTwilio">
                <Button
                  variant="outline"
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(account.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                </PermissionWrapper>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {status === "failed" && (
        <div className="text-red-500 text-center">{error}</div>
      )}
    </div>
  )
} 