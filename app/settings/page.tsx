"use client"

import type React from "react"
import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TwilioAccounts from "./twilio-accounts"

import type { AppDispatch } from "@/store/store"
import { updateUser } from "@/store/authSlice"

// Define a type for the user data
type UserData = {
  [key: string]: string | number | object | boolean;
};

export default function SettingsPage() {
  // const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [formData, setFormData] = useState({
    name: "",
    companyPrompt: "",
    companyWebsite: "",
    retellKey: "",
    email: "",
    companyName: "",
    stripeCustomerId: "",
    logoUrl: "",
    colorScheme: "#ffffff",
    loginHeading: "",
    loginSubheading: "",
    availableCredits: 0,
  })

  useEffect(() => {
    // Load existing data from local storage
    const storedData = JSON.parse(localStorage.getItem("userData") || "{}")
    // Initialize formData with stored data
    setFormData(() => ( {
        name: storedData.name,
        companyPrompt: storedData.company_prompt,
        companyWebsite: storedData.company_website,
        retellKey: storedData.retell_key,
        email: storedData.email,
        companyName: storedData.company_name,
        stripeCustomerId: storedData.stripe_customer_id,
        logoUrl: storedData.logo_url,
        colorScheme: storedData.color_scheme,
        loginHeading: storedData.login_heading,
        loginSubheading: storedData.login_subheading,
        availableCredits: storedData.available_credits,
        
    } ))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const userData: UserData = {
      username: formData.name,
      email: formData.email,
      company_name: formData.companyName,
      stripe_customer_id: formData.stripeCustomerId,
      logo_url: formData.logoUrl,
      color_scheme: formData.colorScheme,
      login_heading: formData.loginHeading,
      login_subheading: formData.loginSubheading,
      available_credits: formData.availableCredits,
      retellKey: formData.retellKey,
    }

    try {
      const resultAction = await dispatch(updateUser({ userData }))

      if (updateUser.fulfilled.match(resultAction)) {
        const updatedData: UserData = resultAction.payload
        const storedData: UserData = JSON.parse(localStorage.getItem("userData") || "{}")

        // Store only updated keys
        const changedData = Object.keys(updatedData).reduce((acc: UserData, key: string) => {
          if (updatedData[key] !== storedData[key]) {
            acc[key] = updatedData[key]
          }
          return acc
        }, {})

        localStorage.setItem("userData", JSON.stringify({ ...storedData, ...changedData }))
        alert("User updated successfully!")
      } else {
        alert("Failed to update user.")
      }
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }

  console.log("formData", formData)
  console.log("formData retellKey", formData.retellKey)
  console.log("formData email", formData.email)
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <div className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800">Settings</div>
        </div>

        <Tabs defaultValue="user" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user">User Settings</TabsTrigger>
            <TabsTrigger value="twilio">Twilio Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="user" className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
              <div className="space-y-2">
                <div className="text-sm font-medium">Email</div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Company Name</div>
                <Input
                  type="text"
                  placeholder="Enter company name"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      companyName: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Stripe Customer ID</div>
                <Input
                  type="text"
                  placeholder="Enter Stripe customer ID"
                  value={formData.stripeCustomerId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stripeCustomerId: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Logo URL</div>
                <Input
                  type="url"
                  placeholder="Enter logo URL"
                  value={formData.logoUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      logoUrl: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Color Scheme</div>
                <Input
                  type="color"
                  value={formData.colorScheme}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      colorScheme: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Login Heading</div>
                <Input
                  type="text"
                  placeholder="Enter login heading"
                  value={formData.loginHeading}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      loginHeading: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Login Subheading</div>
                <Input
                  type="text"
                  placeholder="Enter login subheading"
                  value={formData.loginSubheading}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      loginSubheading: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Available Credits</div>
                <Input
                  type="number"
                  value={formData.availableCredits}
                  readOnly
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="twilio">
            <TwilioAccounts />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}