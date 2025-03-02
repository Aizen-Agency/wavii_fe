"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useDispatch } from 'react-redux';
import { register } from '@/store/authSlice'; // Adjust the path as necessary
import { AppDispatch } from '@/store/store'; // Import AppDispatch
import LoadingOverlay from "@/components/loadingOverlay"; // Import LoadingOverlay
import { toast } from 'react-toastify'; // Import toast for popups
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state

  const dispatch = useDispatch<AppDispatch>(); // Use AppDispatch type

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when form is submitted
    try {
      await dispatch(register({ 
        username: username, // Corrected username
        password: password,
        email: email,
        company_name: companyName
      })).unwrap();
      toast.success("Registration successful!"); // Show success popup
      router.push("/auth/login");
    } catch (error) {
      console.log(error);
      toast.error("Registration failed. Please try again."); // Show error popup
    } finally {
      setLoading(false); // Set loading to false after API call
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      {loading && <LoadingOverlay />} {/* Show loading overlay when loading */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center text-purple-600">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-lg focus:outline-none focus:ring focus:ring-purple-200"
            />
          </div> */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-lg focus:outline-none focus:ring focus:ring-purple-200"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-lg focus:outline-none focus:ring focus:ring-purple-200"
            />
          </div>
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-lg focus:outline-none focus:ring focus:ring-purple-200"
            />
          </div>
          <Button type="submit" variant="outline" className="w-full">
            Register
          </Button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account? <Link href="/auth/login" className="text-purple-600">Login</Link>
        </p>
      </div>
    </div>
  );
}
