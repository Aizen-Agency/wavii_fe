"use client"

import Link from "next/link"
import { Settings, Users, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react" 
import { useRouter } from "next/navigation"

export function Sidebar() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Retrieve user details from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      const userDetails = JSON.parse(user);
      setUsername(userDetails.username); // Assuming userDetails has a username field
    }
  }, []);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      setIsLoggingOut(false);
      localStorage.removeItem('user'); // Clear user data from localStorage
      router.push("/auth/login");
    }, 1000);
  };

  return (
    <div className="w-64 border-r flex flex-col">
      <div className="p-6">
        <Link href="/" className="text-2xl font-bold text-purple-600">
          Wavii
        </Link>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        <Link
          href="/agents"
          className="flex items-center px-3 py-2 text-sm rounded-lg bg-purple-50 text-purple-600 font-medium"
        >
          <Users className="w-5 h-5 mr-3" />
          All Agents
        </Link>

        <Link
          href="/subaccounts"
          className="flex items-center px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <Users className="w-5 h-5 mr-3" />
          Create Subaccounts
        </Link>

        <Link
          href="/phone-numbers"
          className="flex items-center px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <Phone className="w-5 h-5 mr-3" />
          Phone Numbers
        </Link>

        <Link
          href="/settings"
          className="flex items-center px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <Settings className="w-5 h-5 mr-3" />
          Settings
          <span className="ml-2 text-xs text-gray-400">Coming Soon</span>
        </Link>
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-sm font-medium text-purple-600">{username ? username.charAt(0).toUpperCase() : 'U'}</span>
          </div>
          <div className="truncate text-sm text-gray-700">{username || 'Guest'}</div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </div>
  )
}

