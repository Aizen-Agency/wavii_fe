"use client"

import Link from "next/link"
import { Settings, Users, Phone, BarChart, Calendar, Home, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react" 
import PermissionWrapper from "./PermissionWrapper"
// import { useRouter } from "next/navigation"

export function Sidebar( { activeTab }: { activeTab: string } ) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [isSubaccount, setIsSubaccount] = useState(false);
  // const router = useRouter();


  useEffect(() => {
    // Retrieve user details from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      const userDetails = JSON.parse(user);
      setEmail(userDetails.email); // Assuming userDetails has a username field
      setIsSubaccount(!!userDetails.subaccountId); // Set based on whether user has subaccountId
    }
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Clear all storage items individually first
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      // Then clear everything else
      localStorage.clear();
      
      // Force navigation to login page
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // const handleTabClick = (path: string) => {
    
  // };

  return (
    <div className="w-64 border-r flex flex-col">
      <div className="p-6">
        <Link href="/" className={`text-2xl font-bold ${activeTab === '/' ? 'text-purple-600' : 'text-gray-700'}`} > 
          Wavii
        </Link>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        <Link
          href="/"
          className={`flex items-center px-3 py-2 text-sm rounded-lg ${
            activeTab === '/' ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Home className="w-5 h-5 mr-3" />
          Home
        </Link>
        <Link
          href="/analytics"
          className={`flex items-center px-3 py-2 text-sm rounded-lg ${
            activeTab === '/analytics' ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <BarChart className="w-5 h-5 mr-3" />
          Analytics
        </Link>
        <Link
          href="/phone-numbers"
          className={`flex items-center px-3 py-2 text-sm rounded-lg ${
            activeTab === '/phone-numbers' ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Phone className="w-5 h-5 mr-3" />
          Phone
        </Link>
        <Link
          href="/agents"
          className={`flex items-center px-3 py-2 text-sm rounded-lg ${
            activeTab === '/agents' ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Users className="w-5 h-5 mr-3" />
          Agents
        </Link>
        <PermissionWrapper componentName="Subaccount">
        {!isSubaccount && (
          <Link
            href="/subaccounts"
            className={`flex items-center px-3 py-2 text-sm rounded-lg ${
              activeTab === '/subaccounts' ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5 mr-3" />
            Subaccounts
          </Link>
        )}
        </PermissionWrapper>
        <Link
          href="/calendar"
          className={`flex items-center px-3 py-2 text-sm rounded-lg ${
            activeTab === '/calendar' ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Calendar className="w-5 h-5 mr-3" />
          Calendar
        </Link>
        <Link
          href="/settings"
          className={`flex items-center px-3 py-2 text-sm rounded-lg ${
            activeTab === '/settings' ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Settings className="w-5 h-5 mr-3" />
          Settings
        </Link>
        <Link
          href="/connections"
          className={`flex items-center px-3 py-2 text-sm rounded-lg ${
            activeTab === '/connections' ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <LinkIcon className="w-5 h-5 mr-3" />
          Connections
        </Link>
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-sm font-medium text-purple-600">{email ? email.charAt(0).toUpperCase() : 'U'}</span>
          </div>
          <div className="truncate text-sm text-gray-700">{email || 'Guest'}</div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </div>
  )
}

